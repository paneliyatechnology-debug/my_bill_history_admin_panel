import React from "react";

export const INDIAN_STATES = [
  { code: "24", name: "Gujarat (24)" },
  { code: "27", name: "Maharashtra (27)" },
  { code: "08", name: "Rajasthan (08)" },
  { code: "07", name: "Delhi (07)" },
  { code: "29", name: "Karnataka (29)" },
  { code: "33", name: "Tamil Nadu (33)" },
  { code: "09", name: "Uttar Pradesh (09)" },
  { code: "23", name: "Madhya Pradesh (23)" },
  { code: "19", name: "West Bengal (19)" },
  { code: "06", name: "Haryana (06)" },
  { code: "03", name: "Punjab (03)" },
  { code: "36", name: "Telangana (36)" },
  { code: "37", name: "Andhra Pradesh (37)" },
];

export const TIER_META: Record<
  string,
  {
    name: string;
    nameGujarati: string;
    subtitle: string;
    subtitleGujarati: string;
    style: string;
    badgeStyle: string;
    icon: () => React.ReactNode;
    features: string[];
    featuresGujarati: string[];
  }
> = {
  TRIAL: {
    name: "TRIAL",
    nameGujarati: "ટ્રાયલ (૩૦ દિવસ)",
    subtitle: "30-day Free Trial",
    subtitleGujarati: "૩૦ દિવસ મફત મૂલ્યાંકન",
    style: "bg-[#FFF8F0] border-[#FED7AA]/60 hover:border-[#FDBA74]",
    badgeStyle: "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]",
    icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3H5a1 1 0 000 2h14a1 1 0 000-2z" />
      </svg>
    ),
    features: [
      "Unlimited Sales Invoices & Quotes",
      "Counter POS Quick Billing",
      "GST Summary Reports",
    ],
    featuresGujarati: [
      "અમર્યાદિત વેચાણ બિલ અને કોટેશન",
      "કાઉન્ટર POS ઝડપી બિલિંગ",
      "GST સારાંશ અહેવાલો",
    ],
  },
  RETAIL_BASIC: {
    name: "RETAIL BASIC",
    nameGujarati: "રિટેલ બેઝિક",
    subtitle: "Counter POS & Billing",
    subtitleGujarati: "દુકાન કાઉન્ટર બિલિંગ",
    style: "bg-[#F0F7FF] border-[#BAE6FD]/60 hover:border-[#7DD3FC]",
    badgeStyle: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
    features: [
      "Barcode Scanning & Thermal Print",
      "Cash & UPI Payment Recording",
      "Day-End Cash Book (રોજમેળ)",
    ],
    featuresGujarati: [
      "બારકોડ સ્કેનિંગ અને થર્મલ પ્રિન્ટ",
      "રોકડ અને UPI ચુકવણી નોંધણી",
      "દૈનિક રોજમેળ (કેશ બુક)",
    ],
  },
  WHOLESALE_PRO: {
    name: "WHOLESALE PRO",
    nameGujarati: "હોલસેલ પ્રો",
    subtitle: "B2B GST & Double Entry",
    subtitleGujarati: "B2B જીએસટી અને ખાતાવહી",
    style: "bg-[#F0FDF4] border-[#BBF7D0]/60 hover:border-[#86EFAC]",
    badgeStyle: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    icon: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    features: [
      "Double-Entry Ledgers & Trial Balance",
      "GST E-Invoice & E-Waybill API Ready",
      "Customer Outstanding Ageing Reports",
    ],
    featuresGujarati: [
      "ડબલ-એન્ટ્રી ખાતાવહી અને સરવૈયું",
      "ઈ-ઇન્વૉઇસ અને ઈ-વેબિલ રેડી",
      "ગ્રાહક બાકી ઉઘરાણી એજિંગ રીપોર્ટ",
    ],
  },
  DISTRIBUTION_ENTERPRISE: {
    name: "DISTRIBUTION ENTERPRISE",
    nameGujarati: "ડિસ્ટ્રીબ્યુશન એન્ટરપ્રાઇઝ",
    subtitle: "Multi-Godown Transfers",
    subtitleGujarati: "બહુવિધ ગોડાઉન અને ડિલિવરી",
    style: "bg-[#FAF5FF] border-[#E9D5FF]/60 hover:border-[#D8B4FE]",
    badgeStyle: "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]",
    icon: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    features: [
      "Inter-Godown Stock Transfers",
      "Delivery Challans & Dispatch",
      "Batch & Expiry Tracking",
    ],
    featuresGujarati: [
      "ગોડાઉન-ટુ-ગોડાઉન સ્ટોક ટ્રાન્સફર",
      "ડિલિવરી ચલણ અને ડિસ્પેચ",
      "બેચ નંબર અને એક્સપાયરી ટ્રેકિંગ",
    ],
  },
  MANUFACTURING_SUITE: {
    name: "MANUFACTURING SUITE",
    nameGujarati: "મેન્યુફેક્ચરિંગ સ્યુટ",
    subtitle: "BOM & Production Work Orders",
    subtitleGujarati: "કાચો માલ અને ઉત્પાદન ઓર્ડર",
    style: "bg-[#FDF2F8] border-[#FBCFE8]/60 hover:border-[#F472B6]",
    badgeStyle: "bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8]",
    icon: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 19H5V8l4 4V8l4 4V5l6 6v8zm1-12h-2V3L9 7V5L2 9v12h18V7z" />
      </svg>
    ),
    features: [
      "Bill of Materials (BOM) Recipes",
      "Production Work Orders",
      "Raw Material Consumption & Yield Analysis",
    ],
    featuresGujarati: [
      "કાચા માલની ફોર્મ્યુલા (BOM Recipes)",
      "ઉત્પાદન વર્ક ઓર્ડર",
      "વપરાશ અને યીલ્ડ ઉત્પાદન વિશ્લેષણ",
    ],
  },
};

export function getTierInfo(tierKey: string) {
  if (TIER_META[tierKey]) return TIER_META[tierKey];
  const formatted = tierKey.replace(/_/g, " ");
  return {
    name: formatted,
    nameGujarati: formatted,
    subtitle: "Active Subscription Plan",
    subtitleGujarati: "સક્રિય સબ્સ્ક્રિપ્શન પ્લાન",
    style: "bg-slate-50 border-slate-200 hover:border-purple-300",
    badgeStyle: "bg-slate-100 text-slate-700 border-slate-300",
    icon: () => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    features: ["Standard Module Access", "Multi-User Roles", "Audit Trail Logging"],
    featuresGujarati: ["માનક મોડ્યુલ એક્સેસ", "મલ્ટી-યુઝર ભૂમિકાઓ", "ઓડિટ ટ્રેઇલ નોંધણી"],
  };
}

export function formatInr(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export const TAB_ROUTE_MAP: Record<string, string> = {
  overview: "/superadmin",
  tenants: "/superadmin/tenants",
  plans: "/superadmin/plans",
  invoices: "/superadmin/invoices",
  users: "/superadmin/users",
  audit: "/superadmin/audit-logs",
  "audit-logs": "/superadmin/audit-logs",
  health: "/superadmin/diagnostics",
  diagnostics: "/superadmin/diagnostics",
  themes: "/superadmin/themes",
};

