"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSuperAdmin } from "../../context/superadmin-context";
import { TenantCreateWizardModal } from "../tenants/tenant-create-wizard-modal";

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
}

interface NavItemDef {
  id: string;
  name: string;
  href: string;
  badge?: string;
  isActive: (pathname: string) => boolean;
  icon: React.ReactNode;
}

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
    plans,
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

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Navigation Items Organized by Logical Groups (exact match to target UI)
  const navGroups: NavGroupDef[] = useMemo(
    () => [
      {
        label: "Overview",
        items: [
          {
            id: "dashboard",
            name: "Dashboard",
            href: "/superadmin",
            isActive: (p) => p === "/superadmin",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            id: "organizations",
            name: "Organizations",
            href: "/superadmin/tenants",
            badge: stats ? String(stats.tenants?.total ?? 0) : undefined,
            isActive: (p) => p.startsWith("/superadmin/tenants"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
          },
          {
            id: "plans",
            name: "Plans & Pricing",
            href: "/superadmin/plans",
            badge: plans?.length ? String(plans.length) : undefined,
            isActive: (p) => p.startsWith("/superadmin/plans"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            ),
          },
          {
            id: "subscriptions",
            name: "Subscriptions",
            href: "/superadmin/subscriptions",
            isActive: (p) => p.startsWith("/superadmin/subscriptions"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ),
          },
        ],
      },
      {
        label: "Billing & Revenue",
        items: [
          {
            id: "transactions",
            name: "Transactions",
            href: "/superadmin/transactions",
            isActive: (p) => p.startsWith("/superadmin/transactions"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
          },
          {
            id: "invoices",
            name: "Invoices",
            href: "/superadmin/invoices",
            badge: stats ? String(stats.businessVolume?.totalInvoices ?? 0) : undefined,
            isActive: (p) => p.startsWith("/superadmin/invoices"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            id: "coupons",
            name: "Coupons",
            href: "/superadmin/coupons",
            isActive: (p) => p.startsWith("/superadmin/coupons"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            ),
          },
          {
            id: "addons",
            name: "Add-ons",
            href: "/superadmin/addons",
            isActive: (p) => p.startsWith("/superadmin/addons"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            ),
          },
        ],
      },
      {
        label: "Configuration",
        items: [
          {
            id: "features",
            name: "Feature Management",
            href: "/superadmin/features",
            isActive: (p) => p.startsWith("/superadmin/features"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ),
          },
          {
            id: "analytics",
            name: "Analytics",
            href: "/superadmin/analytics",
            isActive: (p) => p.startsWith("/superadmin/analytics"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
          },
        ],
      },
      {
        label: "Operations",
        items: [
          {
            id: "support",
            name: "Support",
            href: "/superadmin/support",
            isActive: (p) => p.startsWith("/superadmin/support") || p.startsWith("/superadmin/diagnostics"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          },
          {
            id: "users",
            name: "Admin Users",
            href: "/superadmin/users",
            badge: stats ? String(stats.users?.total ?? 0) : undefined,
            isActive: (p) => p.startsWith("/superadmin/users"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          },
          {
            id: "audit",
            name: "Activity Logs",
            href: "/superadmin/audit-logs",
            isActive: (p) => p.startsWith("/superadmin/audit"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            id: "settings",
            name: "Platform Settings",
            href: "/superadmin/settings",
            isActive: (p) => p.startsWith("/superadmin/settings"),
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
        ],
      },
    ],
    [stats, plans]
  );

  // Dynamic current page title for breadcrumb
  const currentNav = useMemo(() => {
    for (const g of navGroups) {
      for (const it of g.items) {
        if (it.isActive(pathname)) return it;
      }
    }
    return { name: "Dashboard", href: "/superadmin" };
  }, [navGroups, pathname]);

  const handleGlobalSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && globalSearch.trim()) {
      router.push(`/superadmin/tenants?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // 1. SAFE FORBIDDEN SCREEN
  if (authStatus === "forbidden") {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-6 text-center text-[#0F172A]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
          <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-600 px-3 py-1 bg-rose-50 rounded-full border border-rose-200 mb-2">
          Error 403 • Unauthorized Privilege
        </span>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          SuperAdmin Access Denied
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-md">
          Platform SuperAdmin credentials are required to view this console. Your account does not have authorization to view multi-tenant infrastructure.
        </p>
        <Link
          href="/"
          className="mt-6 py-2.5 px-5 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          ← Return to Business Dashboard
        </Link>
      </div>
    );
  }

  // 2. BACKEND OFFLINE SCREEN
  if (authStatus === "network_error") {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-6 text-center text-[#0F172A]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.072m7.072 0a5 5 0 010 7.072M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Backend Service Connecting...
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-md">
          {authErrorMessage || "Unable to reach server. Please ensure backend service is active on port 4000."}
        </p>
        <button
          onClick={() => verifyServerAuthorization()}
          className="mt-6 py-2.5 px-5 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#0F172A] flex antialiased selection:bg-[#1677E8] selection:text-white font-sans">
      {/* ===================== 1. LEFT SIDEBAR ===================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col justify-between bg-white border-r border-slate-200/90 transition-all duration-300 ease-in-out h-screen ${
          isSidebarCollapsed ? "w-20" : "w-[260px]"
        } hidden lg:flex`}
      >
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-[70px] flex items-center justify-between px-5 border-b border-slate-100 bg-white">
            <Link href="/superadmin" className="flex items-center gap-3 group">
              {/* Brand Logo Icon */}
              <div className="w-9 h-9 rounded-xl bg-[#1677E8] flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16l-7-3.5L4 20V4z" />
                </svg>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-[#1677E8] transition-colors leading-tight">
                    MyOwn BillBook
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Super Admin
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Menu with Logical Groups */}
          <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5" aria-label="SuperAdmin Sidebar Navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = item.isActive(pathname);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        title={isSidebarCollapsed ? item.name : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? "bg-[#1677E8] text-white shadow-sm font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <span className={`shrink-0 ${active ? "text-white" : "text-slate-400"}`}>
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && (
                          <div className="flex-1 flex items-center justify-between truncate">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                  active
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-500"
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
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* ===================== 2. MAIN APPLICATION WORKSPACE ===================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen bg-[#F5F8FC] relative transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-[260px]"
        }`}
      >
        {/* TOPBAR HEADER NAVIGATION */}
        <header className="h-[70px] bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4">
            {/* Collapse / Expand Hamburger Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
              <Link
                href="/superadmin"
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="SuperAdmin Home"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <span className="text-slate-300">›</span>
              <span className="text-slate-500 font-medium">Super Admin</span>
              <span className="text-slate-300">›</span>
              <span className="font-bold text-slate-900">
                {currentNav.name}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Center-Right Global Search Field with Cmd+K */}
            <div className="relative hidden md:flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearchKeyDown}
                placeholder="Search organizations, plans, subscriptions..."
                className="w-72 lg:w-96 pl-10 pr-12 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 focus:border-[#1677E8] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
              <span className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded">
                ⌘ K
              </span>
            </div>

            {/* Notification Bell */}
            <button
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1677E8]" />
            </button>

            {/* Help Link */}
            <Link
              href="/superadmin/support"
              className="hidden sm:flex items-center gap-1.5 p-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </Link>

            {/* Super Admin User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1677E8] font-bold text-xs flex items-center justify-center shrink-0">
                  {adminInitials || "JK"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.fullName || "Jaydeep Khunt"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Super Admin
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user?.fullName || "Jaydeep Khunt"}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || "superadmin@myownbillbook.com"}</p>
                  </div>
                  <Link
                    href="/superadmin/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span>Platform Settings</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span>Client Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left cursor-pointer border-t border-slate-100"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* NOTIFICATION BANNERS */}
        {actionSuccess && (
          <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {actionError && (
          <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* PRIMARY MAIN CONTENT */}
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>

      {/* GLOBAL CREATE TENANT MODAL */}
      <TenantCreateWizardModal
        isOpen={isCreateTenantOpen}
        onClose={() => setIsCreateTenantOpen(false)}
        onSubmit={handleWizardCreateTenant}
        isLoading={isCreatingTenant}
        statesList={INDIAN_STATES}
      />
    </div>
  );
}
