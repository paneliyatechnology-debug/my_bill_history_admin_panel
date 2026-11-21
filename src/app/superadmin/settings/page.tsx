"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

export default function PlatformSettingsPage() {
  const { setActionSuccess, setActionError } = useSuperAdmin();
  const [settings, setSettings] = useState<any>({
    platformName: "MyOwn BillBook Super Admin",
    legalEntityName: "MyOwn BillBook Technologies Private Limited",
    gstin: "24AAACM1234F1Z5",
    supportEmail: "support@myownbillbook.com",
    billingEmail: "billing@myownbillbook.com",
    supportPhone: "+91 82388 12890",
    registeredAddress: "402, Titanium City Centre, Anand Nagar Road, Prahladnagar, Ahmedabad, Gujarat 380015",
    defaultCurrency: "INR",
    currencySymbol: "₹",
    defaultTrialDays: 30,
    defaultGracePeriodDays: 7,
    paymentGateway: "Razorpay",
    razorpayMode: "Live Production",
    maintenanceMode: false,
    sessionTimeoutMinutes: 120,
    bypassPlanRestrictions: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res: any = await apiClient.get("/super-admin/settings");
      if (res && typeof res === "object" && Object.keys(res).length > 0) {
        setSettings((prev: any) => ({ ...prev, ...res }));
      }
    } catch (err) {
      console.warn("Using default settings", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await apiClient.patch("/super-admin/settings", settings);
      setActionSuccess("Platform configuration saved successfully.");
    } catch (err: any) {
      setActionError(err?.message || "Failed to update platform settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global corporate details, GST compliance identity, default subscription parameters, and gateway status.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Entity & Legal Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Corporate & GST Compliance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Registered Entity Name</label>
              <input
                type="text"
                value={settings.legalEntityName}
                onChange={(e) => setSettings({ ...settings, legalEntityName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SuperAdmin Platform GSTIN</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                value={settings.registeredAddress}
                onChange={(e) => setSettings({ ...settings, registeredAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Communication & Invoicing Emails</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Invoices Email</label>
              <input
                type="email"
                value={settings.billingEmail}
                onChange={(e) => setSettings({ ...settings, billingEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpdesk Hotline Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Subscription & Payment Gateway */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Subscription & Gateway Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Free Trial (Days)</label>
              <input
                type="number"
                min={7}
                max={90}
                value={settings.defaultTrialDays}
                onChange={(e) => setSettings({ ...settings, defaultTrialDays: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Gateway Engine</label>
              <input
                type="text"
                disabled
                value={`${settings.paymentGateway} (${settings.razorpayMode})`}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
              <input
                type="text"
                disabled
                value={`${settings.defaultCurrency} (${settings.currencySymbol})`}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Subscription Plan Restriction & Access Override */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Subscription Plan Restrictions & Access Override</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master switch to bypass or enforce module limits across all tenant organizations.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                settings.bypassPlanRestrictions
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.bypassPlanRestrictions ? "bg-amber-500 animate-pulse" : "bg-blue-600"
                }`}
              />
              {settings.bypassPlanRestrictions
                ? "Bypass Active (All Modules Open)"
                : "Plan Restrictions Enforced"}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Bypass Plan Restrictions (Allow All Modules Without Plan)
                </span>
                <span className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  પ્લાન બાયપાસ સેટિંગ
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                જ્યારે આ સેટિંગ ચાલુ (ON) હશે, ત્યારે તમામ યૂઝર્સ પ્લાન વગર પણ સોફ્ટવેરના બધા મોડ્યુલ્સ (E-Invoices, BoM Manufacturing, Vouchers, Godowns, WhatsApp Reminders વગેરે) એક્સેસ કરી શકશે. જ્યારે બંધ (OFF) હશે, ત્યારે યૂઝરના પ્લાન મુજબ જ મોડ્યુલ્સ દેખાશે અને એક્સેસ થશે.
              </p>
              <p className="text-[11px] text-slate-500 italic mt-1">
                Toggle ON to allow users full platform access without purchasing a plan. Toggle OFF to strictly enforce plan module limits.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSettings((prev: any) => ({
                  ...prev,
                  bypassPlanRestrictions: !prev.bypassPlanRestrictions,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.bypassPlanRestrictions ? "bg-[#1677E8]" : "bg-slate-300"
              }`}
              role="switch"
              aria-checked={settings.bypassPlanRestrictions}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.bypassPlanRestrictions ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
