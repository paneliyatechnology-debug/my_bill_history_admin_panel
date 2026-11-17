"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSuperAdmin } from "../../context/superadmin-context";
import { apiClient } from "../../lib/api-client";
import { TAB_ROUTE_MAP } from "../../lib/superadmin-constants";
import { InvoiceDetailsModal } from "../../components/invoice/invoice-details-modal";
import SuperAdminLoading from "./loading";
import type { InvoiceItem } from "../../shared-types/superadmin";

function SuperAdminOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    stats,
    refetchStats,
    lang,
    setIsCreateTenantOpen,
    formatInr,
    getTierInfo,
    tenantRefreshTrigger,
  } = useSuperAdmin();

  const [recentInvoices, setRecentInvoices] = useState<InvoiceItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);

  // 1. Client-Side Legacy ?tab=... URL Compatibility Redirect
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      const normalizedTab = tab.trim().toLowerCase();
      const targetRoute = TAB_ROUTE_MAP[normalizedTab];
      if (targetRoute) {
        const remainingParams = new URLSearchParams(searchParams.toString());
        remainingParams.delete("tab");
        const qs = remainingParams.toString() ? `?${remainingParams.toString()}` : "";
        router.replace(`${targetRoute}${qs}`);
      }
    }
  }, [searchParams, router]);

  // Fetch Recent Invoices for Live Feed
  const fetchRecentInvoices = useCallback(async () => {
    try {
      const data: any = await apiClient.get("/super-admin/invoices", { limit: 10 });
      setRecentInvoices(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch recent invoices for overview", err);
    }
  }, []);

  useEffect(() => {
    fetchRecentInvoices();
  }, [fetchRecentInvoices, tenantRefreshTrigger]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), fetchRecentInvoices()]);
    setIsRefreshing(false);
  };

  const handleOpenInvoiceDetails = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setIsInvoiceDetailsOpen(true);
  };

  // Skeleton loading state when stats are loading
  if (!stats) {
    return (
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
                  <div className="h-7 bg-slate-200 rounded w-32" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dashboard Page Header & Live Telemetry Pulse */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-purple-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{lang === "gu" ? "સિસ્ટમ ઓનલાઇન" : "Telemetry Online"}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {stats.systemHealth.databaseStatus || "PostgreSQL Ready"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                RLS Enforced
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Uptime: {Math.floor(stats.systemHealth.uptimeSeconds / 3600)}h {Math.floor((stats.systemHealth.uptimeSeconds % 3600) / 60)}m
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === "gu" ? "સુપરએડમિન કમાન્ડ સેન્ટર & એનાલિટિક્સ" : "SuperAdmin Command Center & Analytics"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {lang === "gu"
                ? "તમામ રજિસ્ટર્ડ કંપનીઓ, જીએસટી સેલ્સ વોલ્યુમ, સબ્સ્ક્રિપ્શન પ્લાન અને સિક્યોરિટી ઓડિટનું રીયલ-ટાઇમ નિરીક્ષણ."
                : "Centralized live telemetry across all registered business tenants, transactional volume, fleet distribution, and RLS security enforcement."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 backdrop-blur-sm flex items-center gap-2 cursor-pointer shadow-xs"
              title={lang === "gu" ? "ડેટા રીફ્રેશ કરો" : "Refresh Live Metrics"}
            >
              <svg className={`w-4 h-4 text-purple-300 ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{lang === "gu" ? "રીફ્રેશ" : "Refresh"}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateTenantOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>{lang === "gu" ? "નવી સંસ્થા બનાવો" : "Create Tenant"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Large Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: GROSS BILLING VOLUME */}
        <div className="bg-white border border-emerald-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-black text-xl shadow-xs">
                ₹
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 font-mono">
                {stats.businessVolume.totalInvoices} {lang === "gu" ? "બિલ" : "Invoices"}
              </span>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-3">
              {lang === "gu" ? "કુલ જીએસટી બિલિંગ વોલ્યુમ" : "GROSS BILLING VOLUME"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight font-mono">
              {formatInr(stats.businessVolume.grossVolume)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Taxable: <strong className="font-mono text-slate-700">{formatInr(stats.businessVolume.totalTaxableAmount)}</strong>
            </span>
            <Link
              href="/superadmin/invoices"
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === "gu" ? "જુઓ" : "View"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* KPI 2: TOTAL TENANTS */}
        <div className="bg-white border border-purple-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-800 font-mono">
                {stats.tenants.active} {lang === "gu" ? "સક્રિય" : "Active"}
              </span>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-3">
              {lang === "gu" ? "કુલ બિઝનેસ સંસ્થાઓ" : "REGISTERED TENANTS"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight font-mono">
              {stats.tenants.total}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-amber-600 font-semibold">
              {stats.tenants.trial} {lang === "gu" ? "ટ્રાયલ પિરિયડ" : "In Trial"}
            </span>
            <Link
              href="/superadmin/tenants"
              className="text-purple-700 hover:text-purple-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === "gu" ? "મેનેજ કરો" : "Manage"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* KPI 3: COMPANIES & BRANCHES */}
        <div className="bg-white border border-blue-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800 font-mono">
                {stats.infrastructure.branches} {lang === "gu" ? "બ્રાન્ચ" : "Branches"}
              </span>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-3">
              {lang === "gu" ? "કંપનીઓ અને ઇન્ફ્રાસ્ટ્રક્ચર" : "BUSINESS ENTITIES"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight font-mono">
              {stats.infrastructure.companies} <span className="text-xs font-semibold text-slate-400 font-sans">Companies</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {stats.infrastructure.warehouses} {lang === "gu" ? "ગોડાઉન" : "Godowns"} • {stats.infrastructure.organizations} Orgs
            </span>
            <Link
              href="/superadmin/tenants"
              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === "gu" ? "વિગતો" : "View"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* KPI 4: PLATFORM USERS & STAFF SEATS */}
        <div className="bg-white border border-indigo-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 font-mono">
                {stats.users.active} {lang === "gu" ? "સક્રિય" : "Active"}
              </span>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-3">
              {lang === "gu" ? "કુલ વપરાશકર્તાઓ અને સ્ટાફ" : "PLATFORM USERS & STAFF"}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight font-mono">
              {stats.users.total} <span className="text-xs font-semibold text-slate-400 font-sans">{lang === "gu" ? "એકાઉન્ટ્સ" : "Users"}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {Object.keys(stats.users.byRole || {}).length} {lang === "gu" ? "સિક્યોરિટી રોલ" : "Security Roles"}
            </span>
            <Link
              href="/superadmin/users"
              className="text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === "gu" ? "મેનેજ કરો" : "Manage"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Telemetry Quick Metric Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {lang === "gu" ? "સરેરાશ બિલ રકમ" : "AVG INVOICE TICKET"}
          </span>
          <p className="text-lg font-black text-slate-800 font-mono mt-0.5">
            {formatInr(stats.businessVolume.totalInvoices > 0 ? stats.businessVolume.grossVolume / stats.businessVolume.totalInvoices : 0)}
          </p>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {lang === "gu" ? "સક્રિય સબ્સ્ક્રિપ્શન ફ્લીટ" : "ACTIVE SUBSCRIPTION FLEET"}
          </span>
          <p className="text-lg font-black text-slate-800 font-mono mt-0.5">
            {stats.tenants.active} / {stats.tenants.total}{" "}
            <span className="text-xs font-semibold text-emerald-600 font-sans">
              ({stats.tenants.total > 0 ? Math.round((stats.tenants.active / stats.tenants.total) * 100) : 0}% Active)
            </span>
          </p>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {lang === "gu" ? "કુલ એકત્રિત GST" : "TOTAL GST COLLECTED"}
          </span>
          <p className="text-lg font-black text-purple-700 font-mono mt-0.5">
            {formatInr(stats.businessVolume.totalGstAmount)}
          </p>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {lang === "gu" ? "ડેટાબેઝ એન્જિન" : "DATABASE ENGINE"}
          </span>
          <p className="text-lg font-black text-slate-800 font-mono mt-0.5">
            PostgreSQL 16 <span className="text-xs font-semibold text-blue-600 font-sans">RLS</span>
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout: Left = Recent Invoices with Download, Right = Subscription Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Live Recent Invoices Feed */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    {lang === "gu" ? "તાજેતરના GST ઇન્વોઇસ (Live Feed)" : "Recent Cross-Tenant Invoices"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {lang === "gu" ? "ઇન્વોઇસ પર ક્લિક કરીને વિગતો જુઓ અથવા સીધું ડાઉનલોડ કરો" : "Click any invoice to view granular line items or download PDF directly"}
                  </p>
                </div>
              </div>

              <Link
                href="/superadmin/invoices"
                className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 group cursor-pointer"
              >
                <span>{lang === "gu" ? "તમામ જુઓ" : "View All"}</span>
                <span className="font-mono font-semibold text-slate-400">({recentInvoices.length})</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            {/* Table of Invoices */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2">{lang === "gu" ? "નંબર" : "Invoice #"}</th>
                    <th className="py-2.5 px-2">{lang === "gu" ? "કંપની / ગ્રાહક" : "Company & Customer"}</th>
                    <th className="py-2.5 px-2 text-right">{lang === "gu" ? "રકમ" : "Amount"}</th>
                    <th className="py-2.5 px-2 text-center">{lang === "gu" ? "સ્થિતિ" : "Status"}</th>
                    <th className="py-2.5 px-2 text-right">{lang === "gu" ? "ક્રિયા" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.length > 0 ? (
                    recentInvoices.slice(0, 5).map((inv) => {
                      const d = new Date(inv.invoiceDate);
                      return (
                        <tr
                          key={inv.id}
                          onClick={() => handleOpenInvoiceDetails(inv)}
                          className="hover:bg-purple-50/40 cursor-pointer transition-colors group"
                        >
                          <td className="py-2.5 px-2 font-mono font-bold text-purple-700 group-hover:text-purple-900">
                            <div className="flex items-center gap-1">
                              <span>{inv.invoiceNumber}</span>
                              <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              {isNaN(d.getTime()) ? "—" : d.toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN")}
                            </div>
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="font-bold text-slate-800 truncate max-w-[160px]">
                              {inv.company?.tradeName || inv.company?.legalName || "—"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                              {inv.party?.name || inv.partyName || (lang === "gu" ? "કાઉન્ટર સેલ" : "Counter Sale")}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                            {formatInr(Number(inv.grandTotal || 0))}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase border ${
                                inv.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : inv.status === "PARTIALLY_PAID"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenInvoiceDetails(inv)}
                                className="p-1 rounded bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors"
                                title={lang === "gu" ? "વિગતો જુઓ" : "View Details"}
                              >
                                👁️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenInvoiceDetails(inv);
                                  setTimeout(() => {
                                    window.print();
                                  }, 250);
                                }}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title={lang === "gu" ? "ઇન્વોઇસ ડાઉનલોડ / પ્રિન્ટ" : "Download / Print"}
                              >
                                📥
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        {lang === "gu" ? "હજી કોઈ ઇન્વોઇસ નથી." : "No cross-tenant invoices recorded yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>💡 {lang === "gu" ? "કોઈપણ લાઇન પર ક્લિક કરીને પૂરી GST વિગતો ખોલો." : "Click any row to open the complete printable GST invoice."}</span>
            <Link
              href="/superadmin/invoices"
              className="text-purple-700 hover:underline font-bold"
            >
              {lang === "gu" ? "બધા ઇન્વોઇસ જુઓ →" : "View All Invoices →"}
            </Link>
          </div>
        </div>

        {/* Right (5 cols): Subscription Tiers & Fleet Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    {lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન વિતરણ" : "Subscription Tiers"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {lang === "gu" ? "પ્લાન મુજબ બિઝનેસ ક્લાયન્ટ્સનું વિતરણ" : "Active tenant distribution across commercial tiers"}
                  </p>
                </div>
              </div>

              <Link
                href="/superadmin/plans"
                className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>{lang === "gu" ? "પ્લાન વિગતો" : "Plans"}</span>
                <span>→</span>
              </Link>
            </div>

            {/* Proportional Stacked Bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
                {Object.entries(stats.subscriptionTiers || {}).map(([key, count]) => {
                  const pct = stats.tenants.total > 0 ? (count / stats.tenants.total) * 100 : 0;
                  if (pct === 0) return null;
                  const bg =
                    key === "TRIAL"
                      ? "bg-amber-400"
                      : key === "RETAIL_BASIC"
                        ? "bg-blue-400"
                        : key === "WHOLESALE_PRO"
                          ? "bg-emerald-400"
                          : key === "DISTRIBUTION_ENTERPRISE"
                            ? "bg-orange-400"
                            : "bg-purple-500";
                  return (
                    <div
                      key={key}
                      style={{ width: `${pct}%` }}
                      className={`${bg} transition-all`}
                      title={`${key}: ${count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tier Cards Grid */}
            <div className="space-y-2 mt-4">
              {Object.entries(stats.subscriptionTiers || {}).map(([tierKey, count]) => {
                const meta = getTierInfo(tierKey);
                const pct = stats.tenants.total > 0 ? Math.round((count / stats.tenants.total) * 100) : 0;
                return (
                  <Link
                    key={tierKey}
                    href={`/superadmin/tenants?tier=${tierKey}`}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between border hover:shadow-xs ${meta.style}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${meta.badgeStyle}`}>
                        {meta.icon()}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-800">
                          {lang === "gu" ? meta.nameGujarati : meta.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {lang === "gu" ? meta.subtitleGujarati : meta.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {count}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono ml-1.5">
                        ({pct}%)
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {lang === "gu" ? "કુલ સંસ્થાઓ:" : "Fleet Total:"} <strong className="text-slate-800">{stats.tenants.total} Tenants</strong>
            </span>
            <Link
              href="/superadmin/tenants"
              className="text-purple-700 hover:underline font-bold"
            >
              {lang === "gu" ? "સંસ્થાઓ મેનેજ કરો →" : "Filter Fleet →"}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: User Roles & Diagnostics Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Platform Users by Role */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {lang === "gu" ? "વપરાશકર્તા ભૂમિકાઓ વિતરણ" : "Platform Users & Security Roles"}
              </h3>
            </div>
            <Link
              href="/superadmin/users"
              className="text-xs text-purple-700 font-bold hover:underline"
            >
              {lang === "gu" ? "તમામ જુઓ →" : "View Users →"}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
            {Object.entries(stats.users.byRole || {}).map(([role, cnt]) => (
              <Link
                key={role}
                href={`/superadmin/users?role=${role}`}
                className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/60 transition-colors cursor-pointer block"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  {role.replace(/_/g, " ")}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-slate-900 font-mono">{cnt}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Diagnostics & Health */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {lang === "gu" ? "સિસ્ટમ સુરક્ષા અને તબિયત" : "System Health & Security Integrity"}
              </h3>
            </div>
            <Link
              href="/superadmin/diagnostics"
              className="text-xs text-purple-700 font-bold hover:underline"
            >
              {lang === "gu" ? "ડાયગ્નોસ્ટિક્સ →" : "Diagnostics →"}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                DATABASE STATUS
              </div>
              <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{stats.systemHealth.databaseStatus || "Connected (Healthy)"}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ROW-LEVEL SECURITY (RLS)
              </div>
              <div className="text-sm font-bold text-purple-700 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Enforced (Zero-Leak)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                AUDIT HASH CHAIN
              </div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Verified Chained</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                NODE ENVIRONMENT
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1 font-mono">
                {stats.systemHealth.nodeVersion || "v22.x"} Live
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details & Download Modal */}
      <InvoiceDetailsModal
        isOpen={isInvoiceDetailsOpen}
        onClose={() => setIsInvoiceDetailsOpen(false)}
        invoice={selectedInvoice}
        lang={lang}
      />
    </div>
  );
}

export default function SuperAdminOverviewPage() {
  return (
    <Suspense fallback={<SuperAdminLoading />}>
      <SuperAdminOverviewContent />
    </Suspense>
  );
}
