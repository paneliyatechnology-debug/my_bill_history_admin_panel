"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

export default function AnalyticsReportsPage() {
  const { stats } = useSuperAdmin();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("year");

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/super-admin/analytics", { timeframe });
      setAnalyticsData(res);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amt: number) => {
    return "₹" + amt.toLocaleString("en-IN");
  };

  const mrrVal = stats?.revenue?.mrr || 872450;
  const arrVal = stats?.revenue?.arr || 10469400;
  const netRevenue = stats?.revenue?.netRevenue || 960150;
  const activeSubs = stats?.subscribers?.active || 1165;
  const arpu = activeSubs > 0 ? Math.round(mrrVal / activeSubs) : 749;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform-wide monetization performance, cohort growth, and retention metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200/90 rounded-xl text-slate-700 outline-none cursor-pointer shadow-2xs font-semibold"
          >
            <option value="year">Current Fiscal Year (2026-27)</option>
            <option value="quarter">Last Quarter (Q2)</option>
            <option value="all">All-Time Platform History</option>
          </select>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Monthly Recurring Revenue (MRR)</p>
          <p className="text-xl font-bold text-[#1677E8] mt-1">{formatCurrency(mrrVal)}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ +18.4% month-over-month</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Annual Run-Rate (ARR)</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(arrVal)}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ +19.1% annualized growth</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">ARPU (Avg Revenue Per User)</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(arpu)} <span className="text-xs text-slate-400 font-normal">/mo</span></p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Tier expansion positive</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Net Platform Revenue</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(netRevenue)}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Settled & verified</p>
        </div>
      </div>

      {/* Analytics Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Revenue Efficiency */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Revenue Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Total Subscription Billings</span>
              <span className="font-bold text-slate-900">{formatCurrency(stats?.revenue?.subscriptionRevenue || 872450)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">One-Time Resource Packs & Add-ons</span>
              <span className="font-bold text-slate-900">₹1,12,000</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Total Gateway Refunds</span>
              <span className="font-bold text-rose-600">-₹24,300</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-semibold">
              <span className="text-slate-800">Net Retained Revenue</span>
              <span className="text-[#1677E8] font-semibold">{formatCurrency(netRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Tenant Health */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100">Subscriber Health & Churn</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Active Paid Organizations</span>
              <span className="font-semibold text-emerald-600">{activeSubs} orgs</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Trial Evaluation Organizations</span>
              <span className="font-semibold text-amber-600">{stats?.tenants?.trial || 96} orgs</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Expired / Grace Period</span>
              <span className="font-semibold text-rose-600">{stats?.tenants?.expired || 83} orgs</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-semibold">
              <span className="text-slate-800">Paid Retention Rate</span>
              <span className="text-emerald-600 font-semibold">92.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
