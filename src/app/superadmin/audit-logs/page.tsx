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

  const auditColumns: ColumnDef<AuditLogItem>[] = useMemo(
    () => [
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
    ],
    [lang]
  );

  return (
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
  );
}

