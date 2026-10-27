"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import { DataTable, ColumnDef } from "../../components/ui/data-table";
import { TenantCreateWizardModal, CreateTenantPayload } from "../../components/tenants/tenant-create-wizard-modal";
import { TenantDeleteModal, TenantDeleteItem } from "../../components/tenants/tenant-delete-modal";
import { TenantActionsMenu } from "../../components/tenants/tenant-actions-menu";
import { TenantEditModal, EditTenantPayload } from "../../components/tenants/tenant-edit-modal";

interface SystemStats {
  tenants: {
    total: number;
    active: number;
    suspended: number;
    trial: number;
    expired: number;
  };
  subscriptionTiers: Record<string, number>;
  infrastructure: {
    organizations: number;
    companies: number;
    branches: number;
    warehouses: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  businessVolume: {
    totalInvoices: number;
    grossVolume: number;
    totalTaxableAmount: number;
    totalGstAmount: number;
  };
  systemHealth: {
    databaseStatus: string;
    rlsStatus: string;
    totalAuditEvents: number;
    uptimeSeconds: number;
    nodeVersion: string;
    timestamp: string;
  };
}

interface TenantItem {
  id: string;
  primaryPhone: string;
  primaryEmail: string | null;
  subscriptionTier: string;
  subscriptionEnds: string;
  isActive: boolean;
  createdAt: string;
  organizations: Array<{
    id: string;
    name: string;
    legalName: string;
    userCount: number;
    users?: Array<{
      id: string;
      fullName: string;
      phone: string;
      email?: string | null;
      role: string;
      isActive: boolean;
    }>;
    companies: Array<{
      id: string;
      legalName: string;
      tradeName: string;
      gstin: string | null;
      city: string;
      stateCode: string;
      branchesCount: number;
      invoicesCount: number;
      branches?: Array<{ id: string; name: string }>;
      warehouses?: Array<{ id: string; name: string }>;
      _count?: {
        salesInvoices?: number;
      };
    }>;
  }>;
}

interface UserItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: string;
  preferredLang: string;
  isActive: boolean;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    tenantId?: string;
  } | null;
}

interface AuditLogItem {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string | null;
  recordHash: string;
  createdAt: string;
  user?: {
    id?: string;
    fullName?: string;
    phone?: string;
    role?: string;
  } | null;
  company?: {
    id?: string;
    tradeName?: string;
    legalName?: string;
  } | null;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  partyName?: string | null;
  party?: {
    id: string;
    name: string;
    phone?: string;
    gstin?: string | null;
  } | null;
  grandTotal: number;
  balanceAmount?: number;
  outstandingBalance?: number;
  status: string;
  company?: {
    id?: string;
    tradeName?: string;
    legalName?: string;
  } | null;
}

interface DiagnosticsData {
  database: {
    status: string;
    latencyMs: number;
    engine: string;
    rlsEnforced: boolean;
  };
  system: {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryHeapUsedMb: number;
    memoryRssMb: number;
    environment: string;
    timestamp: string;
  };
}

type NavSectionId = "overview" | "tenants" | "plans" | "invoices" | "users" | "audit" | "health";

const INDIAN_STATES = [
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

const TIER_META: Record<
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

function getTierInfo(tierKey: string) {
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

export default function SuperAdminPortalPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, lang, setLang } = useAuth();

  // Authoritative Server-side Verification Status
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "forbidden" | "unauthenticated" | "network_error">("checking");
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Sidebar and Navigation State
  const [activeSection, setActiveSection] = useState<NavSectionId>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters
  const [tenantSearch, setTenantSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [tenantStatusFilter, setTenantStatusFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Modals & Action States
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [viewDetailsTenant, setViewDetailsTenant] = useState<any | null>(null);
  const [editTier, setEditTier] = useState<string>("TRIAL");
  const [extendDays, setExtendDays] = useState<number>(30);
  const [isUpdatingTenant, setIsUpdatingTenant] = useState(false);

  // New Tenant Modal State
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);

  // Edit Tenant Modal State
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [isEditingTenantSaving, setIsEditingTenantSaving] = useState(false);

  // Tenant Selection, Multi-Delete & Bulk Actions State
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantsToDelete, setTenantsToDelete] = useState<TenantDeleteItem[]>([]);
  const [isDeletingTenants, setIsDeletingTenants] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Reset Password Modal
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);


  // Compute administrator avatar initials dynamically
  const adminInitials = useMemo(() => {
    const name = (user?.fullName || user?.name || user?.phone || "SA").trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "SA";
  }, [user]);

  // Server-Authoritative Zero-Trust Verification on Mount
  const verifyServerAuthorization = useCallback(async () => {
    setAuthStatus("checking");
    setAuthErrorMessage(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("billing_auth_token") : null;
      if (!token) {
        setAuthStatus("unauthenticated");
        try {
          localStorage.removeItem("billing_auth_token");
          localStorage.removeItem("billing_user_profile");
          localStorage.removeItem("billing_tenant_context");
        } catch {}
        window.location.replace("/login?redirect=/superadmin");
        return;
      }

      // 1. Authoritative identity check from server
      const me: any = await apiClient.get("/auth/me", undefined, undefined, { timeoutMs: 8000, skipAuthRedirect: true });
      const authoritativeRole = me?.user?.role || me?.role;
      if (!authoritativeRole || authoritativeRole !== "SUPER_ADMIN") {
        setAuthStatus("forbidden");
        return;
      }

      // 2. Authoritative SuperAdmin stats check
      const statsData: any = await apiClient.get("/super-admin/stats", undefined, undefined, { timeoutMs: 8000 });
      setStats(statsData);
      setAuthStatus("authorized");
    } catch (err: any) {
      if (err?.statusCode === 401) {
        setAuthStatus("unauthenticated");
        try {
          localStorage.removeItem("billing_auth_token");
          localStorage.removeItem("billing_user_profile");
          localStorage.removeItem("billing_tenant_context");
        } catch {}
        window.location.replace("/login?redirect=/superadmin&reason=session_expired");
      } else if (err?.statusCode === 403) {
        setAuthStatus("forbidden");
      } else {
        setAuthErrorMessage(err?.message || "Unable to reach server. Please check backend connection.");
        setAuthStatus("network_error");
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!authLoading) {
      verifyServerAuthorization();
    }

    const watchdogTimer = setTimeout(() => {
      if (isMounted) {
        setAuthStatus((prev) => {
          if (prev === "checking") {
            setAuthErrorMessage("Server verification took too long to respond.");
            return "network_error";
          }
          return prev;
        });
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(watchdogTimer);
    };
  }, [authLoading, verifyServerAuthorization]);

  // Fetch Tenants
  const fetchTenants = useCallback(async () => {
    if (authStatus !== "authorized") return;
    try {
      const data: any = await apiClient.get("/super-admin/tenants", {
        search: tenantSearch,
        tier: tierFilter,
        status: tenantStatusFilter,
        limit: 100,
      });
      setTenants(data?.data || []);
    } catch (err: any) {
      console.error("Failed to load tenants", err);
    }
  }, [authStatus, tenantSearch, tierFilter, tenantStatusFilter]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (authStatus !== "authorized") return;
    try {
      const data: any = await apiClient.get("/super-admin/users", {
        search: userSearch,
        role: userRoleFilter,
        limit: 100,
      });
      setUsersList(data?.data || []);
    } catch (err: any) {
      console.error("Failed to load users", err);
    }
  }, [authStatus, userSearch, userRoleFilter]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    if (authStatus !== "authorized") return;
    try {
      const data: any = await apiClient.get("/super-admin/audit-logs", {
        action: auditActionFilter,
        limit: 100,
      });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load audit logs", err);
    }
  }, [authStatus, auditActionFilter]);

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    if (authStatus !== "authorized") return;
    try {
      const data: any = await apiClient.get("/super-admin/invoices", {
        search: invoiceSearch,
        limit: 100,
      });
      setInvoices(data?.data || []);
    } catch (err: any) {
      console.error("Failed to load invoices", err);
    }
  }, [authStatus, invoiceSearch]);

  // Fetch Diagnostics
  const fetchDiagnostics = useCallback(async () => {
    if (authStatus !== "authorized") return;
    try {
      const data: any = await apiClient.get("/super-admin/diagnostics");
      setDiagnostics(data);
    } catch (err: any) {
      console.error("Failed to load diagnostics", err);
    }
  }, [authStatus]);

  // Initial load after authorized
  useEffect(() => {
    if (authStatus === "authorized") {
      setIsLoading(true);
      Promise.all([
        fetchTenants(),
        fetchUsers(),
        fetchAuditLogs(),
        fetchInvoices(),
        fetchDiagnostics(),
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [authStatus, fetchTenants, fetchUsers, fetchAuditLogs, fetchInvoices, fetchDiagnostics]);

  // Refetch when tab changes
  useEffect(() => {
    if (activeSection === "tenants") fetchTenants();
  }, [activeSection, fetchTenants]);

  useEffect(() => {
    if (activeSection === "users") fetchUsers();
  }, [activeSection, fetchUsers]);

  useEffect(() => {
    if (activeSection === "audit") fetchAuditLogs();
  }, [activeSection, fetchAuditLogs]);

  useEffect(() => {
    if (activeSection === "invoices") fetchInvoices();
  }, [activeSection, fetchInvoices]);

  useEffect(() => {
    if (activeSection === "health") fetchDiagnostics();
  }, [activeSection, fetchDiagnostics]);

  // Auto clear success banners
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // Update Tenant Subscription / Status
  const handleUpdateTenantTier = async () => {
    if (!selectedTenant) return;
    setIsUpdatingTenant(true);
    setActionError(null);
    try {
      const currentEnd = new Date(selectedTenant.subscriptionEnds);
      const baseEnd = isNaN(currentEnd.getTime()) || currentEnd.getTime() < Date.now() ? new Date() : currentEnd;
      const newEnd = new Date(baseEnd.getTime() + extendDays * 24 * 60 * 60 * 1000);

      await apiClient.patch(`/super-admin/tenants/${selectedTenant.id}`, {
        subscriptionTier: editTier,
        subscriptionEnds: newEnd.toISOString(),
      });

      setActionSuccess(
        lang === "gu"
          ? `સંસ્થા ${selectedTenant.primaryPhone} નું સબ્સ્ક્રિપ્શન પ્લાન (${editTier}) સફળતાપૂર્વક અપડેટ થયું!`
          : `Tenant ${selectedTenant.primaryPhone} subscription updated to ${editTier}!`
      );
      setSelectedTenant(null);
      await fetchTenants();
      const updatedStats: any = await apiClient.get("/super-admin/stats");
      setStats(updatedStats);
    } catch (err: any) {
      setActionError(err.message || "Failed to update tenant");
    } finally {
      setIsUpdatingTenant(false);
    }
  };

  // Toggle Tenant Active / Suspend
  const handleToggleTenantStatus = useCallback(async (tenant: TenantItem) => {
    setActionError(null);
    try {
      const newStatus = !tenant.isActive;
      await apiClient.patch(`/super-admin/tenants/${tenant.id}`, {
        isActive: newStatus,
      });

      setActionSuccess(
        lang === "gu"
          ? `સંસ્થા ${tenant.primaryPhone} ${newStatus ? "સક્રિય (Active)" : "સ્થગિત (Suspended)"} કરવામાં આવી.`
          : `Tenant ${tenant.primaryPhone} ${newStatus ? "activated" : "suspended"} successfully.`
      );
      await fetchTenants();
      const updatedStats: any = await apiClient.get("/super-admin/stats");
      setStats(updatedStats);
    } catch (err: any) {
      setActionError(err.message || "Failed to toggle tenant status");
    }
  }, [lang, fetchTenants]);

  // Toggle User Active / Inactive
  const handleToggleUserStatus = useCallback(async (userItem: UserItem) => {
    setActionError(null);
    try {
      const newStatus = !userItem.isActive;
      await apiClient.patch(`/super-admin/users/${userItem.id}`, {
        isActive: newStatus,
      });

      setActionSuccess(
        lang === "gu"
          ? `વપરાશકર્તા ${userItem.fullName} ${newStatus ? "સક્રિય" : "નિષ્ક્રિય"} કરવામાં આવ્યા.`
          : `User ${userItem.fullName} ${newStatus ? "activated" : "deactivated"}.`
      );
      await fetchUsers();
    } catch (err: any) {
      setActionError(err.message || "Failed to toggle user status");
    }
  }, [lang, fetchUsers]);

  // Reset User Password
  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPasswordVal) return;
    setIsResettingPassword(true);
    setActionError(null);
    try {
      await apiClient.patch(`/super-admin/users/${resetPasswordUser.id}`, {
        newPassword: newPasswordVal,
      });

      setActionSuccess(
        lang === "gu"
          ? `વપરાશકર્તા ${resetPasswordUser.fullName} નો પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો.`
          : `Password reset successfully for ${resetPasswordUser.fullName}.`
      );
      setResetPasswordUser(null);
      setNewPasswordVal("");
    } catch (err: any) {
      setActionError(err.message || "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Create New Tenant via Guided Wizard
  const handleWizardCreateTenant = async (payload: CreateTenantPayload) => {
    setIsCreatingTenant(true);
    setActionError(null);
    try {
      await apiClient.post("/super-admin/tenants", {
        organizationName: payload.organizationName,
        tradeName: payload.tradeName,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        password: payload.password?.trim() || undefined,
        subscriptionTier: payload.subscriptionTier,
        daysValid: payload.daysValid,
        stateCode: payload.stateCode,
        gstin: payload.gstin,
        city: payload.city,
        pincode: payload.pincode,
      });

      setActionSuccess(
        lang === "gu"
          ? `નવી સંસ્થા "${payload.organizationName}" સફળતાપૂર્વક બનાવી દીધી!`
          : `New tenant "${payload.organizationName}" created successfully!`
      );
      setIsCreateTenantOpen(false);
      await fetchTenants();
      const updatedStats: any = await apiClient.get("/super-admin/stats");
      setStats(updatedStats);
    } catch (err: any) {
      setActionError(err.message || "Failed to create tenant");
      throw err;
    } finally {
      setIsCreatingTenant(false);
    }
  };

  // Open Delete Modal for Single Tenant
  const handleOpenSingleDelete = useCallback((tenant: TenantItem) => {
    const orgNames = (tenant.organizations || []).map((o) => o.name).filter(Boolean);
    const orgName = orgNames[0] || tenant.primaryPhone || tenant.id;
    const compCount = (tenant.organizations || []).reduce((s, o) => s + (o.companies?.length || 0), 0);
    const invCount = (tenant.organizations || []).reduce(
      (s, o) => s + (o.companies || []).reduce((cs, c) => cs + (c.invoicesCount || 0), 0),
      0
    );

    setTenantsToDelete([
      {
        id: tenant.id,
        name: orgName,
        phone: tenant.primaryPhone,
        companyCount: compCount,
        invoiceCount: invCount,
      },
    ]);
    setIsDeleteModalOpen(true);
  }, []);

  // Open Delete Modal for Bulk Selected Tenants
  const handleOpenBulkDelete = useCallback(() => {
    if (selectedTenantIds.size === 0) return;
    const targetItems: TenantDeleteItem[] = tenants
      .filter((t) => {
        const isMaster =
          t.id === "3ecc34a6-da03-4a23-a2f9-c3c662b62327" ||
          t.primaryPhone === "9999900000" ||
          t.primaryEmail === "superadmin@billing.local";
        return selectedTenantIds.has(t.id) && !isMaster;
      })
      .map((t) => {
        const orgNames = (t.organizations || []).map((o) => o.name).filter(Boolean);
        const orgName = orgNames[0] || t.primaryPhone || t.id;
        const compCount = (t.organizations || []).reduce((s, o) => s + (o.companies?.length || 0), 0);
        const invCount = (t.organizations || []).reduce(
          (s, o) => s + (o.companies || []).reduce((cs, c) => cs + (c.invoicesCount || 0), 0),
          0
        );
        return {
          id: t.id,
          name: orgName,
          phone: t.primaryPhone,
          companyCount: compCount,
          invoiceCount: invCount,
        };
      });

    if (targetItems.length === 0) {
      setActionError(
        lang === "gu"
          ? "પસંદ કરેલ ટેનન્ટ મુખ્ય HQ સુપરએડમિન ખાતું છે જેને કાઢી શકાતું નથી."
          : "The selected tenant is the Master SuperAdmin Platform account and cannot be deleted."
      );
      return;
    }

    setTenantsToDelete(targetItems);
    setIsDeleteModalOpen(true);
  }, [selectedTenantIds, tenants, lang]);

  // Execute Permanent Tenant Deletion (Single or Bulk)
  const handleConfirmDelete = async () => {
    if (!tenantsToDelete.length) return;
    setIsDeletingTenants(true);
    setActionError(null);
    try {
      const ids = tenantsToDelete.map((t) => t.id);
      if (ids.length === 1) {
        await apiClient.delete(`/super-admin/tenants/${ids[0]}`);
      } else {
        await apiClient.post("/super-admin/tenants/bulk-delete", { tenantIds: ids });
      }

      setActionSuccess(
        lang === "gu"
          ? `${ids.length} સંસ્થા/ટેનન્ટ સફળતાપૂર્વક કાઢી નાખ્યા!`
          : `Successfully deleted ${ids.length} tenant(s)!`
      );
      setSelectedTenantIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setIsDeleteModalOpen(false);
      setTenantsToDelete([]);
      await fetchTenants();
      const updatedStats: any = await apiClient.get("/super-admin/stats");
      setStats(updatedStats);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete tenant(s)");
    } finally {
      setIsDeletingTenants(false);
    }
  };

  // Bulk Status Update (Activate / Suspend)
  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedTenantIds.size === 0) return;
    setIsBulkUpdating(true);
    setActionError(null);
    try {
      const ids = Array.from(selectedTenantIds);
      await apiClient.post("/super-admin/tenants/bulk-status", {
        tenantIds: ids,
        isActive,
      });

      setActionSuccess(
        lang === "gu"
          ? `${ids.length} સંસ્થાઓની સ્થિતિ સફળતાપૂર્વક અપડેટ થઈ!`
          : `Successfully updated status for ${ids.length} tenant(s)!`
      );
      await fetchTenants();
      const updatedStats: any = await apiClient.get("/super-admin/stats");
      setStats(updatedStats);
    } catch (err: any) {
      setActionError(err.message || "Failed to update tenant status");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Synchronized Navigation with URL Query Params (?tab=...)
  const navigateSection = useCallback((sectionId: NavSectionId) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", sectionId);
      if (sectionId !== "tenants") {
        url.searchParams.delete("editTenantId");
      }
      window.history.pushState(null, "", url.pathname + url.search);
    }
  }, []);

  // Sync tab & deep-linked edit tenant from URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as NavSectionId | null;
    if (tabParam && ["overview", "tenants", "plans", "invoices", "users", "audit", "health"].includes(tabParam)) {
      setActiveSection(tabParam);
    }
  }, []);

  // When tenants load or when editTenantId exists in URL, open edit modal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const editTenantId = params.get("editTenantId");
    if (editTenantId && !editingTenant) {
      const match = tenants.find((t) => t.id === editTenantId);
      if (match) {
        setEditingTenant(match);
      } else if (tenants.length > 0) {
        apiClient.get('/super-admin/tenants/' + editTenantId)
          .then((data: any) => {
            if (data) setEditingTenant(data);
          })
          .catch(() => {});
      }
    }
  }, [tenants, editingTenant]);

  // Open Edit Tenant Modal & update URL
  const handleOpenEditTenant = useCallback((tenant: any) => {
    setEditingTenant(tenant);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "tenants");
      url.searchParams.set("editTenantId", tenant.id);
      window.history.pushState(null, "", url.pathname + url.search);
    }
  }, []);

  // Close Edit Tenant Modal & clean URL
  const handleCloseEditTenant = useCallback(() => {
    setEditingTenant(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("editTenantId");
      window.history.pushState(null, "", url.pathname + url.search);
    }
  }, []);

  // Save Tenant edits
  const handleSaveEditTenant = useCallback(async (payload: EditTenantPayload) => {
    if (!editingTenant) return;
    setIsEditingTenantSaving(true);
    setActionError(null);
    try {
      await apiClient.patch('/super-admin/tenants/' + editingTenant.id, payload);
      setActionSuccess(
        lang === "gu"
          ? 'ટેનન્ટ ' + (payload.organizationName || '') + ' ની વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.'
          : 'Tenant ' + (payload.organizationName || '') + ' updated successfully.'
      );
      handleCloseEditTenant();
      await fetchTenants();
    } catch (err: any) {
      throw new Error(err.message || "Failed to update tenant");
    } finally {
      setIsEditingTenantSaving(false);
    }
  }, [editingTenant, lang, handleCloseEditTenant, fetchTenants]);

  // View Tenant Deep Details
  const handleViewTenantDetails = useCallback(async (tenantId: string) => {
    try {
      const details = await apiClient.get(`/super-admin/tenants/${tenantId}`);
      setViewDetailsTenant(details);
    } catch (err: any) {
      setActionError(err.message || "Failed to load tenant details");
    }
  }, []);

  // Secure Support Session / Impersonation
  const handleImpersonateTenant = useCallback(async (companyId: string, companyName: string) => {
    try {
      const res: any = await apiClient.post("/super-admin/impersonate", {
        companyId,
        reason: "Customer support & account inspection",
      });
      if (res?.targetContext) {
        const originalToken = localStorage.getItem("billing_auth_token");
        if (res.supportToken) {
          localStorage.setItem("billing_auth_token", res.supportToken);
        }
        localStorage.setItem("billing_tenant_context", JSON.stringify(res.targetContext));
        localStorage.setItem(
          "billing_support_session",
          JSON.stringify({
            isSupportSession: true,
            companyName: res.targetContext.companyName || companyName,
            companyId,
            sessionId: res.sessionId,
            originalToken,
          })
        );
        setActionSuccess(`Support session established for ${companyName}. Entering business dashboard...`);
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to enter tenant context");
    }
  }, [router]);

  const formatInr = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // ================= DATA TABLES COLUMN DEFINITIONS =================
  const tenantColumns: ColumnDef<TenantItem>[] = useMemo(() => [
    {
      id: "organization",
      header: lang === "gu" ? "સંસ્થા / ટેનન્ટ આઈડી" : "ORGANIZATION / TENANT",
      sortable: true,
      sticky: true,
      headerClassName: "min-w-[210px]",
      className: "min-w-[210px]",
      accessorFn: (t) => {
        const names = (t.organizations || []).map((o) => o.name).filter(Boolean);
        return names.join(", ") || t.primaryPhone || t.id;
      },
      cell: (t) => {
        const orgNames = (t.organizations || []).map((o) => o.name).filter(Boolean);
        const primaryOrgName = orgNames[0] || (lang === "gu" ? "અનામી સંસ્થા" : "Unnamed Organization");
        const extraCount = orgNames.length > 1 ? orgNames.length - 1 : 0;

        const words = primaryOrgName.trim().split(/\s+/);
        const initials =
          words.length >= 2 && words[0] && words[1]
            ? (words[0][0] + words[1][0]).toUpperCase()
            : primaryOrgName.slice(0, 2).toUpperCase() || "TN";

        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#DDD6FE]/60 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs truncate max-w-[190px] xl:max-w-[240px]" title={primaryOrgName}>
                <span>{primaryOrgName}</span>
                {extraCount > 0 && (
                  <span className="ml-1 text-[10px] text-purple-600 font-normal">
                    (+{extraCount})
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[190px] xl:max-w-[240px]" title={t.id}>
                {t.id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "contact",
      header: lang === "gu" ? "પ્રાથમિક સંપર્ક" : "PRIMARY CONTACT",
      sortable: true,
      accessorKey: "primaryPhone",
      cell: (t) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{t.primaryPhone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">
              {t.primaryEmail ? (
                t.primaryEmail
              ) : (
                <span className="text-slate-300 font-sans">—</span>
              )}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "planTier",
      header: lang === "gu" ? "પ્લાન ટિયર" : "PLAN TIER",
      sortable: true,
      accessorKey: "subscriptionTier",
      cell: (t) => {
        const meta = getTierInfo(t.subscriptionTier);
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono border tracking-wider ${meta.badgeStyle}`}
          >
            {t.subscriptionTier}
          </span>
        );
      },
    },
    {
      id: "expiryDate",
      header: lang === "gu" ? "સમાપ્તિ તારીખ" : "EXPIRY DATE",
      sortable: true,
      accessorKey: "subscriptionEnds",
      cell: (t) => {
        const d = new Date(t.subscriptionEnds);
        const formattedDate = isNaN(d.getTime())
          ? "—"
          : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        const isExpired = d.getTime() < Date.now();
        const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const subtitle = isExpired
          ? lang === "gu"
            ? "સમાપ્ત (Expired)"
            : "Expired"
          : lang === "gu"
          ? `${daysLeft} દિવસ બાકી`
          : `${daysLeft} days left`;

        return (
          <div>
            <div className={`text-xs font-semibold font-mono ${isExpired ? "text-rose-600 font-bold" : "text-slate-800"}`}>
              {formattedDate}
            </div>
            <div
              className={`text-[11px] font-medium mt-0.5 ${
                isExpired ? "text-rose-500" : daysLeft <= 15 ? "text-amber-600" : "text-slate-400"
              }`}
            >
              {subtitle}
            </div>
          </div>
        );
      },
    },
    {
      id: "companies",
      header: lang === "gu" ? "કંપનીઓ અને બિલ" : "COMPANIES & INVOICES",
      sortable: false,
      cell: (t) => {
        const totalCompanies = (t.organizations || []).reduce(
          (sum, org) => sum + (org.companies?.length || 0),
          0
        );
        const totalInvoices = (t.organizations || []).reduce(
          (sum, org) =>
            sum +
            (org.companies || []).reduce((cSum, comp) => cSum + (comp.invoicesCount || 0), 0),
          0
        );
        const totalUsers = (t.organizations || []).reduce(
          (sum, org) => sum + (org.userCount || 0),
          0
        );

        const companyLabel =
          totalCompanies === 1
            ? lang === "gu"
              ? "કંપની"
              : "Company"
            : lang === "gu"
            ? "કંપનીઓ"
            : "Companies";

        const invoiceLabel = lang === "gu" ? "ઇન્વૉઇસ" : "Invoices";
        const userLabel = lang === "gu" ? "વપરાશકર્તા" : "User(s)";

        return (
          <div>
            <div className="font-bold text-slate-900 text-xs">
              {totalCompanies} {companyLabel}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {totalInvoices} {invoiceLabel} • {totalUsers} {userLabel}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: lang === "gu" ? "સ્થિતિ" : "STATUS",
      sortable: true,
      accessorFn: (t) => (t.isActive ? "Active" : "Suspended"),
      cell: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleTenantStatus(t);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
            t.isActive
              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] hover:bg-[#D1FAE5]"
              : "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] hover:bg-[#FFE4E6]"
          }`}
          title="Click to toggle Active / Suspended status"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span>{t.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "સ્થગિત" : "Suspended")}</span>
        </button>
      ),
    },
    {
      id: "actions",
      header: lang === "gu" ? "ક્રિયાઓ" : "ACTIONS",
      sortable: false,
      headerClassName: "text-left",
      cell: (t) => (
        <TenantActionsMenu
          tenant={t}
          onViewDetails={handleViewTenantDetails}
          onEditTenant={handleOpenEditTenant}
          onManageLicense={(item) => {
            setSelectedTenant(item);
            setEditTier(item.subscriptionTier);
          }}
          onToggleStatus={handleToggleTenantStatus}
          onDeleteTenant={handleOpenSingleDelete}
          onEnterPortal={(cid, cname) => handleImpersonateTenant(cid, cname)}
          lang={lang}
        />
      ),
    },
  ], [
    lang,
    handleToggleTenantStatus,
    handleViewTenantDetails,
    handleOpenEditTenant,
    handleImpersonateTenant,
    handleOpenSingleDelete,
  ]);

  const invoiceColumns: ColumnDef<InvoiceItem>[] = useMemo(() => [
    {
      id: "invoiceNumber",
      header: lang === "gu" ? "ઇન્વૉઇસ નંબર" : "Invoice #",
      sortable: true,
      accessorKey: "invoiceNumber",
      className: "font-mono font-bold text-purple-700",
    },
    {
      id: "invoiceDate",
      header: lang === "gu" ? "તારીખ" : "Date",
      sortable: true,
      accessorKey: "invoiceDate",
      cell: (inv) => {
        const d = new Date(inv.invoiceDate);
        return (
          <span className="text-[#667085]">
            {isNaN(d.getTime()) ? "—" : d.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "company",
      header: lang === "gu" ? "કંપની" : "Issuing Company",
      sortable: true,
      accessorFn: (inv) => inv.company?.tradeName || inv.company?.legalName || "—",
      className: "font-bold text-[#202124]",
    },
    {
      id: "partyName",
      header: lang === "gu" ? "ગ્રાહક / પાર્ટી" : "Party / Customer",
      sortable: true,
      accessorFn: (inv) =>
        inv.party?.name ||
        inv.partyName ||
        (lang === "gu" ? "કાઉન્ટર વેચાણ (રોકડ)" : "Counter / Direct Sale"),
      className: "text-[#667085]",
    },
    {
      id: "grandTotal",
      header: lang === "gu" ? "કુલ રકમ" : "Grand Total",
      sortable: true,
      accessorKey: "grandTotal",
      className: "font-mono font-bold text-[#202124]",
      cell: (inv) => formatInr(Number(inv.grandTotal || 0)),
    },
    {
      id: "balance",
      header: lang === "gu" ? "બાકી રકમ" : "Balance Due",
      sortable: true,
      accessorFn: (inv) => inv.balanceAmount ?? inv.outstandingBalance ?? 0,
      className: "font-mono font-semibold text-slate-700",
      cell: (inv) => formatInr(Number(inv.balanceAmount ?? inv.outstandingBalance ?? 0)),
    },
    {
      id: "status",
      header: lang === "gu" ? "સ્થિતિ" : "Status",
      sortable: true,
      accessorKey: "status",
      cell: (inv) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
          {inv.status}
        </span>
      ),
    },
  ], [lang]);

  const userColumns: ColumnDef<UserItem>[] = useMemo(() => [
    {
      id: "fullName",
      header: lang === "gu" ? "પૂરું નામ" : "Full Name",
      sortable: true,
      accessorKey: "fullName",
      className: "font-bold text-[#202124]",
    },
    {
      id: "phone",
      header: lang === "gu" ? "ફોન / ઓળખકર્તા" : "Phone / Identifier",
      sortable: true,
      accessorKey: "phone",
      className: "font-mono",
    },
    {
      id: "email",
      header: lang === "gu" ? "ઈમેલ એડ્રેસ" : "Email Address",
      sortable: true,
      accessorKey: "email",
      className: "font-mono text-[#667085]",
      cell: (u) => u.email || <span className="text-slate-300 font-sans">—</span>,
    },
    {
      id: "role",
      header: lang === "gu" ? "ભૂમિકા" : "Role",
      sortable: true,
      accessorKey: "role",
      cell: (u) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
            u.role === "SUPER_ADMIN"
              ? "bg-purple-100 text-purple-800 border border-purple-300"
              : u.role === "COMPANY_ADMIN"
              ? "bg-orange-100 text-orange-800 border border-orange-300"
              : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      id: "organization",
      header: lang === "gu" ? "સંસ્થા" : "Organization",
      sortable: true,
      accessorFn: (u) =>
        u.organization?.name ||
        (u.role === "SUPER_ADMIN"
          ? lang === "gu"
            ? "પ્લેટફોર્મ સુપર એડમિન"
            : "Platform SuperAdmin"
          : "—"),
      className: "text-[#667085]",
    },
    {
      id: "status",
      header: lang === "gu" ? "સ્થિતિ" : "Status",
      sortable: true,
      accessorFn: (u) => (u.isActive ? "Active" : "Inactive"),
      cell: (u) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            u.isActive ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-rose-700 bg-rose-50 border border-rose-200"
          }`}
        >
          {u.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "નિષ્ક્રિય" : "Inactive")}
        </span>
      ),
    },
    {
      id: "actions",
      header: lang === "gu" ? "ક્રિયાઓ" : "Actions",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      cell: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setResetPasswordUser(u);
              setNewPasswordVal("");
            }}
            className="px-2.5 py-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] rounded-md text-[11px] font-bold transition-all cursor-pointer"
          >
            {lang === "gu" ? "પાસવર્ડ રીસેટ" : "Reset Password"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleUserStatus(u);
            }}
            className="px-2.5 py-1 bg-white hover:bg-[#F8F9FB] text-[#667085] hover:text-[#202124] border border-[#E5E7EB] rounded-md text-[11px] font-semibold cursor-pointer"
          >
            {u.isActive ? (lang === "gu" ? "નિષ્ક્રિય કરો" : "Deactivate") : (lang === "gu" ? "સક્રિય કરો" : "Activate")}
          </button>
        </div>
      ),
    },
  ], [lang, handleToggleUserStatus]);

  const auditColumns: ColumnDef<AuditLogItem>[] = useMemo(() => [
    {
      id: "createdAt",
      header: lang === "gu" ? "સમય" : "Timestamp",
      sortable: true,
      accessorKey: "createdAt",
      cell: (log) => {
        const d = new Date(log.createdAt);
        return (
          <span className="text-[#667085] font-mono text-[11px]">
            {isNaN(d.getTime()) ? "—" : d.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "action",
      header: lang === "gu" ? "ક્રિયા" : "Action",
      sortable: true,
      accessorKey: "action",
      cell: (log) => (
        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono text-[11px]">
          {log.action}
        </span>
      ),
    },
    {
      id: "entityName",
      header: lang === "gu" ? "એન્ટિટી" : "Entity",
      sortable: true,
      accessorKey: "entityName",
      className: "text-[#202124] font-mono text-[11px]",
    },
    {
      id: "actor",
      header: lang === "gu" ? "વપરાશકર્તા" : "Actor User",
      sortable: true,
      accessorFn: (log) =>
        log.user?.fullName ||
        log.user?.phone ||
        (lang === "gu" ? "સિસ્ટમ પ્રોસેસ" : "System Process"),
      className: "font-sans font-bold text-[#202124]",
    },
    {
      id: "company",
      header: lang === "gu" ? "કંપની સંદર્ભ" : "Company Context",
      sortable: true,
      accessorFn: (log) =>
        log.company?.tradeName ||
        log.company?.legalName ||
        (lang === "gu" ? "પ્લેટફોર્મ ગ્લોબલ" : "Platform Global"),
      className: "font-sans text-[#667085] truncate max-w-[140px]",
    },
    {
      id: "hash",
      header: lang === "gu" ? "ક્રિપ્ટોગ્રાફિક હેશ" : "Cryptographic Hash",
      sortable: false,
      className: "text-[#98A2B3] truncate max-w-[130px] font-mono text-[11px]",
      cell: (log) => (
        <span title={log.recordHash}>
          {log.recordHash ? `${log.recordHash.substring(0, 16)}...` : "—"}
        </span>
      ),
    },
  ], [lang]);

  // 1. SAFE FORBIDDEN SCREEN
  if (authStatus === "forbidden") {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 font-bold text-3xl mb-4 shadow-xs">
          🔒
        </div>
        <h1 className="text-2xl font-black text-[#202124] tracking-tight">
          403 Forbidden
        </h1>
        <p className="text-xs text-[#667085] mt-1.5 max-w-md">
          Access denied. Platform SuperAdmin privileges are strictly required to view this console. Your account does not have authorization.
        </p>
        <div className="mt-2 text-[11px] font-mono text-[#98A2B3]">
          Security: All unauthorized privileged access attempts are cryptographically audited.
        </div>
        <Link
          href="/"
          className="mt-6 py-2.5 px-5 bg-[#F47721] hover:bg-[#D95F12] text-white rounded-xl text-xs font-bold transition-all shadow-saffron"
        >
          ← Return to Business Dashboard
        </Link>
      </div>
    );
  }

  // 2. NETWORK ERROR OR SERVER TIMEOUT SCREEN
  if (authStatus === "network_error") {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-3xl mb-4 shadow-sm">
          📡
        </div>
        <h1 className="text-2xl font-black text-[#202124] tracking-tight">
          Backend Connection Failed
        </h1>
        <p className="text-xs text-[#667085] mt-1.5 max-w-md">
          {authErrorMessage || "Unable to reach the server to verify administrative privileges. Please ensure the backend service is running."}
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => verifyServerAuthorization()}
            className="py-2.5 px-5 bg-[#F47721] hover:bg-[#D95F12] active:bg-[#B94B0A] text-white rounded-xl text-xs font-bold transition-all shadow-saffron cursor-pointer"
          >
            Retry Verification
          </button>
          <Link
            href="/"
            className="py-2.5 px-5 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#344054] rounded-xl text-xs font-semibold transition-all"
          >
            ← Business Dashboard
          </Link>
          <Link
            href="/login"
            className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-[#344054] rounded-xl text-xs font-semibold transition-all"
          >
            Login Screen
          </Link>
        </div>
      </div>
    );
  }

  // 3. CHECKING AUTHORIZATION LOADING SCREEN
  if (authStatus === "checking" || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-purple-500/20 animate-pulse mb-3">
          🛡️
        </div>
        <p className="text-base font-bold text-[#202124]">
          MyBill Master Operations
        </p>
        <p className="text-xs text-[#98A2B3] mt-1 font-mono">
          Verifying server authorization...
        </p>
      </div>
    );
  }

  // 4. UNAUTHENTICATED REDIRECT FALLBACK
  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F47721] to-[#FF9B50] flex items-center justify-center text-white font-bold text-3xl shadow-saffron animate-pulse mb-3">
          ₹
        </div>
        <p className="text-base font-bold text-[#202124]">
          Redirecting to Login...
        </p>
        <p className="text-xs text-[#98A2B3] mt-1 font-mono">
          Platform administrator authentication required.
        </p>
      </div>
    );
  }

  // Navigation Items for Sidebar
  const navItems = [
    {
      id: "overview" as NavSectionId,
      name: "Dashboard & Overview",
      nameGujarati: "મુખ્ય ડેશબોર્ડ",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "tenants" as NavSectionId,
      name: "Tenants & Organizations",
      nameGujarati: "સંસ્થાઓ અને ગ્રાહકો",
      badge: stats ? String(stats.tenants?.total ?? 0) : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "plans" as NavSectionId,
      name: "Subscription Plans",
      nameGujarati: "પ્લાન્સ અને લાયસન્સ",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      id: "invoices" as NavSectionId,
      name: "Invoices Explorer",
      nameGujarati: "બિઝનેસ બિલિંગ એક્સપ્લોરર",
      badge: stats ? String(stats.businessVolume?.totalInvoices ?? 0) : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "users" as NavSectionId,
      name: "Platform Users",
      nameGujarati: "વપરાશકર્તાઓ",
      badge: stats ? String(stats.users?.total ?? 0) : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "audit" as NavSectionId,
      name: "Global Audit Trail",
      nameGujarati: "વૈશ્વિક ઓડિટ ટ્રેઇલ",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "health" as NavSectionId,
      name: "System Diagnostics",
      nameGujarati: "સિસ્ટમ ડાયગ્નોસ્ટિક્સ",
      badge: diagnostics?.database?.status === "HEALTHY" ? "OK" : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex">
      {/* ===================== 1. DEDICATED LEFT SIDEBAR ===================== */}
      <aside
        className={`bg-white border-r border-[#E2E8F0] transition-all duration-200 shrink-0 flex flex-col justify-between z-30 sticky top-0 h-screen ${
          isSidebarCollapsed ? "w-20" : "w-[280px]"
        } hidden lg:flex shadow-xs`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="h-[74px] flex items-center justify-between px-5 border-b border-[#F1F5F9]">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="#7C3AED" />
                    <path d="M3 10.5L12 15L21 10.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 14.5L12 19L21 14.5" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                  </svg>
                </div>

                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[15px] tracking-tight text-slate-900 truncate">
                      SuperAdmin
                    </span>
                    <span className="text-[10px] bg-[#F5F0FF] text-[#7C3AED] font-bold px-1.5 py-0.2 rounded-md font-mono uppercase">
                      HQ
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate font-medium">
                    Platform Master Console
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="#7C3AED" />
                  <path d="M3 10.5L12 15L21 10.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 14.5L12 19L21 14.5" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </svg>
              </div>
            )}

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Primary Action: + Create New Tenant Button */}
          <div className="p-4 border-b border-[#F1F5F9]">
            {!isSidebarCollapsed ? (
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>{lang === "gu" ? "નવી સંસ્થા બનાવો" : "Create New Tenant"}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                className="w-10 h-10 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center mx-auto cursor-pointer"
                title="Create New Tenant"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateSection(item.id)}
                  title={isSidebarCollapsed ? (lang === "gu" ? item.nameGujarati : item.name) : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-[#F5F0FF] text-[#7C3AED] border border-[#EDE4FF] shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <span className={`shrink-0 ${isActive ? "text-[#7C3AED]" : "text-slate-500"}`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{lang === "gu" ? item.nameGujarati : item.name}</span>
                      {item.badge && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-medium ${
                          isActive ? "bg-purple-100 text-[#7C3AED]" : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer with Administrator Profile */}
        <div className="p-3.5 border-t border-[#F1F5F9] bg-white">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] font-bold text-xs shrink-0">
                  {adminInitials}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user?.fullName || user?.name || (user?.phone ? `SuperAdmin (${user.phone})` : "SuperAdmin")}
                  </span>
                  <span className="text-[10px] text-[#7C3AED] font-mono font-bold truncate">
                    {user?.role || "SUPER_ADMIN"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] font-bold text-xs">
                {adminInitials}
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Expand sidebar"
              >
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===================== 2. MAIN APPLICATION WORKSPACE ===================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F6F8FC] to-[#F5F2FC] relative">
        <div className="absolute top-0 right-0 w-[550px] h-[350px] bg-gradient-to-bl from-purple-100/40 via-indigo-50/20 to-transparent pointer-events-none rounded-full blur-3xl" />

        {/* TOPBAR NAVIGATION */}
        <header className="h-[74px] bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <div className="text-[#7C3AED]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-500 font-medium">SuperAdmin</span>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-extrabold text-slate-900">
                {lang === "gu"
                  ? navItems.find((n) => n.id === activeSection)?.nameGujarati
                  : navItems.find((n) => n.id === activeSection)?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 py-2 px-3.5 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA]/60 rounded-xl text-xs font-semibold transition-all shadow-xs"
              title="Launch SME Business Billing Portal"
            >
              <svg className="w-4 h-4 text-[#EA580C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">
                {lang === "gu" ? "વેપારી ડેશબોર્ડ" : "Business Dashboard"}
              </span>
            </Link>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{lang === "gu" ? "GU" : "EN"}</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fadeIn">
                  <button
                    onClick={() => {
                      setLang("en");
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      lang === "en" ? "bg-purple-50 text-purple-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>English</span>
                    {lang === "en" && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLang("gu");
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      lang === "gu" ? "bg-purple-50 text-purple-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>ગુજરાતી</span>
                    {lang === "gu" && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setLang(lang === "en" ? "gu" : "en")}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Toggle Gujarati / English"
            >
              {lang === "en" ? "ગુજરાતી" : "English"}
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* ALERTS & NOTIFICATIONS */}
        {actionSuccess && (
          <div className="mx-6 sm:mx-8 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="mx-6 sm:mx-8 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* ===================== 3. PAGE BODY CONTENT ===================== */}
        <main className="flex-1 p-5 sm:p-7 w-full max-w-[1920px] mx-auto space-y-6 relative z-10">
          {/* SKELETON LOADING STATE FOR OVERVIEW */}
          {activeSection === "overview" && !stats && (
            <div className="space-y-6 animate-pulse">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="h-8 bg-slate-200 rounded-xl w-64 mb-2" />
                  <div className="h-4 bg-slate-100 rounded-lg w-96" />
                </div>
                <div className="flex gap-2.5">
                  <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                  <div className="h-9 w-28 bg-purple-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 h-[152px] flex flex-col justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-100" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-slate-100 rounded w-24" />
                        <div className="h-7 bg-slate-200 rounded w-16" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-32" />
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
                <div className="h-5 bg-slate-200 rounded w-64 mb-5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl h-24" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 1: OVERVIEW & DASHBOARD ================= */}
          {activeSection === "overview" && stats && (
            <div className="space-y-6 animate-fadeIn">
              {/* Dashboard Page Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {lang === "gu" ? "પ્લેટફોર્મ ડેશબોર્ડ અને મોનિટરિંગ" : "Platform Overview & Analytics"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "gu"
                      ? "રીયલ-ટાઇમ મલ્ટી-ટેનન્ટ ટેલિમેટ્રી, સબ્સ્ક્રિપ્શન વિતરણ અને ટ્રાન્ઝેક્શનલ વોલ્યુમ."
                      : "Real-time multi-tenant telemetry, subscription distribution, and transactional volume."}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      fetchTenants();
                      apiClient
                        .get("/super-admin/stats")
                        .then((d: any) => setStats(d))
                        .finally(() => setIsLoading(false));
                    }}
                    className="py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{lang === "gu" ? "રીફ્રેશ" : "Refresh"}</span>
                  </button>
                  <button
                    onClick={() => setIsCreateTenantOpen(true)}
                    className="py-2 px-4 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{lang === "gu" ? "નવી સંસ્થા" : "New Tenant"}</span>
                  </button>
                </div>
              </div>

              {/* 4 Large KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1: TOTAL TENANTS */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[152px] hover:shadow-md transition-all">
                  <div className="relative z-10 flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                        {lang === "gu" ? "કુલ સંસ્થાઓ" : "TOTAL TENANTS"}
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                        {stats.tenants.total}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 text-xs font-semibold mt-2">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {stats.tenants.active} {lang === "gu" ? "સક્રિય" : "Active"}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {stats.tenants.trial} {lang === "gu" ? "ટ્રાયલ" : "Trial"}
                    </span>
                  </div>

                  <div className="absolute -bottom-1 -right-2 w-36 h-16 pointer-events-none opacity-80">
                    <svg viewBox="0 0 140 60" fill="none" className="w-full h-full">
                      <path d="M0 45 C 30 50, 45 20, 75 35 C 105 50, 120 10, 140 25 L 140 60 L 0 60 Z" fill="url(#purpleGradKPI)" />
                      <path d="M0 45 C 30 50, 45 20, 75 35 C 105 50, 120 10, 140 25" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="purpleGradKPI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FAF5FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* KPI 2: COMPANIES & BRANCHES */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[152px] hover:shadow-md transition-all">
                  <div className="relative z-10 flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                        <span className="text-slate-400">•</span>
                        <span>{lang === "gu" ? "કંપનીઓ અને બ્રાન્ચ" : "COMPANIES & BRANCHES"}</span>
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                        {stats.infrastructure.companies}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 text-xs font-semibold mt-2">
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {stats.infrastructure.branches} {lang === "gu" ? "બ્રાન્ચ" : "Branches"}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {stats.infrastructure.warehouses} {lang === "gu" ? "ગોડાઉન" : "Godowns"}
                    </span>
                  </div>

                  <div className="absolute -bottom-1 -right-2 w-36 h-16 pointer-events-none opacity-80">
                    <svg viewBox="0 0 140 60" fill="none" className="w-full h-full">
                      <path d="M0 48 C 25 45, 50 15, 80 32 C 110 48, 125 15, 140 20 L 140 60 L 0 60 Z" fill="url(#blueGradKPI)" />
                      <path d="M0 48 C 25 45, 50 15, 80 32 C 110 48, 125 15, 140 20" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="blueGradKPI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#F0F9FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* KPI 3: GROSS BILLING VOLUME */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[152px] hover:shadow-md transition-all">
                  <div className="relative z-10 flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 font-bold text-xl">
                      ₹
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                        {lang === "gu" ? "કુલ બિલિંગ વોલ્યુમ" : "GROSS BILLING VOLUME"}
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                        {formatInr(stats.businessVolume.grossVolume)}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-xs font-semibold mt-2 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{stats.businessVolume.totalInvoices} {lang === "gu" ? "ઇન્વૉઇસ ઇસ્યુ થયા" : "Invoices Issued"}</span>
                  </div>

                  <div className="absolute -bottom-1 -right-2 w-36 h-16 pointer-events-none opacity-80">
                    <svg viewBox="0 0 140 60" fill="none" className="w-full h-full">
                      <path d="M0 50 C 35 45, 60 20, 90 35 C 115 48, 125 12, 140 18 L 140 60 L 0 60 Z" fill="url(#emeraldGradKPI)" />
                      <path d="M0 50 C 35 45, 60 20, 90 35 C 115 48, 125 12, 140 18" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="emeraldGradKPI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ECFDF5" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* KPI 4: AUDIT RECORDS */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[152px] hover:shadow-md transition-all">
                  <div className="relative z-10 flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                        <span className="text-slate-400">•</span>
                        <span>{lang === "gu" ? "ઓડિટ રેકોર્ડ્સ" : "AUDIT RECORDS"}</span>
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                        {stats.systemHealth.totalAuditEvents}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 text-xs font-semibold mt-2">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-mono">
                      <span className={`w-1.5 h-1.5 rounded-full ${stats.systemHealth?.rlsStatus === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {stats.systemHealth?.rlsStatus === "ACTIVE" ? "RLS Enforced" : "RLS Inactive"}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${(stats.systemHealth?.totalAuditEvents ?? 0) > 0 ? "bg-slate-400" : "bg-slate-300"}`} />
                      {(stats.systemHealth?.totalAuditEvents ?? 0) > 0 ? "Hash Chained" : "Audit Idle"}
                    </span>
                  </div>

                  <div className="absolute -bottom-1 -right-2 w-36 h-16 pointer-events-none opacity-80">
                    <svg viewBox="0 0 140 60" fill="none" className="w-full h-full">
                      <path d="M0 46 C 30 52, 50 18, 85 34 C 110 46, 125 14, 140 22 L 140 60 L 0 60 Z" fill="url(#pinkGradKPI)" />
                      <path d="M0 46 C 30 52, 50 18, 85 34 C 110 46, 125 14, 140 22" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="pinkGradKPI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F472B6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FDF2F8" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* DYNAMIC SUBSCRIPTION TIERS DISTRIBUTION SECTION */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="text-[#7C3AED]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                      {lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન વિતરણ" : "SUBSCRIPTION TIERS DISTRIBUTION"}
                    </h3>
                  </div>
                  <button
                    onClick={() => navigateSection("plans")}
                    className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-bold flex items-center gap-1 group transition-colors cursor-pointer"
                  >
                    <span>{lang === "gu" ? "તમામ પ્લાન જુઓ" : "View Plans"}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                  {Object.entries(stats.subscriptionTiers || {}).map(([tierKey, count]) => {
                    const meta = getTierInfo(tierKey);
                    const pct = stats.tenants.total > 0 ? Math.round((count / stats.tenants.total) * 100) : 0;
                    return (
                      <div
                        key={tierKey}
                        onClick={() => {
                          setTierFilter(tierKey);
                          navigateSection("tenants");
                        }}
                        className={`p-5 rounded-2xl relative overflow-hidden transition-all cursor-pointer flex items-center justify-between border ${meta.style}`}
                      >
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${meta.badgeStyle}`}>
                            {meta.icon()}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider block">
                              {lang === "gu" ? meta.nameGujarati : meta.name}
                            </span>
                            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                              {count}
                              <span className="text-xs font-semibold text-slate-400 ml-2 font-mono">
                                ({pct}%)
                              </span>
                            </p>
                            <span className="text-xs text-slate-500 font-medium block mt-0.5">
                              {lang === "gu" ? meta.subtitleGujarati : meta.subtitle}
                            </span>
                          </div>
                        </div>
                        <div className="text-slate-300/40 relative z-0">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary: Total Platform Users */}
                  <div
                    onClick={() => navigateSection("users")}
                    className="p-5 bg-[#F5F3FF] border border-[#DDD6FE]/60 rounded-2xl relative overflow-hidden hover:border-[#C4B5FD] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider block">
                          {lang === "gu" ? "કુલ વપરાશકર્તાઓ" : "TOTAL USERS"}
                        </span>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.users.total}</p>
                        <span className="text-xs text-emerald-600 font-semibold block mt-0.5">
                          {stats.users.active} {lang === "gu" ? "સક્રિય" : "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-300/40 relative z-0">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: TENANTS MANAGEMENT ================= */}
          {activeSection === "tenants" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {lang === "gu" ? "સંસ્થાઓ અને સબ્સ્ક્રિપ્શન મેનેજમેન્ટ" : "Tenants & Organizations"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "gu"
                      ? "ગ્રાહકોની સંસ્થાઓ જુઓ, શોધો, પ્લાન અપગ્રેડ કરો અથવા સીધા એડમિન પોર્ટલમાં પ્રવેશ કરો."
                      : "View, search, upgrade plans, extend validity, or jump directly into any customer's tenant."}
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateTenantOpen(true)}
                  className="py-2.5 px-4 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{lang === "gu" ? "નવી સંસ્થા બનાવો" : "Create New Tenant"}</span>
                </button>
              </div>

              <DataTable<TenantItem>
                data={tenants}
                columns={tenantColumns}
                keyExtractor={(t) => t.id}
                selectable={true}
                selectedIds={selectedTenantIds}
                onSelectionChange={setSelectedTenantIds}
                renderBulkActions={(selectedIds, clearSelection) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkStatusUpdate(true)}
                      disabled={isBulkUpdating}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Activate all selected tenants"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                      <span>{lang === "gu" ? "સક્રિય કરો" : "Activate"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkStatusUpdate(false)}
                      disabled={isBulkUpdating}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Suspend all selected tenants"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                      <span>{lang === "gu" ? "સ્થગિત કરો" : "Suspend"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenBulkDelete}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      title="Permanently delete all selected tenants"
                    >
                      <span>🗑️</span>
                      <span>
                        {lang === "gu"
                          ? `કાઢી નાખો (${selectedIds.size})`
                          : `Delete (${selectedIds.size})`}
                      </span>
                    </button>
                  </div>
                )}
                searchPlaceholder={
                  lang === "gu"
                    ? "ફોન, ઈમેલ, સંસ્થા અથવા આઈડી શોધો..."
                    : "Search phone, email, org name, tenant ID..."
                }
                searchKeys={["id", "primaryPhone", "primaryEmail", "subscriptionTier"]}
                customSearchFn={(t, query) => {
                  const s = query.toLowerCase();
                  return Boolean(
                    t.id.toLowerCase().includes(s) ||
                    t.primaryPhone.toLowerCase().includes(s) ||
                    (t.primaryEmail && t.primaryEmail.toLowerCase().includes(s)) ||
                    t.subscriptionTier.toLowerCase().includes(s) ||
                    (t.organizations &&
                      t.organizations.some(
                        (org) =>
                          org.name.toLowerCase().includes(s) ||
                          (org.legalName && org.legalName.toLowerCase().includes(s)) ||
                          (org.companies &&
                            org.companies.some(
                              (c) =>
                                c.legalName.toLowerCase().includes(s) ||
                                c.tradeName.toLowerCase().includes(s) ||
                                (c.gstin && c.gstin.toLowerCase().includes(s)) ||
                                (c.city && c.city.toLowerCase().includes(s))
                            ))
                      ))
                  );
                }}
                lang={lang}
                themeColor="purple"
                exportable
                exportFileName="tenants_organizations"
                filtersSlot={
                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="bg-white border border-[#E2E8F0] text-xs font-semibold rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
                    >
                      <option value="">{lang === "gu" ? "તમામ સબ્સ્ક્રિપ્શન પ્લાન" : "All Subscription Tiers"}</option>
                      {Object.keys(stats?.subscriptionTiers || TIER_META).map((tierKey) => (
                        <option key={tierKey} value={tierKey}>
                          {tierKey}
                        </option>
                      ))}
                    </select>

                    <select
                      value={tenantStatusFilter}
                      onChange={(e) => setTenantStatusFilter(e.target.value)}
                      className="bg-white border border-[#E2E8F0] text-xs font-semibold rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
                    >
                      <option value="">{lang === "gu" ? "તમામ સ્થિતિ (Status)" : "All Status"}</option>
                      <option value="active">{lang === "gu" ? "સક્રિય (Active)" : "Active"}</option>
                      <option value="suspended">{lang === "gu" ? "સ્થગિત (Suspended)" : "Suspended"}</option>
                      <option value="expired">{lang === "gu" ? "સમાપ્ત (Expired)" : "Expired"}</option>
                    </select>
                  </div>
                }
              />
            </div>
          )}

          {/* ================= SECTION 3: SUBSCRIPTION PLANS ================= */}
          {activeSection === "plans" && (
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
                {Object.entries(stats?.subscriptionTiers || {
                  TRIAL: 0,
                  RETAIL_BASIC: 0,
                  WHOLESALE_PRO: 0,
                  DISTRIBUTION_ENTERPRISE: 0,
                  MANUFACTURING_SUITE: 0,
                }).map(([tierKey, count]) => {
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
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-purple-600 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setTierFilter(tierKey);
                            navigateSection("tenants");
                          }}
                          className="w-full py-2 bg-slate-50 hover:bg-purple-50 text-purple-700 hover:text-purple-800 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{lang === "gu" ? "આ પ્લાનના ટેનન્ટ્સ જુઓ" : "Filter Tenants in Tier"}</span>
                          <span>({count}) →</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION 4: INVOICES EXPLORER ================= */}
          {activeSection === "invoices" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h1 className="text-xl font-bold text-[#202124] tracking-tight">
                  {lang === "gu" ? "બિઝનેસ ઇન્વોઇસ એક્સપ્લોરર" : "Cross-Tenant Invoices Explorer"}
                </h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  {lang === "gu"
                    ? "તમામ રજિસ્ટર્ડ કંપનીઓ તરફથી તાજેતરના GST વેચાણ બિલનું કેન્દ્રિય રીડ-ઓન્લી નિરીક્ષણ."
                    : "Centralized read-only visibility into recent GST sales transactions across all registered businesses."}
                </p>
              </div>

              <DataTable<InvoiceItem>
                data={invoices}
                columns={invoiceColumns}
                keyExtractor={(inv) => inv.id}
                searchPlaceholder={
                  lang === "gu"
                    ? "બિલ નંબર, કંપની, ગ્રાહક શોધો..."
                    : "Search invoice #, customer, company..."
                }
                searchKeys={["invoiceNumber", "status"]}
                customSearchFn={(inv, query) => {
                  const s = query.toLowerCase();
                  return Boolean(
                    inv.invoiceNumber.toLowerCase().includes(s) ||
                    (inv.party?.name && inv.party.name.toLowerCase().includes(s)) ||
                    (inv.partyName && inv.partyName.toLowerCase().includes(s)) ||
                    (inv.company?.tradeName && inv.company.tradeName.toLowerCase().includes(s)) ||
                    (inv.company?.legalName && inv.company.legalName.toLowerCase().includes(s)) ||
                    inv.status.toLowerCase().includes(s)
                  );
                }}
                lang={lang}
                themeColor="purple"
                exportable
                exportFileName="global_invoices"
              />
            </div>
          )}

          {/* ================= SECTION 5: PLATFORM USERS ================= */}
          {activeSection === "users" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h1 className="text-xl font-bold text-[#202124] tracking-tight">
                  {lang === "gu" ? "વપરાશકર્તાઓ અને પરવાનગીઓ" : "Platform Users & Security Roles"}
                </h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  {lang === "gu"
                    ? "એડમિનિસ્ટ્રેટર્સ, એકાઉન્ટન્ટ્સ, બ્રાન્ચ મેનેજર્સ અને ક્રેડેન્શિયલ મેનેજમેન્ટ."
                    : "Manage administrators, accountants, branch managers, and reset credentials."}
                </p>
              </div>

              <DataTable<UserItem>
                data={usersList}
                columns={userColumns}
                keyExtractor={(u) => u.id}
                searchPlaceholder={
                  lang === "gu"
                    ? "નામ, ફોન અથવા ઈમેલ શોધો..."
                    : "Search user name, phone, email..."
                }
                searchKeys={["fullName", "phone", "email", "role"]}
                customSearchFn={(u, query) => {
                  const s = query.toLowerCase();
                  return Boolean(
                    u.fullName.toLowerCase().includes(s) ||
                    u.phone.toLowerCase().includes(s) ||
                    (u.email && u.email.toLowerCase().includes(s)) ||
                    u.role.toLowerCase().includes(s) ||
                    (u.organization?.name && u.organization.name.toLowerCase().includes(s))
                  );
                }}
                lang={lang}
                themeColor="purple"
                exportable
                exportFileName="platform_users"
                filtersSlot={
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="bg-[#F8F9FB] border border-[#E5E7EB] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#202124] focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="">{lang === "gu" ? "તમામ ભૂમિકાઓ (All Roles)" : "All User Roles"}</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                }
              />
            </div>
          )}

          {/* ================= SECTION 6: GLOBAL AUDIT TRAIL ================= */}
          {activeSection === "audit" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h1 className="text-xl font-bold text-[#202124] tracking-tight">
                  {lang === "gu" ? "વૈશ્વિક ઓડિટ ટ્રેઇલ" : "Global Audit Trail & Security"}
                </h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  {lang === "gu"
                    ? "તમામ વ્યવહારો પર ક્રિપ્ટોગ્રાફિક SHA-256 ટેમ્પર-એવિડન્ટ લોગ સ્ટ્રીમ."
                    : "Cryptographically secured SHA-256 tamper-evident log stream across all business entities."}
                </p>
              </div>

              <DataTable<AuditLogItem>
                data={auditLogs}
                columns={auditColumns}
                keyExtractor={(log) => log.id}
                searchPlaceholder={
                  lang === "gu"
                    ? "ક્રિયા, એન્ટિટી, વપરાશકર્તા શોધો..."
                    : "Search action, entity, user..."
                }
                searchKeys={["action", "entityName", "recordHash"]}
                customSearchFn={(log, query) => {
                  const s = query.toLowerCase();
                  return Boolean(
                    log.action.toLowerCase().includes(s) ||
                    log.entityName.toLowerCase().includes(s) ||
                    (log.user?.fullName && log.user.fullName.toLowerCase().includes(s)) ||
                    (log.company?.tradeName && log.company.tradeName.toLowerCase().includes(s)) ||
                    (log.company?.legalName && log.company.legalName.toLowerCase().includes(s)) ||
                    log.recordHash.toLowerCase().includes(s)
                  );
                }}
                lang={lang}
                themeColor="purple"
                exportable
                exportFileName="global_audit_trail"
                filtersSlot={
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="bg-[#F8F9FB] border border-[#E5E7EB] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#202124] focus:outline-none focus:bg-white cursor-pointer"
                    >
                      <option value="">{lang === "gu" ? "તમામ ક્રિયાઓ (All Actions)" : "All Actions"}</option>
                      <option value="AUTH_LOGIN">AUTH_LOGIN</option>
                      <option value="AUTH_REGISTER">AUTH_REGISTER</option>
                      <option value="SUPERADMIN_TENANT_UPDATE">SUPERADMIN_TENANT_UPDATE</option>
                      <option value="SUPERADMIN_CREATE_TENANT">SUPERADMIN_CREATE_TENANT</option>
                      <option value="SUPERADMIN_SUPPORT_SESSION_ENTER">SUPERADMIN_SUPPORT_SESSION_ENTER</option>
                      <option value="SUPERADMIN_SUPPORT_SESSION_EXIT">SUPERADMIN_SUPPORT_SESSION_EXIT</option>
                      <option value="INVOICE_CREATE">INVOICE_CREATE</option>
                      <option value="VOUCHER_CREATE">VOUCHER_CREATE</option>
                    </select>
                  </div>
                }
              />
            </div>
          )}

          {/* ================= SECTION 7: SYSTEM DIAGNOSTICS & TELEMETRY ================= */}
          {activeSection === "health" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {lang === "gu" ? "સિસ્ટમ આરોગ્ય અને ટેલિમેટ્રી" : "System Diagnostics & Telemetry"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "gu"
                      ? "રીયલ-ટાઇમ PostgreSQL કનેક્શન, RLS એન્ફોર્સમેન્ટ, સર્વર મેમરી અને ક્રિપ્ટોગ્રાફિક ઓડિટ સ્થિતિ."
                      : "Real-time PostgreSQL connection, RLS enforcement, server memory, and cryptographic audit telemetry."}
                  </p>
                </div>
                <button
                  onClick={fetchDiagnostics}
                  className="py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{lang === "gu" ? "તાજી સ્થિતિ ચકાસો" : "Run Live Health Ping"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "gu" ? "ડેટાબેઝ એન્જિન" : "DATABASE ENGINE"}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {diagnostics?.database?.engine || "PostgreSQL 16"}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {diagnostics?.database?.status || "HEALTHY"} ({diagnostics?.database?.latencyMs ?? 1}ms ping)
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "gu" ? "RLS આઇસોલેશન" : "RLS SECURITY"}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {diagnostics?.database?.rlsEnforced ? "Row-Level Security" : "Standard Security"}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Zero-Trust Strict Isolation</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "gu" ? "મેમરી વપરાશ" : "SERVER RUNTIME & MEMORY"}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    Node.js {diagnostics?.system?.nodeVersion || process.version}
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-500">
                    Heap: {diagnostics?.system?.memoryHeapUsedMb || 0} MB • RSS: {diagnostics?.system?.memoryRssMb || 0} MB
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {lang === "gu" ? "સર્વર અપટાઇમ" : "UPTIME & ENVIRONMENT"}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {Math.floor((diagnostics?.system?.uptimeSeconds || stats?.systemHealth?.uptimeSeconds || 0) / 3600)}h{" "}
                    {Math.floor(((diagnostics?.system?.uptimeSeconds || stats?.systemHealth?.uptimeSeconds || 0) % 3600) / 60)}m
                  </div>
                  <div className="mt-2 text-xs font-mono uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded w-fit border border-purple-200">
                    {diagnostics?.system?.environment || "Development"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== MODAL 1: CREATE NEW TENANT WIZARD ===================== */}
      <TenantCreateWizardModal
        isOpen={isCreateTenantOpen}
        onClose={() => setIsCreateTenantOpen(false)}
        onSubmit={handleWizardCreateTenant}
        isLoading={isCreatingTenant}
        lang={lang}
        statesList={INDIAN_STATES}
      />

      {/* ===================== MODAL: DELETE TENANT (SINGLE & BULK) ===================== */}
      {/* ===================== MODAL: EDIT TENANT & ORGANIZATION ===================== */}
      <TenantEditModal
        isOpen={Boolean(editingTenant)}
        onClose={handleCloseEditTenant}
        tenant={editingTenant}
        onSave={handleSaveEditTenant}
        isLoading={isEditingTenantSaving}
        lang={lang}
      />

      <TenantDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTenantsToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        tenants={tenantsToDelete}
        isDeleting={isDeletingTenants}
        lang={lang}
      />

      {/* ===================== MODAL 2: MANAGE LICENSE ===================== */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedTenant(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-[#D1D5DB] rounded-2xl w-full max-w-md p-6 space-y-5 text-[#202124] shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                <span>{lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન અને લાયસન્સ" : "Manage Tenant Subscription"}</span>
              </h3>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-[#98A2B3] hover:text-[#202124] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[#667085] block mb-1">Target Tenant:</span>
                <span className="font-bold text-[#202124] font-mono text-sm">
                  {selectedTenant.primaryPhone} ({selectedTenant.organizations[0]?.name || "Tenant"})
                </span>
              </div>

              <div>
                <label className="text-[#202124] font-bold block mb-1">
                  Select Subscription Tier:
                </label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F9FB] border border-[#E5E7EB] rounded-xl text-[#202124] font-bold focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="TRIAL">Trial (30-day Free)</option>
                  <option value="RETAIL_BASIC">Retail Basic</option>
                  <option value="WHOLESALE_PRO">Wholesale Pro</option>
                  <option value="DISTRIBUTION_ENTERPRISE">Distribution Enterprise</option>
                  <option value="MANUFACTURING_SUITE">Manufacturing Suite (All Features)</option>
                </select>
              </div>

              <div>
                <label className="text-[#202124] font-bold block mb-1">
                  Extend Validity From Current Expiry:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExtendDays(30)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer ${
                      extendDays === 30
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-[#F8F9FB] text-[#202124] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtendDays(90)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer ${
                      extendDays === 90
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-[#F8F9FB] text-[#202124] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    +90 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtendDays(365)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs cursor-pointer ${
                      extendDays === 365
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-[#F8F9FB] text-[#202124] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    +1 Year
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-[#667085] hover:text-[#202124] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingTenant}
                onClick={handleUpdateTenantTier}
                className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingTenant ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: VIEW TENANT DEEP DETAILS ===================== */}
      {viewDetailsTenant && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setViewDetailsTenant(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-[#D1D5DB] rounded-2xl w-full max-w-2xl p-6 space-y-5 text-[#202124] shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#202124]">
                  {viewDetailsTenant.organizations?.[0]?.name || "Tenant Details"}
                </h3>
                <span className="text-[11px] text-[#667085] font-mono">
                  Tenant ID: {viewDetailsTenant.id}
                </span>
              </div>
              <button
                onClick={() => setViewDetailsTenant(null)}
                className="text-[#98A2B3] hover:text-[#202124] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F8F9FB] rounded-xl border border-[#E5E7EB]">
                <div>
                  <span className="text-[#667085] block">Primary Phone:</span>
                  <span className="font-bold text-[#202124] font-mono">{viewDetailsTenant.primaryPhone}</span>
                </div>
                <div>
                  <span className="text-[#667085] block">Email:</span>
                  <span className="font-bold text-[#202124] font-mono truncate block">
                    {viewDetailsTenant.primaryEmail || <span className="text-slate-400 font-sans font-normal">—</span>}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block">Plan Tier:</span>
                  <span className="font-bold text-purple-700 uppercase font-mono">
                    {viewDetailsTenant.subscriptionTier}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] block">Status:</span>
                  <span className="font-bold text-emerald-700">
                    {viewDetailsTenant.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "સ્થગિત" : "Suspended")}
                  </span>
                </div>
              </div>

              {/* Companies and Branches */}
              <div>
                <h4 className="font-bold text-xs text-[#202124] uppercase mb-2 tracking-wider">
                  Companies, Branches & Warehouses
                </h4>
                <div className="space-y-2">
                  {viewDetailsTenant.organizations?.map((org: any) =>
                    org.companies?.map((comp: any) => (
                      <div
                        key={comp.id}
                        className="p-3 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <div className="font-bold text-sm text-[#202124]">{comp.tradeName}</div>
                          <div className="text-[11px] text-[#667085]">
                            Legal: {comp.legalName} • City: {comp.city || "—"} • GSTIN: {comp.gstin || "Unregistered"}
                          </div>
                          <div className="text-[10px] text-[#98A2B3] mt-1 font-mono">
                            {comp.branches?.length || 0} Branch(es) • {comp.warehouses?.length || 0} Godown(s) • {comp._count?.salesInvoices || 0} Sales Invoices
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setViewDetailsTenant(null);
                            handleImpersonateTenant(comp.id, comp.tradeName);
                          }}
                          className="px-3 py-1.5 bg-[#FFF3E8] hover:bg-[#FFE5D0] text-[#F47721] border border-orange-200 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          Enter Support Session →
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Users under this organization */}
              <div>
                <h4 className="font-bold text-xs text-[#202124] uppercase mb-2 tracking-wider">
                  Associated Users ({viewDetailsTenant.organizations?.[0]?.users?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewDetailsTenant.organizations?.[0]?.users?.map((u: any) => (
                    <div key={u.id} className="p-2.5 bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg">
                      <div className="font-bold text-[#202124]">{u.fullName}</div>
                      <div className="text-[11px] font-mono text-[#667085]">{u.phone} • {u.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setViewDetailsTenant(null)}
                className="py-2 px-5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 4: RESET USER PASSWORD ===================== */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setResetPasswordUser(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-[#D1D5DB] rounded-2xl w-full max-w-sm p-6 space-y-4 text-[#202124] shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#202124]">Reset User Password</h3>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="text-[#98A2B3] hover:text-[#202124] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-[#667085] block">User:</span>
                <span className="font-bold text-[#202124]">{resetPasswordUser.fullName}</span>
                <span className="block text-[11px] text-[#98A2B3] font-mono">{resetPasswordUser.phone}</span>
              </div>

              <div>
                <label className="text-[#202124] font-bold block mb-1">
                  New Password (min 8 characters):
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full px-3 py-2 bg-[#F8F9FB] border border-[#E5E7EB] rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-[#667085] hover:text-[#202124] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResettingPassword || newPasswordVal.length < 8}
                onClick={handleResetPassword}
                className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isResettingPassword ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MOBILE SIDEBAR DRAWER ===================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-72 max-w-full flex-1 flex flex-col justify-between shadow-2xl p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#202124]">SuperAdmin Console</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#667085] p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      activeSection === item.id
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-[#667085] hover:bg-[#F8F9FB]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{lang === "gu" ? item.nameGujarati : item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={logout}
                className="w-full py-2 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
