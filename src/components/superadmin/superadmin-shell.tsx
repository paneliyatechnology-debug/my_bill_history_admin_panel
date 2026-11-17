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

  // Define All Independent Route Navigation Items (System Diagnostics removed as requested)
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
    [stats]
  );

  // Dynamic Current Route for Breadcrumbs
  const currentNavItem = useMemo(() => {
    return (
      navItems.find((item) => item.isActive(pathname)) || {
        id: "page",
        name: pathname.includes("diagnostics") || pathname.includes("health") ? "System Diagnostics" : "Console",
        nameGujarati: pathname.includes("diagnostics") || pathname.includes("health") ? "સિસ્ટમ ડાયગ્નોસ્ટિક્સ" : "કન્સોલ",
        href: pathname,
        isActive: () => true,
        icon: null,
      }
    );
  }, [navItems, pathname]);

  // 1. SAFE FORBIDDEN SCREEN
  if (authStatus === "forbidden") {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-4xl mb-5 shadow-2xl backdrop-blur-xl">
          🔒
        </div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-400 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 mb-3">
          Error 403 • Unauthorized Privilege
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          SuperAdmin Access Denied
        </h1>
        <p className="text-sm text-slate-400 mt-2.5 max-w-md leading-relaxed">
          Platform SuperAdmin credentials are required to view this console. Your account does not have authorization to view multi-tenant infrastructure.
        </p>
        <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 max-w-md">
          🛡️ Cryptographic Notice: All unauthorized privileged access attempts are recorded in the immutable audit stream.
        </div>
        <Link
          href="/"
          className="mt-8 py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
        >
          ← Return to Business Dashboard
        </Link>
      </div>
    );
  }

  // 2. NETWORK ERROR OR SERVER TIMEOUT SCREEN
  if (authStatus === "network_error") {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-4xl mb-5 shadow-2xl backdrop-blur-xl">
          📡
        </div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 mb-3">
          Backend Service Offline
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Backend Connection Failed
        </h1>
        <p className="text-sm text-slate-400 mt-2.5 max-w-md leading-relaxed">
          {authErrorMessage || "Unable to reach the server to verify administrative privileges. Please ensure the backend service is running on port 4000."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={() => verifyServerAuthorization()}
            className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
          >
            Retry Connection
          </button>
          <Link
            href="/"
            className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            Business Dashboard
          </Link>
          <Link
            href="/login"
            className="py-3 px-6 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-800"
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
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-purple-500/30 animate-pulse">
            🛡️
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0F172A] animate-ping" />
        </div>
        <p className="text-lg font-black text-white mt-6 tracking-tight">
          MyBill SuperAdmin Operations
        </p>
        <p className="text-xs text-slate-400 mt-1.5 font-mono">
          Verifying zero-trust server authorization...
        </p>
      </div>
    );
  }

  // 4. UNAUTHENTICATED REDIRECT FALLBACK
  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-orange-500/20 animate-pulse">
          ₹
        </div>
        <p className="text-lg font-black text-white mt-6">
          Redirecting to Secure Login...
        </p>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Platform administrator authentication required.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex antialiased selection:bg-purple-500 selection:text-white">
      {/* ===================== 1. DEDICATED MODERN LEFT SIDEBAR ===================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col justify-between bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out h-screen shadow-sm ${
          isSidebarCollapsed ? "w-20" : "w-[275px]"
        } hidden lg:flex`}
      >
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-[74px] flex items-center justify-between px-5 border-b border-slate-100">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="currentColor" fillOpacity="0.9" />
                    <path d="M3 10.5L12 15L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 14.5L12 19L21 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                  </svg>
                </div>

                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[15px] tracking-tight text-slate-900 truncate">
                      SuperAdmin
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-md border border-purple-200">
                      MASTER
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate font-medium">
                    Platform Multi-Tenant Console
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="currentColor" />
                  <path d="M3 10.5L12 15L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 14.5L12 19L21 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </svg>
              </div>
            )}

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Primary Action: + Create New Tenant Button */}
          <div className="p-3.5 border-b border-slate-100">
            {!isSidebarCollapsed ? (
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span>{lang === "gu" ? "નવી સંસ્થા બનાવો" : "Create New Tenant"}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center justify-center mx-auto cursor-pointer"
                title="Create New Tenant"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Menu with Dedicated Routes */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1" aria-label="SuperAdmin Sidebar Navigation">
            {navItems.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={isSidebarCollapsed ? (lang === "gu" ? item.nameGujarati : item.name) : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group relative ${
                    active
                      ? "bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50/20 text-purple-700 border border-purple-200/80 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  {/* Left Active Indicator Bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-r-full" />
                  )}

                  <span className={`shrink-0 transition-colors ${active ? "text-purple-600" : "text-slate-400 group-hover:text-slate-700"}`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{lang === "gu" ? item.nameGujarati : item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            active
                              ? "bg-purple-100 text-purple-700 border border-purple-200/60"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70"
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
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {adminInitials}
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user?.fullName || user?.name || (user?.phone ? `SuperAdmin (${user.phone})` : "SuperAdmin")}
                  </span>
                  <span className="text-[10px] text-purple-600 font-mono font-bold truncate">
                    {user?.role || "SUPER_ADMIN"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center">
                  {adminInitials}
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full" />
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
        className={`flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC] relative transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-[275px]"
        }`}
      >
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[350px] bg-gradient-to-bl from-purple-100/40 via-indigo-50/20 to-transparent pointer-events-none rounded-full blur-3xl" />
        <div className="absolute top-32 left-10 w-[400px] h-[300px] bg-gradient-to-tr from-blue-50/30 to-transparent pointer-events-none rounded-full blur-3xl" />

        {/* TOPBAR NAVIGATION WITH DYNAMIC BREADCRUMBS */}
        <header className="h-[74px] bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
              <Link
                href="/superadmin"
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-500 hover:text-purple-700 flex items-center justify-center transition-colors"
                title="SuperAdmin Home"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/superadmin" className="text-slate-500 font-semibold hover:text-slate-800 transition-colors">
                SuperAdmin
              </Link>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-extrabold text-slate-900 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200/50">
                {lang === "gu" ? currentNavItem.nameGujarati : currentNavItem.name}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Launch Business Billing Dashboard */}
            <Link
              href="/"
              className="flex items-center gap-1.5 py-2 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-orange-700 border border-orange-200/70 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Launch SME Business Billing Portal"
            >
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="flex items-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{lang === "gu" ? "ગુજરાતી" : "English"}</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                  <button
                    onClick={() => {
                      setLang("en");
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      lang === "en" ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>English</span>
                    {lang === "en" && <span className="text-purple-600">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLang("gu");
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      lang === "gu" ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>ગુજરાતી</span>
                    {lang === "gu" && <span className="text-purple-600">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
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
          <div className="mx-6 sm:mx-8 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">✓</span>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="mx-6 sm:mx-8 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">⚠️</span>
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer p-1">
              ✕
            </button>
          </div>
        )}

        {/* ===================== 3. PAGE BODY CONTENT ===================== */}
        <main className="flex-1 p-5 sm:p-8 w-full max-w-[1920px] mx-auto space-y-6 relative z-10">
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-72 max-w-full flex-1 flex flex-col justify-between shadow-2xl p-5">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                    SA
                  </div>
                  <span className="font-black text-sm text-slate-900">SuperAdmin Console</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const active = item.isActive(pathname);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        active
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={active ? "text-purple-600" : "text-slate-400"}>{item.icon}</span>
                        <span>{lang === "gu" ? item.nameGujarati : item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-100 text-purple-700 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={logout}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
