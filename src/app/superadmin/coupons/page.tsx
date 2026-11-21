"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  validTiers: string[];
  minAmount: number;
  maxDiscount: number;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsManagementPage() {
  const { setActionSuccess, setActionError, plans } = useSuperAdmin();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [formValue, setFormValue] = useState(20);
  const [formMinAmount, setFormMinAmount] = useState(5000);
  const [formMaxDiscount, setFormMaxDiscount] = useState(3000);
  const [formUsageLimit, setFormUsageLimit] = useState(100);
  const [formValidUntil, setFormValidUntil] = useState("2027-12-31");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get("/super-admin/coupons");
      setCoupons(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Failed to load coupons", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;

    try {
      setIsSubmitting(true);
      await apiClient.post("/super-admin/coupons", {
        code: formCode.trim().toUpperCase(),
        description: formDescription,
        discountType: formType,
        discountValue: Number(formValue),
        minAmount: Number(formMinAmount),
        maxDiscount: Number(formMaxDiscount),
        usageLimit: Number(formUsageLimit),
        validUntil: new Date(formValidUntil).toISOString(),
        validTiers: ["WHOLESALE_PRO", "DISTRIBUTION_ENTERPRISE", "MANUFACTURING_SUITE"],
      });

      setActionSuccess(`Coupon ${formCode.toUpperCase()} created successfully.`);
      setIsCreateOpen(false);
      setFormCode("");
      setFormDescription("");
      fetchCoupons();
    } catch (err: any) {
      setActionError(err?.message || "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCoupon = async (coupon: CouponItem) => {
    try {
      await apiClient.patch(`/super-admin/coupons/${coupon.id}`, {
        isActive: !coupon.isActive,
      });
      setActionSuccess(`Coupon ${coupon.code} updated.`);
      fetchCoupons();
    } catch (err: any) {
      setActionError(err?.message || "Failed to toggle coupon.");
    }
  };

  const handleDeleteCoupon = async (coupon: CouponItem) => {
    if (!confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) return;
    try {
      await apiClient.delete(`/super-admin/coupons/${coupon.id}`);
      setActionSuccess(`Coupon ${coupon.code} deleted.`);
      fetchCoupons();
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coupons & Promotions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and track promotional discount voucher codes for platform subscription onboarding.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">Coupon Code</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 text-center font-medium">Discount</th>
                <th className="py-3 px-4 text-center font-medium">Redeemed</th>
                <th className="py-3 px-4 font-medium">Valid Until</th>
                <th className="py-3 px-4 text-center font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active discount coupons configured.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#1677E8] border border-blue-200/80 rounded font-medium text-xs">
                        {c.code}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-xs font-normal">
                      {c.description}
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-4 text-center font-medium text-slate-800 text-xs">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </td>

                    {/* Usage */}
                    <td className="py-3 px-4 text-center text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{c.usedCount}</span> / {c.usageLimit}
                    </td>

                    {/* Valid Until */}
                    <td className="py-3 px-4 text-slate-400 font-normal text-xs">
                      {new Date(c.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleCoupon(c)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs cursor-pointer ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Coupon</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. SUMMER2026"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 20% discount on annual plan subscriptions"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Value ({formType === "PERCENTAGE" ? "%" : "₹"})</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formType === "PERCENTAGE" ? 100 : 50000}
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
