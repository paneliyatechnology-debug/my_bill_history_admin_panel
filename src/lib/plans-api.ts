import type { SubscriptionPlanItem } from "../shared-types/superadmin";

export async function fetchAllPlans(): Promise<SubscriptionPlanItem[]> {
  const res = await fetch("/api/superadmin/plans", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch plans: ${res.statusText}`);
  }
  const json = await res.json();
  return json?.data || [];
}

export async function createNewPlan(
  payload: Partial<SubscriptionPlanItem>
): Promise<SubscriptionPlanItem> {
  const res = await fetch("/api/superadmin/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error || "Failed to create new plan");
  }
  return json.data;
}

export async function updateExistingPlan(
  id: string,
  payload: Partial<SubscriptionPlanItem>
): Promise<SubscriptionPlanItem> {
  const res = await fetch(`/api/superadmin/plans/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error || "Failed to update plan");
  }
  return json.data;
}

export async function deleteExistingPlan(id: string): Promise<void> {
  const res = await fetch(`/api/superadmin/plans/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error || "Failed to delete plan");
  }
}
