import type { SubscriptionPlanItem } from "../shared-types/superadmin";
import { apiClient } from "./api-client";

export async function fetchAllPlans(): Promise<SubscriptionPlanItem[]> {
  try {
    const res = await apiClient.get<any>("/super-admin/plans");
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
  } catch (err: any) {
    console.error("Failed to fetch plans from backend:", err);
    throw err;
  }
}

export async function createNewPlan(
  payload: Partial<SubscriptionPlanItem>
): Promise<SubscriptionPlanItem> {
  const res = await apiClient.post<any>("/super-admin/plans", payload);
  return res?.data || res;
}

export async function updateExistingPlan(
  id: string,
  payload: Partial<SubscriptionPlanItem>
): Promise<SubscriptionPlanItem> {
  const res = await apiClient.patch<any>(`/super-admin/plans/${id}`, payload);
  return res?.data || res;
}

export async function deleteExistingPlan(id: string): Promise<void> {
  await apiClient.delete(`/super-admin/plans/${id}`);
}
