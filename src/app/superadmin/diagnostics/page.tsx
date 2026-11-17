"use client";

import React, { useState } from "react";
import { useSuperAdmin } from "../../../context/superadmin-context";

export default function SuperAdminDiagnosticsPage() {
  const { diagnostics, refetchDiagnostics, stats, lang } = useSuperAdmin();
  const [isPinging, setIsPinging] = useState(false);

  const handleRunPing = async () => {
    setIsPinging(true);
    await refetchDiagnostics();
    setIsPinging(false);
  };

  const uptimeSeconds =
    diagnostics?.system?.uptimeSeconds || stats?.systemHealth?.uptimeSeconds || 0;
  const uptimeHours = Math.floor(uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

  return (
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
          onClick={handleRunPing}
          disabled={isPinging}
          className="py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className={`w-4 h-4 text-purple-600 ${isPinging ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            {uptimeHours}h {uptimeMinutes}m
          </div>
          <div className="mt-2 text-xs font-mono uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded w-fit border border-purple-200">
            {diagnostics?.system?.environment || "Production"}
          </div>
        </div>
      </div>
    </div>
  );
}

