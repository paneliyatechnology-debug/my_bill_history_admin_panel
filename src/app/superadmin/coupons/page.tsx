"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";

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
          <p className="text-xs text-slate-500 mt-1 font-normal">
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

      <DataTable<CouponItem>
        data={coupons}
        isLoading={isLoading}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search coupon code, description..."
        searchKeys={["code", "description"]}
        themeColor="blue"
        exportable
        exportFileName="coupons"
        emptyMessage="No active discount coupons configured."
        columns={[
          {
            id: "code",
            header: "Coupon Code",
            accessorKey: "code",
            sortable: true,
            cell: (c) => (
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#1677E8] border border-blue-200 rounded-md tabular-nums font-bold text-xs">
                {c.code}
              </span>
            ),
          },
          {
            id: "description",
            header: "Description",
            accessorKey: "description",
            className: "text-slate-500 max-w-xs truncate text-xs",
          },
          {
            id: "discountValue",
            header: "Discount",
            accessorKey: "discountValue",
            sortable: true,
            align: "center",
            className: "tabular-nums font-bold text-slate-900 text-xs",
            cell: (c) => (c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`),
          },
          {
            id: "usedCount",
            header: "Redeemed",
            accessorKey: "usedCount",
            sortable: true,
            align: "center",
            cell: (c) => (
              <span className="text-xs tabular-nums text-slate-500">
                <span className="font-bold text-slate-900">{c.usedCount}</span> / {c.usageLimit}
              </span>
            ),
          },
          {
            id: "validUntil",
            header: "Valid Until",
            accessorKey: "validUntil",
            sortable: true,
            cell: (c) => (
              <span className="text-slate-500 text-xs">
                {new Date(c.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            ),
          },
          {
            id: "isActive",
            header: "Status",
            accessorKey: "isActive",
            sortable: true,
            align: "center",
            cell: (c) => (
              <button
                onClick={() => handleToggleCoupon(c)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs cursor-pointer ${
                  c.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {c.isActive ? "Active" : "Disabled"}
              </button>
            ),
          },
          {
            id: "actions",
            header: "Actions",
            align: "right",
            cell: (c) => (
              <button
                onClick={() => handleDeleteCoupon(c)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Coupon"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ),
          },
        ] as ColumnDef<CouponItem>[]}
      />

      {/* Create Coupon Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white rounded-2xl border border-slate-200/90 border-t-4 border-t-[#1677E8] shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-blue-50/40 via-white to-white">
              <h3 className="text-base font-bold text-slate-900">Create New Coupon</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. SUMMER2026"
                  className="w-full px-3 py-2 text-xs tabular-nums uppercase bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 20% discount on annual plan subscriptions"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Value ({formType === "PERCENTAGE" ? "%" : "₹"})</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formType === "PERCENTAGE" ? 100 : 50000}
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
