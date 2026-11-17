"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { apiClient } from "../../../lib/api-client";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";
import type { AuditLogItem } from "../../../shared-types/superadmin";

export default function SuperAdminAuditLogsPage() {
  const { lang } = useSuperAdmin();

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data: any = await apiClient.get("/super-admin/audit-logs", {
        action: auditActionFilter,
        limit: 100,
      });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load audit logs", err);
    } finally {
      setIsLoading(false);
    }
  }, [auditActionFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const auditColumns: ColumnDef<AuditLogItem>[] = useMemo(
    () => [
      {
        id: "createdAt",
        header: lang === "gu" ? "સમય (TIMESTAMP)" : "TIMESTAMP",
        sortable: true,
        accessorKey: "createdAt",
        cell: (log) => {
          const d = new Date(log.createdAt);
          return (
            <div className="space-y-0.5">
              <div className="text-slate-800 font-mono text-xs font-semibold">
                {isNaN(d.getTime()) ? "—" : d.toLocaleTimeString()}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                {isNaN(d.getTime()) ? "—" : d.toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN")}
              </div>
            </div>
          );
        },
      },
      {
        id: "action",
        header: lang === "gu" ? "ક્રિયા (ACTION)" : "ACTION",
        sortable: true,
        accessorKey: "action",
        cell: (log) => {
          const act = log.action || "";
          let badgeColor = "bg-purple-50 text-purple-700 border-purple-200/80";
          if (act.includes("LOGIN") || act.includes("AUTH")) {
            badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
          } else if (act.includes("INVOICE") || act.includes("VOUCHER")) {
            badgeColor = "bg-blue-50 text-blue-700 border-blue-200/80";
          } else if (act.includes("DELETE") || act.includes("DROP") || act.includes("REMOVE")) {
            badgeColor = "bg-rose-50 text-rose-700 border-rose-200/80";
          } else if (act.includes("SUPPORT") || act.includes("IMPERSONATE")) {
            badgeColor = "bg-amber-50 text-amber-700 border-amber-200/80";
          }

          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold tracking-tight shadow-2xs ${badgeColor}`}>
              {act}
            </span>
          );
        },
      },
      {
        id: "entityName",
        header: lang === "gu" ? "એન્ટિટી (ENTITY)" : "ENTITY",
        sortable: true,
        accessorKey: "entityName",
        cell: (log) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
            {log.entityName || "Platform"}
          </span>
        ),
      },
      {
        id: "actor",
        header: lang === "gu" ? "વપરાશકર્તા (ACTOR USER)" : "ACTOR USER",
        sortable: true,
        accessorFn: (log) =>
          log.user?.fullName ||
          log.user?.phone ||
          (lang === "gu" ? "સિસ્ટમ પ્રોસેસ" : "System Process"),
        cell: (log) => {
          const actorName = log.user?.fullName || log.user?.phone || "System Daemon";
          const initials = actorName.slice(0, 2).toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-purple-200">
                {initials}
              </div>
              <div className="truncate max-w-[150px]">
                <div className="font-bold text-slate-900 text-xs truncate" title={actorName}>
                  {actorName}
                </div>
                {log.user?.role && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    {log.user.role}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "company",
        header: lang === "gu" ? "કંપની સંદર્ભ (COMPANY)" : "COMPANY CONTEXT",
        sortable: true,
        accessorFn: (log) =>
          log.company?.tradeName ||
          log.company?.legalName ||
          (lang === "gu" ? "પ્લેટફોર્મ ગ્લોબલ" : "Platform Global"),
        cell: (log) => {
          const compName = log.company?.tradeName || log.company?.legalName || "Platform Global";
          return (
            <div className="font-medium text-slate-700 text-xs truncate max-w-[160px]" title={compName}>
              {compName}
            </div>
          );
        },
      },
      {
        id: "hash",
        header: lang === "gu" ? "ક્રિપ્ટોગ્રાફિક હેશ (SHA-256)" : "CRYPTOGRAPHIC HASH",
        sortable: false,
        className: "min-w-[190px]",
        cell: (log) => {
          const hash = log.recordHash || "";
          const isCopied = copiedHash === hash;
          if (!hash) return <span className="text-slate-300">—</span>;

          return (
            <div className="flex items-center gap-1.5">
              <span
                className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-[140px]"
                title={hash}
              >
                {hash.slice(0, 16)}...
              </span>
              <button
                type="button"
                onClick={() => handleCopyHash(hash)}
                className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                  isCopied
                    ? "bg-emerald-100 text-emerald-700 font-bold"
                    : "bg-slate-100 text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                }`}
                title="Copy Full SHA-256 Hash"
              >
                {isCopied ? "✓" : "📋"}
              </button>
            </div>
          );
        },
      },
    ],
    [lang, copiedHash]
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header with Cryptographic Security Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Tamper-Evident Ledger
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SHA-256 Cryptographic Chain
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === "gu" ? "વૈશ્વિક ઓડિટ ટ્રેઇલ & સુરક્ષા" : "Global Audit Trail & Security"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {lang === "gu"
                ? "તમામ એડમિનિસ્ટ્રેટિવ અને વેપારી વ્યવહારો પર ક્રિપ્ટોગ્રાફિક SHA-256 ટેમ્પર-એવિડન્ટ લોગ સ્ટ્રીમ."
                : "Cryptographically verified, immutable event ledger tracking tenant alterations, auth logins, and billing vouchers across all organizations."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Audited Stream
              </span>
              <span className="text-lg font-black font-mono text-purple-300">
                {auditLogs.length} Events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table with Filters */}
      <DataTable<AuditLogItem>
        data={auditLogs}
        columns={auditColumns}
        keyExtractor={(log) => log.id}
        searchPlaceholder={
          lang === "gu"
            ? "ક્રિયા, એન્ટિટી, વપરાશકર્તા, હેશ શોધો..."
            : "Search action, entity, user, hash..."
        }
        searchKeys={["action", "entityName", "recordHash"]}
        customSearchFn={(log, query) => {
          const s = query.toLowerCase();
          return Boolean(
            log.action?.toLowerCase().includes(s) ||
              log.entityName?.toLowerCase().includes(s) ||
              (log.user?.fullName && log.user.fullName.toLowerCase().includes(s)) ||
              (log.user?.phone && log.user.phone.toLowerCase().includes(s)) ||
              (log.company?.tradeName && log.company.tradeName.toLowerCase().includes(s)) ||
              (log.company?.legalName && log.company.legalName.toLowerCase().includes(s)) ||
              (log.recordHash && log.recordHash.toLowerCase().includes(s))
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
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs cursor-pointer"
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
  );
}
