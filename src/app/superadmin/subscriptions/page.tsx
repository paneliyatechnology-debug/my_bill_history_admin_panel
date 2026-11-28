"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";

interface SubscriptionItem {
  id: string;
  tenantId: string;
  organizationId: string | null;
  organizationName: string;
  legalName: string | null;
  primaryPhone: string;
  primaryEmail: string | null;
  tier: string;
  planName: string;
  billingCycle: string;
  amount: number;
  currency: string;
  subscriptionStart: string;
  subscriptionEnds: string;
  isActive: boolean;
  subscriptionStatus: "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED";
  paymentStatus: string;
  totalCompanies: number;
  totalUsers: number;
  lastPaymentDate: string | null;
  receiptNo: string | null;
}

export default function SubscriptionsManagementPage() {
  const { plans, setActionSuccess, setActionError } = useSuperAdmin();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  // Action Drawer / Modal State
  const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);
  const [actionType, setActionType] = useState<"change_plan" | "extend" | "suspend" | "reactivate" | "cancel">("extend");
  const [selectedTier, setSelectedTier] = useState("WHOLESALE_PRO");
  const [extendDays, setExtendDays] = useState(30);
  const [actionReason, setActionReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (tierFilter !== "all") params.tier = tierFilter;

      const res: any = await apiClient.get("/super-admin/subscriptions", params);
      setSubscriptions(res?.data || []);
    } catch (err: any) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, tierFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleExecuteAction = async () => {
    if (!selectedSub) return;
    try {
      setIsSubmittingAction(true);
      await apiClient.post(`/super-admin/subscriptions/${selectedSub.tenantId}/action`, {
        action: actionType,
        newTier: actionType === "change_plan" ? selectedTier : undefined,
        extendDays: actionType === "extend" ? Number(extendDays) : undefined,
        reason: actionReason || `SuperAdmin ${actionType} action`,
      });
      setActionSuccess(`Subscription ${actionType.replace("_", " ")} applied successfully.`);
      setSelectedSub(null);
      fetchSubscriptions();
    } catch (err: any) {
      setActionError(err?.message || "Failed to update subscription.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return "₹" + amount.toLocaleString("en-IN");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscriptions</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Manage organization subscription lifecycles, upgrades, renewals, and entitlement status.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#1677E8]/60 hover:bg-blue-50/40 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className={`w-4 h-4 text-[#1677E8] ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <DataTable<SubscriptionItem>
        data={subscriptions}
        isLoading={isLoading}
        keyExtractor={(sub) => sub.id}
        searchPlaceholder="Search organization, phone, plan..."
        searchKeys={["organizationName", "primaryPhone", "planName", "tier"]}
        themeColor="blue"
        exportable
        exportFileName="subscriptions"
        emptyMessage="No subscriptions found matching the filter criteria."
        filtersSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1677E8] focus:border-[#1677E8] cursor-pointer shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1677E8] focus:border-[#1677E8] cursor-pointer shadow-2xs hidden md:block"
            >
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.tier} value={p.tier}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        }
        columns={[
          {
            id: "organizationName",
            header: "Organization",
            accessorKey: "organizationName",
            sortable: true,
            cell: (sub) => (
              <div>
                <p className="font-semibold text-slate-900 text-xs">{sub.organizationName}</p>
                <p className="text-[11px] text-slate-500 tabular-nums">{sub.primaryPhone}</p>
              </div>
            ),
          },
          {
            id: "planName",
            header: "Plan & Cycle",
            accessorKey: "planName",
            sortable: true,
            cell: (sub) => (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 text-xs">{sub.planName}</span>
                <span className="text-[10px] text-slate-500">({sub.billingCycle})</span>
              </div>
            ),
          },
          {
            id: "subscriptionStart",
            header: "Subscription Start",
            accessorKey: "subscriptionStart",
            sortable: true,
            cell: (sub) => <span className="text-slate-500 text-xs">{formatDate(sub.subscriptionStart)}</span>,
          },
          {
            id: "subscriptionEnds",
            header: "Expiry Date",
            accessorKey: "subscriptionEnds",
            sortable: true,
            cell: (sub) => <span className="text-slate-500 text-xs">{formatDate(sub.subscriptionEnds)}</span>,
          },
          {
            id: "amount",
            header: "Amount",
            accessorKey: "amount",
            sortable: true,
            align: "right",
            className: "tabular-nums font-bold text-slate-900 text-xs",
            cell: (sub) => (sub.amount > 0 ? formatCurrency(sub.amount) : "₹0 (Trial)"),
          },
          {
            id: "subscriptionStatus",
            header: "Status",
            accessorKey: "subscriptionStatus",
            sortable: true,
            align: "center",
            cell: (sub) => (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs ${
                  sub.subscriptionStatus === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : sub.subscriptionStatus === "TRIAL"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : sub.subscriptionStatus === "EXPIRED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {sub.subscriptionStatus}
              </span>
            ),
          },
          {
            id: "actions",
            header: "Actions",
            align: "right",
            cell: (sub) => (
              <button
                onClick={() => {
                  setSelectedSub(sub);
                  setSelectedTier(sub.tier);
                  setActionType("extend");
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-[#1677E8] text-[#1677E8] hover:text-white border border-blue-200 hover:border-[#1677E8] rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Manage
              </button>
            ),
          },
        ] as ColumnDef<SubscriptionItem>[]}
      />

      {/* Subscription Action Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-4 border-t-[#1677E8] shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-blue-50/40 via-white to-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Subscription</h3>
                <p className="text-xs text-slate-500">{selectedSub.organizationName}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">Select Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("extend")}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      actionType === "extend" ? "bg-[#1677E8] text-white border-[#1677E8] shadow-xs" : "bg-[#F8FAFC] text-slate-900 border-[#E2E8F0] hover:bg-blue-50 hover:text-[#1677E8]"
                    }`}
                  >
                    Extend Validity
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("change_plan")}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      actionType === "change_plan" ? "bg-[#1677E8] text-white border-[#1677E8] shadow-xs" : "bg-[#F8FAFC] text-slate-900 border-[#E2E8F0] hover:bg-blue-50 hover:text-[#1677E8]"
                    }`}
                  >
                    Change Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType(selectedSub.isActive ? "suspend" : "reactivate")}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      actionType === "suspend" || actionType === "reactivate" ? "bg-[#1677E8] text-white border-[#1677E8] shadow-xs" : "bg-[#F8FAFC] text-slate-900 border-[#E2E8F0] hover:bg-blue-50 hover:text-[#1677E8]"
                    }`}
                  >
                    {selectedSub.isActive ? "Suspend" : "Reactivate"}
                  </button>
                </div>
              </div>

              {actionType === "extend" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Extend By Days</label>
                  <select
                    value={extendDays}
                    onChange={(e) => setExtendDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-slate-900 outline-none focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
                  >
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={90}>90 Days (1 Quarter)</option>
                    <option value={365}>365 Days (1 Year)</option>
                  </select>
                </div>
              )}

              {actionType === "change_plan" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Target Subscription Plan</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-slate-900 outline-none focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
                  >
                    {plans.map((p) => (
                      <option key={p.tier} value={p.tier}>
                        {p.name} ({p.yearlyPrice > 0 ? `₹${p.yearlyPrice}/yr` : "Free Trial"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Reason / Admin Note</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Approved extension by management"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-slate-900 outline-none focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAction ? "Applying..." : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
