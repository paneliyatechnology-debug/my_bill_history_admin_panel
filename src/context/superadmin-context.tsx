"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";
import { apiClient } from "../lib/api-client";
import type {
  SystemStats,
  DiagnosticsData,
  SubscriptionPlanItem,
} from "../shared-types/superadmin";
import {
  INDIAN_STATES,
  TIER_META,
  getTierInfo as defaultGetTierInfo,
  formatInr,
} from "../lib/superadmin-constants";
import { fetchAllPlans } from "../lib/plans-api";
import type { CreateTenantPayload } from "../components/tenants/tenant-create-wizard-modal";

export type AuthStatus =
  | "checking"
  | "authorized"
  | "forbidden"
  | "unauthenticated"
  | "network_error";

interface SuperAdminContextType {
  // Authorization & Identity
  authStatus: AuthStatus;
  authErrorMessage: string | null;
  verifyServerAuthorization: () => Promise<void>;
  user: any;
  isAuthenticated: boolean;
  adminInitials: string;
  logout: () => void;

  // Language
  lang: "en" | "gu";
  setLang: (lang: "en" | "gu") => void;

  // Global Telemetry & Observability
  stats: SystemStats | null;
  refetchStats: () => Promise<void>;
  diagnostics: DiagnosticsData | null;
  refetchDiagnostics: () => Promise<void>;

  // Subscription Plans Dynamic Management
  plans: SubscriptionPlanItem[];
  isLoadingPlans: boolean;
  refetchPlans: () => Promise<void>;

  // Notification Banners
  actionSuccess: string | null;
  actionError: string | null;
  setActionSuccess: (msg: string | null) => void;
  setActionError: (msg: string | null) => void;

  // Layout Chrome States
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Tenant Creation Wizard Modal (Global)
  isCreateTenantOpen: boolean;
  setIsCreateTenantOpen: (open: boolean) => void;
  isCreatingTenant: boolean;
  handleWizardCreateTenant: (payload: CreateTenantPayload) => Promise<void>;

  // Impersonate / Support Session
  handleImpersonateTenant: (companyId: string, companyName: string) => Promise<void>;

  // Cross-Page Data Sync Signals
  tenantRefreshTrigger: number;
  triggerTenantRefresh: () => void;

  // Helpers & Metadata
  formatInr: (val: number) => string;
  getTierInfo: (tierKey: string) => any;
  INDIAN_STATES: typeof INDIAN_STATES;
  TIER_META: typeof TIER_META;
}

const SuperAdminContext = createContext<SuperAdminContextType | null>(null);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading, logout, lang, setLang } = useAuth();

  // Authoritative Server-side Verification Status
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Layout Chrome
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Observability States
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);

  // Global Banners
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Tenant Creation Wizard Modal
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);

  // Dynamic Subscription Plans State
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const refetchPlans = useCallback(async () => {
    try {
      setIsLoadingPlans(true);
      const data = await fetchAllPlans();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
      }
    } catch (err) {
      console.warn("Failed to load dynamic plans:", err);
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    refetchPlans();
  }, [refetchPlans]);

  // Dynamic Tier Info resolution (combines custom plans + default tiers)
  const getTierInfo = useCallback(
    (tierKey: string) => {
      if (!tierKey) return defaultGetTierInfo("TRIAL");
      const matchedPlan = plans.find(
        (p) =>
          p.tier.toUpperCase() === tierKey.toUpperCase() ||
          p.id.toLowerCase() === tierKey.toLowerCase()
      );

      if (matchedPlan) {
        return {
          name: matchedPlan.name,
          nameGujarati: matchedPlan.nameGujarati,
          subtitle: matchedPlan.subtitle,
          subtitleGujarati: matchedPlan.subtitleGujarati,
          style: matchedPlan.isPopular
            ? "bg-white border-2 border-emerald-500/80 shadow-md ring-2 ring-emerald-500/10"
            : "bg-white border-slate-200/80 hover:border-blue-400",
          badgeStyle: matchedPlan.badgeColor || "bg-blue-50 text-blue-700 border-blue-200",
          icon: () => (
            <svg className="w-6 h-6 text-[#1677E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          features: matchedPlan.features,
          featuresGujarati: matchedPlan.featuresGujarati,
          planData: matchedPlan,
        };
      }

      return defaultGetTierInfo(tierKey);
    },
    [plans]
  );

  // Cross-page event signal
  const [tenantRefreshTrigger, setTenantRefreshTrigger] = useState(0);
  const triggerTenantRefresh = useCallback(() => {
    setTenantRefreshTrigger((prev) => prev + 1);
  }, []);

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
        } catch { }
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/superadmin";
        window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
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

      // 3. System diagnostics status
      try {
        const diagData: any = await apiClient.get("/super-admin/diagnostics");
        setDiagnostics(diagData);
      } catch {
        // non-blocking
      }

      setAuthStatus("authorized");
    } catch (err: any) {
      if (err?.statusCode === 401) {
        setAuthStatus("unauthenticated");
        try {
          localStorage.removeItem("billing_auth_token");
          localStorage.removeItem("billing_user_profile");
          localStorage.removeItem("billing_tenant_context");
        } catch { }
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/superadmin";
        window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}&reason=session_expired`);
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

  // Refetch telemetry helpers
  const refetchStats = useCallback(async () => {
    try {
      const statsData: any = await apiClient.get("/super-admin/stats");
      setStats(statsData);
    } catch (err) {
      console.error("Failed to refetch stats", err);
    }
  }, []);

  const refetchDiagnostics = useCallback(async () => {
    try {
      const data: any = await apiClient.get("/super-admin/diagnostics");
      setDiagnostics(data);
    } catch (err) {
      console.error("Failed to refetch diagnostics", err);
    }
  }, []);

  // Auto clear success banners after 5 seconds
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // Handle Wizard Create Tenant
  const handleWizardCreateTenant = useCallback(async (payload: CreateTenantPayload): Promise<void> => {
    setIsCreatingTenant(true);
    setActionError(null);
    try {
      await apiClient.post("/super-admin/tenants", payload);
      setActionSuccess(
        lang === "gu"
          ? `નવો ટેનન્ટ ${payload.organizationName} સફળતાપૂર્વક બની ગયો છે.`
          : `Tenant ${payload.organizationName} created successfully.`
      );
      setIsCreateTenantOpen(false);
      triggerTenantRefresh();
      refetchStats();
    } catch (err: any) {
      setActionError(err.message || "Failed to create tenant");
    } finally {
      setIsCreatingTenant(false);
    }
  }, [lang, triggerTenantRefresh, refetchStats]);

  // Impersonate / Support Session
  const handleImpersonateTenant = useCallback(async (companyId: string, companyName: string) => {
    try {
      const res: any = await apiClient.post(`/super-admin/tenants/${companyId}/impersonate`);
      if (res && res.token) {
        const originalToken = localStorage.getItem("billing_auth_token");
        localStorage.setItem("billing_auth_token", res.token);
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

  const value = useMemo(
    () => ({
      authStatus,
      authErrorMessage,
      verifyServerAuthorization,
      user,
      isAuthenticated,
      adminInitials,
      logout,
      lang,
      setLang,
      stats,
      refetchStats,
      diagnostics,
      refetchDiagnostics,
      plans,
      isLoadingPlans,
      refetchPlans,
      actionSuccess,
      actionError,
      setActionSuccess,
      setActionError,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      isCreateTenantOpen,
      setIsCreateTenantOpen,
      isCreatingTenant,
      handleWizardCreateTenant,
      handleImpersonateTenant,
      tenantRefreshTrigger,
      triggerTenantRefresh,
      formatInr,
      getTierInfo,
      INDIAN_STATES,
      TIER_META,
    }),
    [
      authStatus,
      authErrorMessage,
      verifyServerAuthorization,
      user,
      isAuthenticated,
      adminInitials,
      logout,
      lang,
      setLang,
      stats,
      refetchStats,
      diagnostics,
      refetchDiagnostics,
      plans,
      isLoadingPlans,
      refetchPlans,
      actionSuccess,
      actionError,
      isSidebarCollapsed,
      isMobileMenuOpen,
      isCreateTenantOpen,
      isCreatingTenant,
      handleWizardCreateTenant,
      handleImpersonateTenant,
      tenantRefreshTrigger,
      triggerTenantRefresh,
      getTierInfo,
    ]
  );

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return ctx;
}
