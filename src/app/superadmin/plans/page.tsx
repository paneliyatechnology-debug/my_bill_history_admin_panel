"use client";

import React from "react";
import Link from "next/link";
import { useSuperAdmin } from "../../../context/superadmin-context";

export default function SuperAdminPlansPage() {
  const { stats, lang, getTierInfo } = useSuperAdmin();

  const tierCounts: Record<string, number> = stats?.subscriptionTiers || {
    TRIAL: 0,
    RETAIL_BASIC: 0,
    WHOLESALE_PRO: 0,
    DISTRIBUTION_ENTERPRISE: 0,
    MANUFACTURING_SUITE: 0,
  };

  const totalTenants = stats?.tenants?.total || 1;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Commercial Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {stats?.tenants?.active || 0} Active Subscriptions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન્સ અને ક્ષમતાઓ" : "Platform Subscription Tiers"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {lang === "gu"
                ? "ભારતીય રિટેલ, હોલસેલ, ડિસ્ટ્રીબ્યુશન અને મેન્યુફેક્ચરિંગ માટે ઉપલબ્ધ વ્યાપારી પ્લાન્સ અને સુવિધાઓ."
                : "Curated subscription tiers engineered for Indian Retail, Wholesale, Distribution & Manufacturing workflows."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Fleet Total
            </span>
            <span className="text-lg font-black font-mono text-purple-300">
              {stats?.tenants?.total || 0} Tenants
            </span>
          </div>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(tierCounts).map(([tierKey, count]) => {
          const meta = getTierInfo(tierKey);
          const isPopular = tierKey === "WHOLESALE_PRO";
          const features = lang === "gu" ? meta.featuresGujarati : meta.features;
          const pct = Math.round((count / totalTenants) * 100);

          return (
            <div
              key={tierKey}
              className={`bg-white rounded-3xl p-6 space-y-5 shadow-xs relative overflow-hidden border transition-all hover:shadow-lg flex flex-col justify-between group ${
                isPopular
                  ? "border-2 border-emerald-500/80 shadow-md ring-2 ring-emerald-500/10"
                  : "border-slate-200/80 hover:border-purple-300"
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-bl-2xl font-mono shadow-xs tracking-wider">
                  {lang === "gu" ? "સૌથી વધુ લોકપ્રિય" : "Most Popular"}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-xl border uppercase font-mono tracking-wider shadow-2xs ${meta.badgeStyle}`}>
                    {tierKey}
                  </span>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 font-mono">
                      {count}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono ml-1 font-semibold">
                      ({pct}%)
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {lang === "gu" ? meta.nameGujarati : meta.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {lang === "gu" ? meta.subtitleGujarati : meta.subtitle}
                  </p>
                </div>

                {/* Features checklist */}
                <ul className="text-xs text-slate-700 space-y-2.5 pt-4 border-t border-slate-100">
                  {features.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span className="font-medium text-slate-600">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/superadmin/tenants?tier=${tierKey}`}
                  className="w-full py-2.5 bg-slate-50 hover:bg-purple-50 text-purple-700 hover:text-purple-900 border border-slate-200/80 hover:border-purple-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow-xs"
                >
                  <span>{lang === "gu" ? "આ પ્લાનના ગ્રાહકો જુઓ" : "Filter Tenants in Tier"}</span>
                  <span className="font-mono">({count})</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
