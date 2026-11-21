import { NextRequest } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import * as path from "path";

export const dynamic = "force-dynamic";

const PLANS_FILE = path.join(process.cwd(), "data", "subscription-plans.json");
const BACKEND_PLANS_FILE = path.resolve(
  process.cwd(),
  "..",
  "Billing_backend",
  "data",
  "subscription-plans.json"
);

async function readPlans(): Promise<any[]> {
  try {
    const raw = await readFile(PLANS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function persistPlans(plans: any[]): Promise<void> {
  const data = JSON.stringify(plans, null, 2);
  try {
    await mkdir(path.dirname(PLANS_FILE), { recursive: true });
    await writeFile(PLANS_FILE, data, "utf-8");
  } catch (err) {
    console.warn("[plans] Failed to save to local data path:", err);
  }

  try {
    await mkdir(path.dirname(BACKEND_PLANS_FILE), { recursive: true });
    await writeFile(BACKEND_PLANS_FILE, data, "utf-8");
  } catch (err) {
    console.warn("[plans] Failed to sync to backend data path:", err);
  }
}

export async function GET() {
  try {
    const plans = await readPlans();
    return Response.json({
      success: true,
      data: plans,
      total: plans.length,
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.message || "Failed to load plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return Response.json(
        { success: false, error: "Plan name is required." },
        { status: 400 }
      );
    }

    const plans = await readPlans();

    // Auto-generate tier key if not provided or clean it
    let tierKey = (body.tier || body.name)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_")
      .replace(/_+/g, "_");

    if (!tierKey) {
      tierKey = `PLAN_${Date.now()}`;
    }

    // Check if tier already exists
    if (plans.some((p) => p.tier.toUpperCase() === tierKey.toUpperCase())) {
      tierKey = `${tierKey}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // Generate unique ID slug
    const idSlug = (body.id || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    const id = plans.some((p) => p.id === idSlug)
      ? `${idSlug}-${Date.now().toString().slice(-4)}`
      : idSlug;

    const monthlyPrice = Math.max(0, Number(body.monthlyPrice) || 0);
    const yearlyPrice = Math.max(0, Number(body.yearlyPrice) || 0);
    const annualTotal = yearlyPrice * 12;

    const newPlan = {
      id,
      tier: tierKey,
      name: body.name.trim(),
      nameGujarati: (body.nameGujarati || body.name).trim(),
      subtitle: (body.subtitle || `${body.name} Subscription Tier`).trim(),
      subtitleGujarati: (body.subtitleGujarati || body.subtitle || "").trim(),
      monthlyPrice,
      yearlyPrice,
      annualTotal,
      discountPercent:
        monthlyPrice > 0 && yearlyPrice < monthlyPrice
          ? Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100)
          : 0,
      monthlyPaise: monthlyPrice * 100,
      yearlyPaise: annualTotal * 100,
      maxCompanies: body.maxCompanies !== undefined ? Number(body.maxCompanies) : 1,
      maxInvoicesPerYear:
        body.maxInvoicesPerYear !== undefined ? Number(body.maxInvoicesPerYear) : -1,
      maxUsers: body.maxUsers !== undefined ? Number(body.maxUsers) : 2,
      maxGodowns: body.maxGodowns !== undefined ? Number(body.maxGodowns) : 1,
      features: Array.isArray(body.features)
        ? body.features.filter((f: any) => typeof f === "string" && f.trim().length > 0)
        : [],
      featuresGujarati: Array.isArray(body.featuresGujarati)
        ? body.featuresGujarati.filter((f: any) => typeof f === "string" && f.trim().length > 0)
        : [],
      entitlements: body.entitlements || {
        posBilling: true,
        gstReports: true,
        barcodeThermal: true,
        doubleEntryLedgers: false,
        eInvoiceEwaybill: false,
        stockTransfers: false,
        manufacturingBom: false,
        whatsAppReminders: false,
        customThemes: true,
        prioritySupport: false,
      },
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      isPopular: Boolean(body.isPopular),
      badge: body.badge ? body.badge.trim().toUpperCase() : null,
      badgeColor: body.badgeColor || "bg-blue-50 text-blue-700 border-blue-200",
      accentColor: body.accentColor || "#1677E8",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If marked as popular, remove isPopular from other plans if requested
    if (newPlan.isPopular) {
      for (const p of plans) {
        p.isPopular = false;
      }
    }

    plans.push(newPlan);
    await persistPlans(plans);

    return Response.json({
      success: true,
      data: newPlan,
      message: "Plan created successfully",
    });
  } catch (error: any) {
    console.error("Create plan error:", error);
    return Response.json(
      { success: false, error: error?.message || "Failed to create plan" },
      { status: 500 }
    );
  }
}
