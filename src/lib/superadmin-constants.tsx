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
    style: "bg-slate-50 border-slate-200 hover:border-blue-300",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
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

export interface PlatformModuleDefinition {
  id: string;
  name: string;
  nameGujarati: string;
  category: "sales" | "purchases" | "inventory" | "parties" | "accounting" | "compliance" | "manufacturing" | "tools";
  categoryLabel: string;
  route: string;
  description: string;
  isCore?: boolean;
}

export const MODULE_CATEGORIES = [
  { id: "all", label: "All Modules" },
  { id: "sales", label: "Sales & Billing" },
  { id: "purchases", label: "Purchases" },
  { id: "inventory", label: "Inventory" },
  { id: "parties", label: "Parties & CRM" },
  { id: "accounting", label: "Accounting" },
  { id: "compliance", label: "GST & Compliance" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "tools", label: "Tools & Add-ons" },
] as const;

export const PLATFORM_MODULE_CATALOG: PlatformModuleDefinition[] = [
  // --- 1. SALES & BILLING ---
  {
    id: "salesInvoices",
    name: "Sales Invoices",
    nameGujarati: "વેચાણ બિલ (Tax Invoices)",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/invoices",
    description: "Create B2B & B2C GST tax invoices with A4 Laser and 58/80mm thermal receipts.",
    isCore: true,
  },
  {
    id: "quotations",
    name: "Quotations & Estimates",
    nameGujarati: "કાચું બિલ / એસ્ટીમેટ",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/quotations",
    description: "Send professional price estimates & quotations with 1-click invoice conversion.",
  },
  {
    id: "paymentIn",
    name: "Payment In (Customer Receipts)",
    nameGujarati: "આવક ચૂકવણી (Payment In)",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/payment-in",
    description: "Record incoming cash, UPI QR payments, cheques, and customer settlement slips.",
    isCore: true,
  },
  {
    id: "salesReturns",
    name: "Sales Return",
    nameGujarati: "વેચાણ પરત (Sales Return)",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/returns",
    description: "Accept returned goods, automatically restore inventory, and adjust customer balance.",
  },
  {
    id: "creditDebitNotes",
    name: "Credit & Debit Notes",
    nameGujarati: "ક્રેડિટ & ડેબિટ નોટ",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/credit-note",
    description: "Formal accounting credit/debit notes with GST rate adjustments and reasons.",
  },
  {
    id: "deliveryChallan",
    name: "Delivery Challan",
    nameGujarati: "ડિલિવરી ચલણ (Challans)",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/delivery-challan",
    description: "Dispatch materials, job-work shipments, and transfer goods with official delivery slips.",
  },
  {
    id: "proformaInvoice",
    name: "Proforma Invoice",
    nameGujarati: "પ્રોફોર્મા ઇન્વોઇસ",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/proforma",
    description: "Issue commercial proforma vouchers for customer advance payments before shipping.",
  },
  {
    id: "posBilling",
    name: "Counter POS Billing",
    nameGujarati: "ઝડપી કાઉન્ટર POS",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/pos",
    description: "High-speed retail billing screen, barcode scanning, shortcuts, and cash drawer support.",
    isCore: true,
  },
  {
    id: "posOrders",
    name: "POS Orders & Kitchen",
    nameGujarati: "પીઓએસ ઓર્ડર્સ",
    category: "sales",
    categoryLabel: "Sales & Billing",
    route: "/sales/pos/orders",
    description: "Track active counter tokens, dine-in tables, takeaway status, and kitchen fulfillment.",
  },

  // --- 2. PURCHASES & PROCUREMENT ---
  {
    id: "purchaseInvoices",
    name: "Purchase Invoices & OCR",
    nameGujarati: "ખરીદી બિલ & સ્કેનર",
    category: "purchases",
    categoryLabel: "Purchases",
    route: "/purchases",
    description: "Log vendor inward bills with auto-stock updates and AI camera OCR receipt scanner.",
    isCore: true,
  },
  {
    id: "purchaseOrders",
    name: "Purchase Orders (PO)",
    nameGujarati: "ખરીદી ઓર્ડર (PO)",
    category: "purchases",
    categoryLabel: "Purchases",
    route: "/purchases/orders",
    description: "Send formal purchase orders to manufacturers and suppliers with expected delivery dates.",
  },
  {
    id: "paymentOut",
    name: "Payment Out (Vendor Payouts)",
    nameGujarati: "જાવક ચૂકવણી (Payment Out)",
    category: "purchases",
    categoryLabel: "Purchases",
    route: "/purchases/payment-out",
    description: "Record outgoing payments to suppliers, cheque registers, and debit disbursements.",
    isCore: true,
  },
  {
    id: "purchaseReturns",
    name: "Purchase Returns",
    nameGujarati: "ખરીદી પરત",
    category: "purchases",
    categoryLabel: "Purchases",
    route: "/purchases/returns",
    description: "Return defective goods to vendors with debit memo issuance and stock deduction.",
  },
  {
    id: "expenses",
    name: "Expenses Management",
    nameGujarati: "દૈનિક ખર્ચા (Expenses)",
    category: "purchases",
    categoryLabel: "Purchases",
    route: "/finance/expenses",
    description: "Record petty cash, rent, staff salary advances, logistics freight, and office bills.",
    isCore: true,
  },

  // --- 3. INVENTORY & WAREHOUSES ---
  {
    id: "itemsInventory",
    name: "Items & Stock Directory",
    nameGujarati: "માલસામાન / સ્ટોક (Items)",
    category: "inventory",
    categoryLabel: "Inventory",
    route: "/masters/items",
    description: "Master inventory management, purchase/sale pricing, stock reorder levels, and batches.",
    isCore: true,
  },
  {
    id: "stockTransfers",
    name: "Multi-Godown & Warehouses",
    nameGujarati: "ગોડાઉન / વેરહાઉસ",
    category: "inventory",
    categoryLabel: "Inventory",
    route: "/masters/warehouses",
    description: "Manage multiple warehouses, inter-godown inventory transfers, and location balance.",
  },
  {
    id: "categoriesUnits",
    name: "Categories & Units (UOM)",
    nameGujarati: "કેટેગરીઝ અને એકમો",
    category: "inventory",
    categoryLabel: "Inventory",
    route: "/masters/categories",
    description: "Organize inventory into hierarchical categories, secondary units (Box, Kgs, Pcs).",
    isCore: true,
  },
  {
    id: "hsnSac",
    name: "HSN / SAC Code Directory",
    nameGujarati: "HSN / SAC કોડ્સ",
    category: "inventory",
    categoryLabel: "Inventory",
    route: "/masters/hsn",
    description: "GST compliance 4, 6, and 8 digit HSN/SAC master with GST rate slab lookups.",
    isCore: true,
  },
  {
    id: "barcodeThermal",
    name: "Barcode Label Thermal Print",
    nameGujarati: "બારકોડ સ્કેનિંગ અને પ્રિન્ટ",
    category: "inventory",
    categoryLabel: "Inventory",
    route: "/masters/items",
    description: "Print custom barcode stickers with MRP, company name, item code, and weight.",
  },

  // --- 4. PARTIES & CRM ---
  {
    id: "partiesDirectory",
    name: "Customers & Vendors Directory",
    nameGujarati: "ગ્રાહકો / વેપારીઓ ખાતાવહી",
    category: "parties",
    categoryLabel: "Parties & CRM",
    route: "/masters/parties",
    description: "Unified customer & vendor address book, GSTIN verification, credit limits, and balances.",
    isCore: true,
  },
  {
    id: "partyStatements",
    name: "Party Statements & Aging",
    nameGujarati: "ખાતાવહી અને એજિંગ રિપોર્ટ્સ",
    category: "parties",
    categoryLabel: "Parties & CRM",
    route: "/masters/parties",
    description: "Send automated WhatsApp/PDF ledger statements, 30-60-90 days overdue aging analysis.",
  },

  // --- 5. ACCOUNTING & BANKING ---
  {
    id: "cashBank",
    name: "Cash & Bank Daybook (રોજમેળ)",
    nameGujarati: "રોકડ અને બેંક ખાતું",
    category: "accounting",
    categoryLabel: "Accounting",
    route: "/finance/cash-bank",
    description: "Cash in hand, multi-bank current accounts, daily cash book (રોજમેળ), contra vouchers.",
    isCore: true,
  },
  {
    id: "doubleEntryLedgers",
    name: "Double-Entry General Ledgers",
    nameGujarati: "નામા પદ્ધતિ / લેજર્સ",
    category: "accounting",
    categoryLabel: "Accounting",
    route: "/finance/cash-bank",
    description: "Debit/Credit journal entries, Chart of Accounts, Trial Balance, and balance sheets.",
  },
  {
    id: "gstReports",
    name: "Financial Reports & P&L",
    nameGujarati: "રિપોર્ટ્સ & નફો-નુકસાન",
    category: "accounting",
    categoryLabel: "Accounting",
    route: "/reports",
    description: "Comprehensive P&L, sales registers, purchase audit sheets, and balance statements.",
    isCore: true,
  },

  // --- 6. GST & COMPLIANCE ---
  {
    id: "eInvoiceEwaybill",
    name: "GST E-Invoice & E-Waybill API",
    nameGujarati: "ઈ-ઇન્વોઇસિંગ & ઈ-વે બિલ",
    category: "compliance",
    categoryLabel: "GST & Compliance",
    route: "/gst",
    description: "Direct government NIC portal integration: IRN generation, signed QR codes, E-Way bills.",
  },
  {
    id: "gstrReconciliation",
    name: "GSTR-1, 3B & 2B Return Prep",
    nameGujarati: "GSTR-1, 3B અને 2B અહેવાલ",
    category: "compliance",
    categoryLabel: "GST & Compliance",
    route: "/gst",
    description: "Monthly GST return spreadsheets, JSON exports for GST portal filing, ITC mismatch logs.",
  },
  {
    id: "automatedBills",
    name: "Automated Recurring Billing",
    nameGujarati: "ઓટોમેટેડ બિલ્સ",
    category: "compliance",
    categoryLabel: "GST & Compliance",
    route: "/sales/invoices",
    description: "Schedule recurring monthly/quarterly maintenance retainers and auto-generate invoices.",
  },

  // --- 7. MANUFACTURING & ASSEMBLY ---
  {
    id: "manufacturingBom",
    name: "Bill of Materials (BOM) Recipes",
    nameGujarati: "BOM કાચો માલ ફોર્મ્યુલા",
    category: "manufacturing",
    categoryLabel: "Manufacturing",
    route: "/masters/items",
    description: "Define raw materials, packaging components, and labor cost formula for finished products.",
  },
  {
    id: "productionOrders",
    name: "Production Work Orders",
    nameGujarati: "ઉત્પાદન વર્ક ઓર્ડર્સ",
    category: "manufacturing",
    categoryLabel: "Manufacturing",
    route: "/masters/items",
    description: "Issue manufacturing factory batch orders, track WIP (Work in Progress), and completed runs.",
  },
  {
    id: "rawMaterialConsumption",
    name: "Raw Material Auto-Consumption",
    nameGujarati: "કાચો માલ ઓટો વપરાશ & યીલ્ડ",
    category: "manufacturing",
    categoryLabel: "Manufacturing",
    route: "/masters/items",
    description: "Auto-deduct raw material inventory upon finished goods production yield completion.",
  },

  // --- 8. TOOLS & AUTOMATION ---
  {
    id: "whatsAppReminders",
    name: "WhatsApp Payment Reminders",
    nameGujarati: "ઓટો ઉઘરાણી (WhatsApp)",
    category: "tools",
    categoryLabel: "Tools & Add-ons",
    route: "/finance/ai-collections",
    description: "Automated WhatsApp payment collection reminders with 1-click UPI payment links.",
  },
  {
    id: "dataImport",
    name: "Data Import (Excel & CSV)",
    nameGujarati: "ડેટા આયાત (Excel / CSV)",
    category: "tools",
    categoryLabel: "Tools & Add-ons",
    route: "/app/data-import",
    description: "Bulk import items, customer contacts, opening balances from Tally, Vyapar, Marg, or Excel.",
  },
  {
    id: "payrollStaff",
    name: "Staff Attendance & Payroll",
    nameGujarati: "સ્ટાફ હાજરી અને પગાર",
    category: "tools",
    categoryLabel: "Tools & Add-ons",
    route: "/app/sam",
    description: "Record daily employee attendance, monthly salary calculations, advances, and pay slips.",
  },
  {
    id: "userManagementRbac",
    name: "Role-Based Access Control (RBAC)",
    nameGujarati: "વપરાશકર્તા ભૂમિકાઓ & સુરક્ષા",
    category: "tools",
    categoryLabel: "Tools & Add-ons",
    route: "/settings/user-management",
    description: "Fine-grained permissions for billers, sales reps, warehouse managers, and external CAs.",
  },
  {
    id: "customThemes",
    name: "Custom Print Themes & Branding",
    nameGujarati: "કસ્ટમ થીમ્સ અને બ્રાન્ડિંગ",
    category: "tools",
    categoryLabel: "Tools & Add-ons",
    route: "/settings",
    description: "Store customized print templates, dynamic UPI QR codes, company signatures, and stamps.",
  },
];

export const MODULE_PRESETS = {
  all: PLATFORM_MODULE_CATALOG.reduce((acc, m) => ({ ...acc, [m.id]: true }), {} as Record<string, boolean>),
  clear: PLATFORM_MODULE_CATALOG.reduce((acc, m) => ({ ...acc, [m.id]: false }), {} as Record<string, boolean>),
  retail: {
    salesInvoices: true,
    posBilling: true,
    paymentIn: true,
    itemsInventory: true,
    categoriesUnits: true,
    hsnSac: true,
    barcodeThermal: true,
    partiesDirectory: true,
    cashBank: true,
    expenses: true,
    gstReports: true,
    customThemes: true,
    dataImport: true,
    stockTransfers: false,
    doubleEntryLedgers: false,
    eInvoiceEwaybill: false,
    manufacturingBom: false,
    productionOrders: false,
    rawMaterialConsumption: false,
    whatsAppReminders: false,
    payrollStaff: false,
    userManagementRbac: false,
    quotations: false,
    salesReturns: true,
    creditDebitNotes: false,
    deliveryChallan: false,
    proformaInvoice: false,
    posOrders: true,
    purchaseInvoices: true,
    purchaseOrders: false,
    paymentOut: true,
    purchaseReturns: true,
    partyStatements: true,
    gstrReconciliation: false,
    automatedBills: false,
  } as Record<string, boolean>,
  wholesale: {
    salesInvoices: true,
    quotations: true,
    paymentIn: true,
    salesReturns: true,
    creditDebitNotes: true,
    deliveryChallan: true,
    proformaInvoice: true,
    posBilling: false,
    posOrders: false,
    purchaseInvoices: true,
    purchaseOrders: true,
    paymentOut: true,
    purchaseReturns: true,
    expenses: true,
    itemsInventory: true,
    stockTransfers: true,
    categoriesUnits: true,
    hsnSac: true,
    barcodeThermal: true,
    partiesDirectory: true,
    partyStatements: true,
    cashBank: true,
    doubleEntryLedgers: true,
    gstReports: true,
    eInvoiceEwaybill: true,
    gstrReconciliation: true,
    automatedBills: true,
    manufacturingBom: false,
    productionOrders: false,
    rawMaterialConsumption: false,
    whatsAppReminders: true,
    dataImport: true,
    payrollStaff: true,
    userManagementRbac: true,
    customThemes: true,
  } as Record<string, boolean>,
  manufacturing: {
    salesInvoices: true,
    quotations: true,
    paymentIn: true,
    salesReturns: true,
    creditDebitNotes: true,
    deliveryChallan: true,
    proformaInvoice: true,
    posBilling: false,
    posOrders: false,
    purchaseInvoices: true,
    purchaseOrders: true,
    paymentOut: true,
    purchaseReturns: true,
    expenses: true,
    itemsInventory: true,
    stockTransfers: true,
    categoriesUnits: true,
    hsnSac: true,
    barcodeThermal: true,
    partiesDirectory: true,
    partyStatements: true,
    cashBank: true,
    doubleEntryLedgers: true,
    gstReports: true,
    eInvoiceEwaybill: true,
    gstrReconciliation: true,
    automatedBills: true,
    manufacturingBom: true,
    productionOrders: true,
    rawMaterialConsumption: true,
    whatsAppReminders: true,
    dataImport: true,
    payrollStaff: true,
    userManagementRbac: true,
    customThemes: true,
  } as Record<string, boolean>,
};

