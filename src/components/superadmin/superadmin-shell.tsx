"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSuperAdmin } from "../../context/superadmin-context";
import { TenantCreateWizardModal } from "../tenants/tenant-create-wizard-modal";

interface NavItemDef {
  id: string;
  name: string;
  nameGujarati: string;
  href: string;
  badge?: string;
  isActive: (pathname: string) => boolean;
  icon: React.ReactNode;
}

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    authStatus,
    authErrorMessage,
    verifyServerAuthorization,
    user,
    adminInitials,
    logout,
    lang,
    setLang,
    stats,
    diagnostics,
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
    INDIAN_STATES,
  } = useSuperAdmin();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Define All Independent Route Navigation Items
  const navItems: NavItemDef[] = useMemo(
    () => [
      {
        id: "overview",
        name: "Dashboard & Overview",
        nameGujarati: "મુખ્ય ડેશબોર્ડ",
        href: "/superadmin",
        isActive: (p) => p === "/superadmin",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        id: "tenants",
        name: "Tenants & Organizations",
        nameGujarati: "સંસ્થાઓ અને ગ્રાહકો",
        href: "/superadmin/tenants",
        badge: stats ? String(stats.tenants?.total ?? 0) : undefined,
        isActive: (p) => p.startsWith("/superadmin/tenants"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        id: "plans",
        name: "Subscription Plans",
        nameGujarati: "પ્લાન્સ અને લાયસન્સ",
        href: "/superadmin/plans",
        isActive: (p) => p.startsWith("/superadmin/plans"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        ),
      },
      {
        id: "invoices",
        name: "Invoices Explorer",
        nameGujarati: "બિઝનેસ બિલિંગ એક્સપ્લોરર",
        href: "/superadmin/invoices",
        badge: stats ? String(stats.businessVolume?.totalInvoices ?? 0) : undefined,
        isActive: (p) => p.startsWith("/superadmin/invoices"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        id: "users",
        name: "Platform Users",
        nameGujarati: "વપરાશકર્તાઓ",
        href: "/superadmin/users",
        badge: stats ? String(stats.users?.total ?? 0) : undefined,
        isActive: (p) => p.startsWith("/superadmin/users"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        id: "audit",
        name: "Global Audit Trail",
        nameGujarati: "વૈશ્વિક ઓડિટ ટ્રેઇલ",
        href: "/superadmin/audit-logs",
        isActive: (p) => p.startsWith("/superadmin/audit"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        id: "diagnostics",
        name: "System Diagnostics",
        nameGujarati: "સિસ્ટમ ડાયગ્નોસ્ટિક્સ",
        href: "/superadmin/diagnostics",
        badge: diagnostics?.database?.status === "HEALTHY" ? "OK" : undefined,
        isActive: (p) => p.startsWith("/superadmin/diagnostics") || p.startsWith("/superadmin/health"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        ),
      },
      {
        id: "themes",
        name: "Invoice Themes Store",
        nameGujarati: "થીમ સ્ટોર મેનેજમેન્ટ",
        href: "/superadmin/themes",
        badge: "LIVE",
        isActive: (p) => p.startsWith("/superadmin/themes"),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        ),
      },
    ],
    [stats, diagnostics]
  );

  // Dynamic Current Route for Breadcrumbs
  const currentNavItem = useMemo(() => {
    return navItems.find((item) => item.isActive(pathname)) || navItems[0];
  }, [navItems, pathname]);

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
  if (authStatus === "checking") {
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex">
      {/* ===================== 1. DEDICATED LEFT SIDEBAR ===================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col justify-between bg-white border-r border-[#E2E8F0] transition-all duration-200 h-screen shadow-xs ${
          isSidebarCollapsed ? "w-20" : "w-[280px]"
        } hidden lg:flex`}
      >
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
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

          {/* Navigation Menu with Dedicated Routes */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" aria-label="SuperAdmin Sidebar Navigation">
            {navItems.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={isSidebarCollapsed ? (lang === "gu" ? item.nameGujarati : item.name) : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    active
                      ? "bg-[#F5F0FF] text-[#7C3AED] border border-[#EDE4FF] shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <span className={`shrink-0 ${active ? "text-[#7e3dee]" : "text-slate-500"}`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{lang === "gu" ? item.nameGujarati : item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-medium ${
                            active ? "bg-purple-100 text-[#7C3AED]" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
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
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F6F8FC] to-[#F5F2FC] relative transition-all duration-200 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-[280px]"
        }`}
      >
        <div className="absolute top-0 right-0 w-[550px] h-[350px] bg-gradient-to-bl from-purple-100/40 via-indigo-50/20 to-transparent pointer-events-none rounded-full blur-3xl" />

        {/* TOPBAR NAVIGATION WITH DYNAMIC BREADCRUMBS */}
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

            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
              <Link href="/superadmin" className="text-[#7C3AED] hover:text-[#6D28D9] transition-colors" title="SuperAdmin Home">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/superadmin" className="text-slate-500 font-medium hover:text-slate-800 transition-colors">
                SuperAdmin
              </Link>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-extrabold text-slate-900">
                {lang === "gu" ? currentNavItem.nameGujarati : currentNavItem.name}
              </span>
            </nav>
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
          {children}
        </main>
      </div>

      {/* ===================== GLOBAL MODAL: CREATE NEW TENANT WIZARD ===================== */}
      <TenantCreateWizardModal
        isOpen={isCreateTenantOpen}
        onClose={() => setIsCreateTenantOpen(false)}
        onSubmit={handleWizardCreateTenant}
        isLoading={isCreatingTenant}
        lang={lang}
        statesList={INDIAN_STATES}
      />

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

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = item.isActive(pathname);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        active
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "text-[#667085] hover:bg-[#F8F9FB]"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{lang === "gu" ? item.nameGujarati : item.name}</span>
                    </Link>
                  );
                })}
              </nav>
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

