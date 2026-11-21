"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

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
          <p className="text-xs text-slate-500 mt-1">
            Manage organization subscription lifecycles, upgrades, renewals, and entitlement status.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
        >
          <svg className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organization or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1677E8] outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer hidden md:block"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.tier} value={p.tier}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{subscriptions.length}</span> subscriptions
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">Organization</th>
                <th className="py-3 px-4 font-medium">Plan & Cycle</th>
                <th className="py-3 px-4 font-medium">Subscription Start</th>
                <th className="py-3 px-4 font-medium">Expiry Date</th>
                <th className="py-3 px-4 text-right font-medium">Amount</th>
                <th className="py-3 px-4 text-center font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No subscriptions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Organization */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{sub.organizationName}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{sub.primaryPhone}</p>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 text-xs">{sub.planName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({sub.billingCycle})</span>
                      </div>
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-4 text-slate-400 font-normal text-xs">
                      {formatDate(sub.subscriptionStart)}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-4 text-slate-400 font-normal text-xs">
                      {formatDate(sub.subscriptionEnds)}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-medium text-slate-900 text-xs">
                      {sub.amount > 0 ? formatCurrency(sub.amount) : "₹0 (Trial)"}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs ${
                          sub.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sub.subscriptionStatus === "TRIAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : sub.subscriptionStatus === "EXPIRED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {sub.subscriptionStatus}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setSelectedTier(sub.tier);
                          setActionType("extend");
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#1677E8] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Action Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Subscription</h3>
                <p className="text-xs text-slate-500">{selectedSub.organizationName}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("extend")}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      actionType === "extend" ? "bg-[#1677E8] text-white border-[#1677E8]" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Extend Validity
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType("change_plan")}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      actionType === "change_plan" ? "bg-[#1677E8] text-white border-[#1677E8]" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Change Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType(selectedSub.isActive ? "suspend" : "reactivate")}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      actionType === "suspend" || actionType === "reactivate" ? "bg-[#1677E8] text-white border-[#1677E8]" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {selectedSub.isActive ? "Suspend" : "Reactivate"}
                  </button>
                </div>
              </div>

              {actionType === "extend" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Extend By Days</label>
                  <select
                    value={extendDays}
                    onChange={(e) => setExtendDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Subscription Plan</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Admin Note</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Approved extension by management"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
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
      )}
    </div>
  );
}
