import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const res = await fetch(`${BACKEND_BASE}/super-admin/plans`, {
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return Response.json(
      { success: res.ok, data: Array.isArray(data) ? data : data?.data || [] },
      { status: res.status }
    );
  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.message || "Failed to load plans from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${BACKEND_BASE}/super-admin/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(
      { success: res.ok, data: data?.data || data },
      { status: res.status }
    );
  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.message || "Failed to create plan in database" },
      { status: 500 }
    );
  }
}
