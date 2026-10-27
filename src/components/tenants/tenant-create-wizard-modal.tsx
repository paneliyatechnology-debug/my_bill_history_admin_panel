"use client";

import React, { useState, useMemo } from "react";

export interface CreateTenantPayload {
  organizationName: string;
  tradeName?: string;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  subscriptionTier: string;
  daysValid: number;
  stateCode: string;
  gstin?: string;
  city?: string;
  pincode?: string;
}

interface TenantCreateWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTenantPayload) => Promise<void>;
  isLoading: boolean;
  lang?: "en" | "gu";
  statesList: { code: string; name: string }[];
}

export function TenantCreateWizardModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  lang = "en",
  statesList,
}: TenantCreateWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateTenantPayload>({
    organizationName: "",
    tradeName: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    subscriptionTier: "TRIAL",
    daysValid: 30,
    stateCode: "24", // Gujarat default
    gstin: "",
    city: "Ahmedabad",
    pincode: "380001",
  });

  // Validity Duration options
  const validityPresets = [
    { label: "15 Days", days: 15 },
    { label: "30 Days (1 Month)", days: 30 },
    { label: "90 Days (Quarter)", days: 90 },
    { label: "180 Days (6 Months)", days: 180 },
    { label: "365 Days (1 Year)", days: 365 },
  ];

  // Plan Tiers Metadata
  const planTiers = [
    {
      id: "TRIAL",
      name: "TRIAL",
      titleGu: "ટ્રાયલ (મફત)",
      tag: "Free Evaluation",
      description: "Quick trial access for evaluation and customer onboarding.",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
      activeRing: "ring-2 ring-orange-500 border-orange-400 bg-orange-50/40",
      defaultDays: 30,
    },
    {
      id: "RETAIL_BASIC",
      name: "RETAIL BASIC",
      titleGu: "રિટેલ બેઝિક",
      tag: "POS & Counter",
      description: "Fast POS counter billing, barcode scanning, thermal receipt print.",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      activeRing: "ring-2 ring-sky-500 border-sky-400 bg-sky-50/40",
      defaultDays: 365,
    },
    {
      id: "WHOLESALE_PRO",
      name: "WHOLESALE PRO",
      titleGu: "હોલસેલ પ્રો",
      tag: "B2B & GST",
      description: "Comprehensive B2B GST invoicing, double-entry ledger & receivables.",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      activeRing: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/40",
      defaultDays: 365,
    },
    {
      id: "DISTRIBUTION_ENTERPRISE",
      name: "DISTRIBUTION ENTERPRISE",
      titleGu: "ડિસ્ટ્રીબ્યુશન એન્ટરપ્રાઇઝ",
      tag: "Multi-Branch",
      description: "Multi-branch operations, multi-warehouse transfers, bulk dispatch.",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      activeRing: "ring-2 ring-purple-500 border-purple-400 bg-purple-50/40",
      defaultDays: 365,
    },
    {
      id: "MANUFACTURING_SUITE",
      name: "MANUFACTURING SUITE",
      titleGu: "મેન્યુફેક્ચરિંગ સ્યુટ",
      tag: "BOM & Production",
      description: "Bill of materials, production batch tracking, raw item consumption.",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      activeRing: "ring-2 ring-amber-500 border-amber-400 bg-amber-50/40",
      defaultDays: 365,
    },
  ];

  // Helper to generate a strong password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
    setFormError(null);
  };

  // Compute calculated expiry date
  const calculatedExpiryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(formData.daysValid) || 30));
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [formData.daysValid]);

  // Handle GSTIN input and auto-detect State Code
  const handleGstinChange = (gstinVal: string) => {
    const cleanGst = gstinVal.toUpperCase().trim();
    let detectedState = formData.stateCode;
    if (cleanGst.length >= 2) {
      const statePrefix = cleanGst.slice(0, 2);
      const match = statesList.find((s) => s.code === statePrefix);
      if (match) {
        detectedState = match.code;
      }
    }
    setFormData((prev) => ({
      ...prev,
      gstin: cleanGst,
      stateCode: detectedState,
    }));
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (!formData.organizationName.trim()) {
      setFormError(lang === "gu" ? "સંસ્થાનું નામ ફરજિયાત છે." : "Organization name is required.");
      return false;
    }
    if (formData.gstin && formData.gstin.length !== 15) {
      setFormError(
        lang === "gu"
          ? "જીએસટી નંબર બરાબર ૧૫ અક્ષરનો હોવો જોઈએ."
          : "GSTIN must be exactly 15 characters long."
      );
      return false;
    }
    setFormError(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    if (!formData.fullName.trim()) {
      setFormError(lang === "gu" ? "એડમિનનું પૂરું નામ ફરજિયાત છે." : "Owner / Admin name is required.");
      return false;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setFormError(
        lang === "gu"
          ? "માન્ય ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો."
          : "Please enter a valid 10-digit mobile number."
      );
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setFormError(
        lang === "gu"
          ? "પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ."
          : "Password must be at least 6 characters long."
      );
      return false;
    }
    setFormError(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    if (!formData.daysValid || formData.daysValid < 1) {
      setFormError(
        lang === "gu"
          ? "માન્ય દિવસોની સંખ્યા દાખલ કરો."
          : "Please enter a valid number of days."
      );
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      // Auto-set tradeName if empty
      if (!formData.tradeName) {
        setFormData((prev) => ({ ...prev, tradeName: prev.organizationName }));
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setFormError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    await onSubmit({
      ...formData,
      tradeName: formData.tradeName?.trim() || formData.organizationName.trim(),
      email: formData.email?.trim() || `${formData.phone.trim()}@billing.local`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 bg-white rounded-2xl w-full max-w-2xl text-slate-800 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg text-lg">🏢</span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {lang === "gu" ? "નવી સંસ્થા / ટેનન્ટ બનાવો" : "Create New Business Tenant"}
              </h3>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              {lang === "gu"
                ? "સરળ ૪ સ્ટેપ વિઝાર્ડ દ્વારા નવી કંપની અને એડમિન શરૂ કરો"
                : "Guided 4-step wizard to provision organization, admin & license"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: lang === "gu" ? "સંસ્થા" : "Business", icon: "🏢" },
              { num: 2, label: lang === "gu" ? "એડમિન" : "Admin", icon: "👤" },
              { num: 3, label: lang === "gu" ? "પ્લાન" : "Subscription", icon: "💎" },
              { num: 4, label: lang === "gu" ? "સમીક્ષા" : "Launch", icon: "🚀" },
            ].map((step, idx) => {
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;
              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoading && isPassed) {
                        setFormError(null);
                        setCurrentStep(step.num as any);
                      }
                    }}
                    disabled={!isPassed && !isActive}
                    className={`flex items-center gap-2 group transition-all ${
                      isPassed ? "cursor-pointer" : isActive ? "cursor-default" : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : isActive
                          ? "bg-purple-700 text-white ring-4 ring-purple-100 shadow-xs"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isPassed ? "✓" : step.num}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        isActive
                          ? "text-purple-800"
                          : isPassed
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {idx < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded transition-colors ${
                        currentStep > step.num ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body / Steps */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* STEP 1: ORGANIZATION & BUSINESS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-900 flex items-center gap-2">
                <span className="text-base">ℹ️</span>
                <span>
                  {lang === "gu"
                    ? "પગલું ૧: સંસ્થાનું નામ અને વ્યવસાયનું રાજ્ય પસંદ કરો."
                    : "Step 1: Set up the organization identity and tax jurisdiction."}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === "gu" ? "સંસ્થા / કંપનીનું નામ *" : "Organization / Company Name *"}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={lang === "gu" ? "દા.ત. શ્રી હરિ ટ્રેડિંગ કંપની" : "e.g. Shree Hari Trading Co."}
                  value={formData.organizationName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationName: e.target.value,
                      tradeName: formData.tradeName === formData.organizationName ? e.target.value : formData.tradeName,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "વેપારી નામ (Trade Name)" : "Trade Name (Display)"}
                  </label>
                  <input
                    type="text"
                    placeholder={formData.organizationName || "Optional trade name"}
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "રાજ્ય (GST Jurisdiction) *" : "State (GST State) *"}
                  </label>
                  <select
                    value={formData.stateCode}
                    onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    {statesList.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "જીએસટી નંબર (વૈકલ્પિક)" : "GSTIN (Optional)"}
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="24AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formData.gstin?.length === 15 ? "✅ 15 Digits" : "15-digit alphanumeric"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "શહેર" : "City"}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "પીન કોડ" : "Pincode"}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADMINISTRATOR & CREDENTIALS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-900 flex items-center gap-2">
                <span className="text-base">👤</span>
                <span>
                  {lang === "gu"
                    ? "પગલું ૨: સંસ્થાના મુખ્ય એડમિન/માલિકની વિગતો અને લૉગિન પાસવર્ડ સેટ કરો."
                    : "Step 2: Create primary company administrator account with secure login credentials."}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === "gu" ? "એડમિનનું પૂરું નામ *" : "Administrator / Owner Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={lang === "gu" ? "દા.ત. રમેશભાઈ પટેલ" : "e.g. Ramesh Patel"}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "પ્રાથમિક મોબાઈલ નંબર *" : "Primary Mobile Phone *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="98XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFormData({ ...formData, phone: val });
                      }}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formData.phone.length === 10 ? "✅ 10 Digits Valid" : "This mobile number is used to log in."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === "gu" ? "ઈમેલ એડ્રેસ (વૈકલ્પિક)" : "Business Email (Optional)"}
                  </label>
                  <input
                    type="email"
                    placeholder={formData.phone ? `${formData.phone}@billing.local` : "admin@business.com"}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "gu"
                      ? "ખાલી રાખશો તો સ્વતઃ મોબાઈલ આધારિત આઈડી બનશે."
                      : "Leave blank to auto-assign phone-based email."}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {lang === "gu" ? "એડમિન પાસવર્ડ *" : "Admin Password *"}
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200 transition-colors"
                  >
                    <span>🎲</span>
                    <span>{lang === "gu" ? "મજબૂત પાસવર્ડ બનાવો" : "Generate Secure"}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter or generate password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pr-10 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formData.password && (
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Password length: {formData.password.length} chars
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SUBSCRIPTION TIER & VALIDITY */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-900 flex items-center gap-2">
                <span className="text-base">💎</span>
                <span>
                  {lang === "gu"
                    ? "પગલું ૩: સબસ્ક્રિપ્શન પ્લાન અને માન્યતા સમયગાળો પસંદ કરો."
                    : "Step 3: Select platform subscription plan and licensing validity."}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {lang === "gu" ? "સબસ્ક્રિપ્શન પ્લાન ટિયર" : "Subscription Plan Tier"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {planTiers.map((tier) => {
                    const isSelected = formData.subscriptionTier === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            subscriptionTier: tier.id,
                            daysValid: isSelected ? formData.daysValid : tier.defaultDays,
                          });
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? tier.activeRing
                            : "bg-slate-50 hover:bg-slate-100/70 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border font-mono ${tier.badgeColor}`}>
                            {tier.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {tier.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                          {tier.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Validity Presets & Custom Days */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {lang === "gu" ? "માન્યતા સમયગાળો (Validity Days)" : "Validity Duration"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {validityPresets.map((preset) => {
                    const isSelected = Number(formData.daysValid) === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setFormData({ ...formData, daysValid: preset.days })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-700 text-white shadow-2xs ring-2 ring-purple-200"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="w-32">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={formData.daysValid}
                      onChange={(e) =>
                        setFormData({ ...formData, daysValid: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span>{lang === "gu" ? "સમાપ્તિ તારીખ:" : "Valid Until:"} </span>
                    <strong className="text-purple-700 font-mono font-bold text-sm ml-1">
                      {calculatedExpiryDate}
                    </strong>
                    <span className="text-slate-400 ml-1">({formData.daysValid} days)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & LAUNCH */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                <span className="text-base">🚀</span>
                <span className="font-semibold">
                  {lang === "gu"
                    ? "પગલું ૪: બધી વિગતો તપાસો અને સંસ્થા લૉન્ચ કરો."
                    : "Step 4: Final verification before provisioning tenant on the platform."}
                </span>
              </div>

              {/* Review Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Organization
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {formData.organizationName}
                    </h4>
                    {formData.tradeName && formData.tradeName !== formData.organizationName && (
                      <p className="text-[11px] text-slate-500">Trade: {formData.tradeName}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                    {formData.subscriptionTier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Admin Owner
                    </span>
                    <span className="font-semibold text-slate-800">{formData.fullName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Mobile & Login
                    </span>
                    <span className="font-mono font-bold text-slate-800">+91 {formData.phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Email
                    </span>
                    <span className="text-slate-600 font-mono">
                      {formData.email || `${formData.phone}@billing.local`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Validity & Expiry
                    </span>
                    <span className="text-purple-700 font-bold font-mono">
                      {calculatedExpiryDate} ({formData.daysValid} days)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      GST Jurisdiction
                    </span>
                    <span className="text-slate-700 font-semibold">
                      State Code: {formData.stateCode}{" "}
                      {statesList.find((s) => s.code === formData.stateCode)?.name || ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Initial Status
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active / Ready
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Default Main Branch (BR01) will be initialized automatically</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Current Financial Year (FY 2026-27) will be pre-configured</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Admin permissions and company isolation will be provisioned</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ← {lang === "gu" ? "પાછા જાઓ" : "Back"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                {lang === "gu" ? "રદ કરો" : "Cancel"}
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === "gu" ? "આગળ" : "Next"}</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === "gu" ? "સંસ્થા બની રહી છે..." : "Provisioning Tenant..."}</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>{lang === "gu" ? "સંસ્થા કન્ફર્મ કરો અને બનાવો" : "Confirm & Launch Tenant"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
