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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const plans = await readPlans();
    const plan = plans.find(
      (p) => p.id === id || p.tier.toUpperCase() === id.toUpperCase()
    );

    if (!plan) {
      return Response.json(
        { success: false, error: "Plan not found." },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: plan });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.message || "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const plans = await readPlans();
    const index = plans.findIndex(
      (p) => p.id === id || p.tier.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      return Response.json(
        { success: false, error: "Plan not found." },
        { status: 404 }
      );
    }

    const existing = plans[index];

    // Compute prices
    const monthlyPrice =
      body.monthlyPrice !== undefined
        ? Math.max(0, Number(body.monthlyPrice))
        : existing.monthlyPrice;
    const yearlyPrice =
      body.yearlyPrice !== undefined
        ? Math.max(0, Number(body.yearlyPrice))
        : existing.yearlyPrice;
    const annualTotal = yearlyPrice * 12;

    const discountPercent =
      monthlyPrice > 0 && yearlyPrice < monthlyPrice
        ? Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100)
        : 0;

    const updatedPlan = {
      ...existing,
      name: body.name ? body.name.trim() : existing.name,
      nameGujarati: body.nameGujarati ? body.nameGujarati.trim() : existing.nameGujarati,
      subtitle: body.subtitle ? body.subtitle.trim() : existing.subtitle,
      subtitleGujarati: body.subtitleGujarati ? body.subtitleGujarati.trim() : existing.subtitleGujarati,
      monthlyPrice,
      yearlyPrice,
      annualTotal,
      discountPercent,
      monthlyPaise: monthlyPrice * 100,
      yearlyPaise: annualTotal * 100,
      maxCompanies:
        body.maxCompanies !== undefined ? Number(body.maxCompanies) : existing.maxCompanies,
      maxInvoicesPerYear:
        body.maxInvoicesPerYear !== undefined
          ? Number(body.maxInvoicesPerYear)
          : existing.maxInvoicesPerYear,
      maxUsers:
        body.maxUsers !== undefined ? Number(body.maxUsers) : existing.maxUsers,
      maxGodowns:
        body.maxGodowns !== undefined ? Number(body.maxGodowns) : existing.maxGodowns,
      features: Array.isArray(body.features) ? body.features : existing.features,
      featuresGujarati: Array.isArray(body.featuresGujarati)
        ? body.featuresGujarati
        : existing.featuresGujarati,
      entitlements: body.entitlements ? { ...existing.entitlements, ...body.entitlements } : existing.entitlements,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      isPopular: body.isPopular !== undefined ? Boolean(body.isPopular) : existing.isPopular,
      badge: body.badge !== undefined ? (body.badge ? body.badge.trim().toUpperCase() : null) : existing.badge,
      badgeColor: body.badgeColor || existing.badgeColor,
      accentColor: body.accentColor || existing.accentColor,
      updatedAt: new Date().toISOString(),
    };

    if (updatedPlan.isPopular && !existing.isPopular) {
      for (const p of plans) {
        if (p.id !== existing.id) {
          p.isPopular = false;
        }
      }
    }

    plans[index] = updatedPlan;
    await persistPlans(plans);

    return Response.json({
      success: true,
      data: updatedPlan,
      message: "Plan updated successfully",
    });
  } catch (error: any) {
    console.error("Update plan error:", error);
    return Response.json(
      { success: false, error: error?.message || "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const plans = await readPlans();
    const index = plans.findIndex(
      (p) => p.id === id || p.tier.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      return Response.json(
        { success: false, error: "Plan not found." },
        { status: 404 }
      );
    }

    const target = plans[index];

    // Do not physically delete default system tiers if desired, mark inactive instead or filter out
    if (target.isDefault) {
      // Toggle inactive
      target.isActive = false;
      target.updatedAt = new Date().toISOString();
      plans[index] = target;
      await persistPlans(plans);
      return Response.json({
        success: true,
        message: "Default plan archived and deactivated.",
        data: target,
      });
    }

    // Delete custom plan
    plans.splice(index, 1);
    await persistPlans(plans);

    return Response.json({
      success: true,
      message: "Plan deleted successfully.",
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.message || "Failed to delete plan" },
      { status: 500 }
    );
  }
}
