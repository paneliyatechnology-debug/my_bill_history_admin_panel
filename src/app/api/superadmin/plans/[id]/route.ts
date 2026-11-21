import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${BACKEND_BASE}/super-admin/plans/${id}`, {
      method: "PATCH",
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
      { success: false, error: error?.message || "Failed to update plan in database" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${BACKEND_BASE}/super-admin/plans/${id}`, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
    });

    const data = await res.json();
    return Response.json(
      { success: res.ok, ...(typeof data === "object" ? data : {}) },
      { status: res.status }
    );
  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.message || "Failed to delete plan in database" },
      { status: 500 }
    );
  }
}
