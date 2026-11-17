"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { apiClient } from "../../../lib/api-client";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";
import { InvoiceDetailsModal } from "../../../components/invoice/invoice-details-modal";
import type { InvoiceItem } from "../../../shared-types/superadmin";

export default function SuperAdminInvoicesPage() {
  const { lang, formatInr, stats } = useSuperAdmin();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Invoice Details Modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data: any = await apiClient.get("/super-admin/invoices", {
        search: invoiceSearch,
        limit: 100,
      });
      setInvoices(data?.data || []);
    } catch (err: any) {
      console.error("Failed to load invoices", err);
    } finally {
      setIsLoading(false);
    }
  }, [invoiceSearch]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenInvoiceDetails = useCallback((inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setIsInvoiceDetailsOpen(true);
  }, []);

  const handleCopyInvoiceNumber = (e: React.MouseEvent, num: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedInvoiceId(num);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  const invoiceColumns: ColumnDef<InvoiceItem>[] = useMemo(
    () => [
      {
        id: "invoiceNumber",
        header: lang === "gu" ? "ઇન્વૉઇસ નંબર" : "INVOICE #",
        sortable: true,
        accessorKey: "invoiceNumber",
        cell: (inv) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenInvoiceDetails(inv);
              }}
              className="font-mono font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 cursor-pointer text-left group"
              title={lang === "gu" ? "વિગતો અને ડાઉનલોડ" : "View Details & Download"}
            >
              <span>{inv.invoiceNumber}</span>
              <span className="text-[10px] text-purple-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleCopyInvoiceNumber(e, inv.invoiceNumber)}
              className="text-slate-400 hover:text-purple-600 p-0.5 rounded transition-colors"
              title="Copy invoice number"
            >
              {copiedInvoiceId === inv.invoiceNumber ? "✓" : "📋"}
            </button>
          </div>
        ),
      },
      {
        id: "invoiceDate",
        header: lang === "gu" ? "તારીખ" : "DATE",
        sortable: true,
        accessorKey: "invoiceDate",
        cell: (inv) => {
          const d = new Date(inv.invoiceDate);
          return (
            <span className="text-slate-600 font-mono text-xs">
              {isNaN(d.getTime()) ? "—" : d.toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN")}
            </span>
          );
        },
      },
      {
        id: "company",
        header: lang === "gu" ? "કંપની" : "ISSUING COMPANY",
        sortable: true,
        accessorFn: (inv) => inv.company?.tradeName || inv.company?.legalName || "—",
        cell: (inv) => (
          <div className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={inv.company?.tradeName}>
            {inv.company?.tradeName || inv.company?.legalName || "—"}
          </div>
        ),
      },
      {
        id: "partyName",
        header: lang === "gu" ? "ગ્રાહક / પાર્ટી" : "PARTY / CUSTOMER",
        sortable: true,
        accessorFn: (inv) =>
          inv.party?.name ||
          inv.partyName ||
          (lang === "gu" ? "કાઉન્ટર વેચાણ (રોકડ)" : "Counter / Direct Sale"),
        cell: (inv) => (
          <div className="text-slate-600 text-xs truncate max-w-[170px]">
            {inv.party?.name || inv.partyName || (lang === "gu" ? "કાઉન્ટર વેચાણ" : "Counter Sale")}
          </div>
        ),
      },
      {
        id: "grandTotal",
        header: lang === "gu" ? "કુલ રકમ" : "GRAND TOTAL",
        sortable: true,
        accessorKey: "grandTotal",
        className: "font-mono font-black text-slate-900 text-right",
        headerClassName: "text-right",
        align: "right",
        cell: (inv) => formatInr(Number(inv.grandTotal || 0)),
      },
      {
        id: "balance",
        header: lang === "gu" ? "બાકી રકમ" : "BALANCE DUE",
        sortable: true,
        accessorFn: (inv) => inv.balanceAmount ?? inv.outstandingBalance ?? 0,
        className: "font-mono font-bold text-slate-700 text-right",
        headerClassName: "text-right",
        align: "right",
        cell: (inv) => {
          const bal = Number(inv.balanceAmount ?? inv.outstandingBalance ?? 0);
          return (
            <span className={bal > 0 ? "text-amber-600 font-bold" : "text-slate-400"}>
              {formatInr(bal)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: lang === "gu" ? "સ્થિતિ" : "STATUS",
        sortable: true,
        accessorKey: "status",
        align: "center",
        headerClassName: "text-center",
        cell: (inv) => {
          const status = inv.status;
          const color =
            status === "PAID"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : status === "PARTIALLY_PAID"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : status === "ISSUED"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200";
          return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase font-mono shadow-2xs ${color}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: lang === "gu" ? "ક્રિયાઓ" : "ACTIONS",
        sortable: false,
        align: "right",
        headerClassName: "text-right",
        cell: (inv) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleOpenInvoiceDetails(inv)}
              className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200/80 transition-colors flex items-center gap-1 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ વિગતો જુઓ" : "View Invoice Details"}
            >
              <span>👁️</span>
              <span>{lang === "gu" ? "વિગતો" : "View"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleOpenInvoiceDetails(inv);
                setTimeout(() => {
                  window.print();
                }, 300);
              }}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ ડાઉનલોડ (PDF)" : "Download / Print Invoice"}
            >
              <span>📥</span>
              <span>{lang === "gu" ? "પ્રિન્ટ" : "Print"}</span>
            </button>
          </div>
        ),
      },
    ],
    [lang, formatInr, handleOpenInvoiceDetails, copiedInvoiceId]
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                GST Compliance Explorer
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Audit Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === "gu" ? "બિઝનેસ ઇન્વોઇસ એક્સપ્લોરર" : "Cross-Tenant Invoices Explorer"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {lang === "gu"
                ? "તમામ રજિસ્ટર્ડ કંપનીઓ તરફથી તાજેતરના GST વેચાણ બિલનું કેન્દ્રિય રીડ-ઓન્લી નિરીક્ષણ."
                : "Centralized read-only visibility into recent GST sales transactions across all registered businesses."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Recorded Fleet Volume
            </span>
            <span className="text-lg font-black font-mono text-purple-300">
              {formatInr(stats?.businessVolume?.grossVolume || 0)}
            </span>
          </div>
        </div>
      </div>

      <DataTable<InvoiceItem>
        data={invoices}
        columns={invoiceColumns}
        keyExtractor={(inv) => inv.id}
        isLoading={isLoading}
        searchPlaceholder={
          lang === "gu"
            ? "બિલ નંબર, કંપની, ગ્રાહક શોધો..."
            : "Search invoice #, customer, company..."
        }
        searchKeys={["invoiceNumber", "status"]}
        customSearchFn={(inv, query) => {
          const s = query.toLowerCase();
          return Boolean(
            inv.invoiceNumber.toLowerCase().includes(s) ||
              (inv.party?.name && inv.party.name.toLowerCase().includes(s)) ||
              (inv.partyName && inv.partyName.toLowerCase().includes(s)) ||
              (inv.company?.tradeName && inv.company.tradeName.toLowerCase().includes(s)) ||
              (inv.company?.legalName && inv.company.legalName.toLowerCase().includes(s)) ||
              inv.status.toLowerCase().includes(s)
          );
        }}
        lang={lang}
        themeColor="purple"
        exportable
        exportFileName="global_invoices"
        onRowClick={(inv) => handleOpenInvoiceDetails(inv)}
      />

      <InvoiceDetailsModal
        isOpen={isInvoiceDetailsOpen}
        onClose={() => setIsInvoiceDetailsOpen(false)}
        invoice={selectedInvoice}
        lang={lang}
      />
    </div>
  );
}
