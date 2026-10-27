"use client";

import React, { useState, useEffect } from "react";

export interface EditTenantPayload {
  organizationName: string;
  legalName?: string;
  primaryPhone: string;
  primaryEmail?: string;
  subscriptionTier: string;
  subscriptionEnds?: string;
  isActive: boolean;
}

interface TenantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any | null;
  onSave: (payload: EditTenantPayload) => Promise<void>;
  isLoading: boolean;
  lang?: "en" | "gu";
}

export function TenantEditModal({
  isOpen,
  onClose,
  tenant,
  onSave,
  isLoading,
  lang = "en",
}: TenantEditModalProps) {
  const [formData, setFormData] = useState<EditTenantPayload>({
    organizationName: "",
    legalName: "",
    primaryPhone: "",
    primaryEmail: "",
    subscriptionTier: "TRIAL",
    subscriptionEnds: "",
    isActive: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Sync form state when tenant changes or modal opens
  useEffect(() => {
    if (tenant) {
      const org = tenant.organizations?.[0];
      const comp = org?.companies?.[0];
      const expiryStr = tenant.subscriptionEnds
        ? new Date(tenant.subscriptionEnds).toISOString().split("T")[0]
        : "";

      setFormData({
        organizationName: org?.name || comp?.tradeName || "",
        legalName: org?.legalName || comp?.legalName || "",
        primaryPhone: tenant.primaryPhone || "",
        primaryEmail: tenant.primaryEmail || "",
        subscriptionTier: tenant.subscriptionTier || "TRIAL",
        subscriptionEnds: expiryStr,
        isActive: tenant.isActive ?? true,
      });
      setFormError(null);
    }
  }, [tenant, isOpen]);

  if (!isOpen || !tenant) return null;

  const isMasterTenant =
    tenant.id === "3ecc34a6-da03-4a23-a2f9-c3c662b62327" ||
    tenant.primaryPhone === "9999900000" ||
    tenant.primaryEmail === "superadmin@billing.local";

  const handleQuickExpiry = (daysToAdd: number) => {
    const base = formData.subscriptionEnds ? new Date(formData.subscriptionEnds) : new Date();
    const target = new Date(base.getTime() + daysToAdd * 86400000);
    setFormData((prev) => ({
      ...prev,
      subscriptionEnds: target.toISOString().split("T")[0],
    }));
  };

  const handleSetYear = (year: number) => {
    const target = new Date(year, 11, 31);
    setFormData((prev) => ({
      ...prev,
      subscriptionEnds: target.toISOString().split("T")[0],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.organizationName.trim()) {
      setFormError(lang === "gu" ? "કૃપા કરીને સંસ્થાનું નામ દાખલ કરો" : "Organization Name is required");
      return;
    }

    const cleanPhone = formData.primaryPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setFormError(lang === "gu" ? "કૃપા કરીને માન્ય 10-અંકનો ફોન નંબર દાખલ કરો" : "Enter a valid 10-digit phone number");
      return;
    }

    try {
      await onSave(formData);
    } catch (err: any) {
      setFormError(err.message || "Failed to update tenant");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-200">
              ✏️
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>{lang === "gu" ? "ટેનન્ટ વિગતો એડિટ કરો" : "Edit Tenant Details"}</span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {tenant.id.slice(0, 8)}...
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                {lang === "gu"
                  ? "સંસ્થા, સંપર્ક, લાયસન્સ પ્લાન અને સ્ટેટસ અપડેટ કરો"
                  : "Update organization, contact info, subscription tier, and active status"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-sm font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-sans">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 animate-in fade-in">
              <span className="text-sm leading-none">⚠️</span>
              <span className="font-medium flex-1">{formError}</span>
            </div>
          )}

          {/* Master HQ Warning banner if applicable */}
          {isMasterTenant && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <span className="font-medium">
                {lang === "gu"
                  ? "આ મુખ્ય પ્લેટફોર્મ માસ્ટર ટેનન્ટ છે. સ્ટેટસ સક્રિય રહેશે."
                  : "This is the master platform tenant. Status remains permanently protected."}
              </span>
            </div>
          )}

          {/* Section 1: Business / Organization Details */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <span>🏢</span>
              <span>{lang === "gu" ? "સંસ્થા અને વેપાર વિગતો" : "Organization & Business"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "સંસ્થા / ટ્રેડ નામ" : "Organization / Trade Name"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="e.g. Shree Radhe Traders"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "કાનૂની નામ (Legal Name)" : "Legal Entity Name"}
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="e.g. Shree Radhe Traders Pvt Ltd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <span>📞</span>
              <span>{lang === "gu" ? "સંપર્ક માહિતી" : "Primary Contact Details"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "પ્રાથમિક ફોન નંબર" : "Primary Phone"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "ઇમેઇલ એડ્રેસ" : "Primary Email"}
                </label>
                <input
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                  placeholder="admin@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Subscription Plan & Validity */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <span>👑</span>
              <span>{lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન અને માન્યતા" : "Subscription Plan & Expiry"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "સબ્સ્ક્રિપ્શન ટાયર" : "Subscription Tier"}
                </label>
                <select
                  value={formData.subscriptionTier}
                  onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                >
                  <option value="TRIAL">Trial (30-day Free)</option>
                  <option value="RETAIL_BASIC">Retail Basic</option>
                  <option value="WHOLESALE_PRO">Wholesale Pro</option>
                  <option value="DISTRIBUTION_ENTERPRISE">Distribution Enterprise</option>
                  <option value="MANUFACTURING_SUITE">Manufacturing Suite (Full Features)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === "gu" ? "સમાપ્તિ તારીખ" : "Expiry Date (YYYY-MM-DD)"}
                </label>
                <input
                  type="date"
                  value={formData.subscriptionEnds}
                  onChange={(e) => setFormData({ ...formData, subscriptionEnds: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Quick Extension Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 items-center">
              <span className="text-[11px] text-slate-400 font-medium mr-1">
                {lang === "gu" ? "ઝડપી વધારો:" : "Quick Extend:"}
              </span>
              <button
                type="button"
                onClick={() => handleQuickExpiry(30)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(90)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                +90 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpiry(365)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                +1 Year
              </button>
              <button
                type="button"
                onClick={() => handleSetYear(2030)}
                className="px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Year 2030
              </button>
              <button
                type="button"
                onClick={() => handleSetYear(2100)}
                className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Lifetime (2100)
              </button>
            </div>
          </div>

          {/* Section 4: Status (Active vs Suspended) */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <span>⚡</span>
              <span>{lang === "gu" ? "ટેનન્ટ સ્ટેટસ" : "Tenant Access Status"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.isActive
                    ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="tenantStatus"
                  checked={formData.isActive}
                  onChange={() => setFormData({ ...formData, isActive: true })}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{lang === "gu" ? "સક્રિય (Active)" : "Active"}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                    {lang === "gu" ? "બધા યુઝર્સ લોગિન કરી શકે છે" : "Users can log in normally"}
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isMasterTenant
                    ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
                    : !formData.isActive
                    ? "bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 text-rose-800 cursor-pointer"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  name="tenantStatus"
                  disabled={isMasterTenant}
                  checked={!formData.isActive}
                  onChange={() => {
                    if (!isMasterTenant) setFormData({ ...formData, isActive: false });
                  }}
                  className="accent-rose-600"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{lang === "gu" ? "સ્થગિત (Suspended)" : "Suspended"}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                    {lang === "gu" ? "લાઇવ સત્રો તુરંત રદ થશે" : "Live sessions instantly revoked"}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {lang === "gu" ? "રદ કરો" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{lang === "gu" ? "સાચવી રહ્યું છે..." : "Saving Changes..."}</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{lang === "gu" ? "ફેરફારો સાચવો" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
