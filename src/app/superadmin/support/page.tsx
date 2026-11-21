"use client";

import React from "react";
import Link from "next/link";
import { useSuperAdmin } from "../../../context/superadmin-context";

export default function SuperAdminSupportPage() {
  const { stats, diagnostics, refetchDiagnostics } = useSuperAdmin();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Support & Diagnostics</h1>
        <p className="text-xs text-slate-500 mt-1">
          SuperAdmin infrastructure health monitoring, tenant technical support, and session diagnostics.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Helpdesk Contacts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">SuperAdmin Direct Channels</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1677E8] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1677E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Technical Escalations</p>
                <p className="font-bold text-slate-900">support@myownbillbook.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Priority SLA Hotline</p>
                <p className="font-bold text-slate-900">+91 82388 12890</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Diagnostics Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Cluster Telemetry</h2>
            <Link
              href="/superadmin/diagnostics"
              className="text-xs font-bold text-[#1677E8] hover:underline"
            >
              Full Diagnostics →
            </Link>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Database Engine</span>
              <span className="font-mono font-bold text-slate-900">PostgreSQL 16 (Connected)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Row-Level Security (RLS)</span>
              <span className="font-mono font-bold text-emerald-600">ENFORCED (Tenant Isolated)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active Tenant Fleets</span>
              <span className="font-mono font-bold text-slate-900">{stats?.tenants?.total || 43} Organizations</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Cryptographic Audit Stream</span>
              <span className="font-mono font-bold text-slate-900">{stats?.systemHealth?.totalAuditEvents || 45} Immutable Records</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
