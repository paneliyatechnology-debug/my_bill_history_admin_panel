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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-[#202124] tracking-tight">
          {lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન્સ અને ક્ષમતાઓ" : "Platform Subscription Tiers"}
        </h1>
        <p className="text-xs text-[#667085] mt-0.5">
          {lang === "gu"
            ? "ભારતીય રિટેલ, હોલસેલ, ડિસ્ટ્રીબ્યુશન અને મેન્યુફેક્ચરિંગ માટે ઉપલબ્ધ પ્લાન્સ."
            : "Curated subscription tiers architected for Indian Retail, Wholesale, Distribution & Manufacturing."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(tierCounts).map(([tierKey, count]) => {
          const meta = getTierInfo(tierKey);
          const isPopular = tierKey === "WHOLESALE_PRO";
          const features = lang === "gu" ? meta.featuresGujarati : meta.features;

          return (
            <div
              key={tierKey}
              className={`bg-white rounded-2xl p-6 space-y-4 shadow-xs relative overflow-hidden border ${
                isPopular ? "border-2 border-emerald-500 shadow-md" : "border-[#E5E7EB]"
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold uppercase px-3 py-1 rounded-bl-xl font-mono">
                  {lang === "gu" ? "લોકપ્રિય" : "Popular"}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-2.5 py-1 rounded-md border uppercase font-mono ${meta.badgeStyle}`}>
                  {tierKey}
                </span>
                <span className="text-xs text-[#667085] font-bold font-mono">
                  {count} {lang === "gu" ? "સંસ્થાઓ" : "Tenants"}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#202124]">
                {lang === "gu" ? meta.nameGujarati : meta.name}
              </h3>
              <p className="text-xs text-[#667085]">
                {lang === "gu" ? meta.subtitleGujarati : meta.subtitle}
              </p>

              <ul className="text-xs text-[#202124] space-y-2 pt-2 border-t border-[#E5E7EB]">
                {features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  href={`/superadmin/tenants?tier=${tierKey}`}
                  className="w-full py-2 bg-slate-50 hover:bg-purple-50 text-purple-700 hover:text-purple-800 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{lang === "gu" ? "આ પ્લાનના ટેનન્ટ્સ જુઓ" : "Filter Tenants in Tier"}</span>
                  <span>({count}) →</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

