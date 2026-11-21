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
        header: lang === "gu" ? "ઇન્વૉઇસ નંબર" : "Invoice #",
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
              className="font-medium text-[#1677E8] hover:text-[#1268D3] hover:underline flex items-center gap-1 cursor-pointer text-left group"
              title={lang === "gu" ? "વિગતો અને ડાઉનલોડ" : "View Details & Download"}
            >
              <span>{inv.invoiceNumber}</span>
              <span className="text-[10px] text-blue-400 group-hover:translate-x-0.5 transition-transform">↗</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleCopyInvoiceNumber(e, inv.invoiceNumber)}
              className="text-slate-400 hover:text-[#1677E8] p-1 rounded-md transition-colors"
              title="Copy invoice number"
            >
              {copiedInvoiceId === inv.invoiceNumber ? (
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-slate-400 hover:text-[#1677E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        ),
      },
      {
        id: "invoiceDate",
        header: lang === "gu" ? "તારીખ" : "Date",
        sortable: true,
        accessorKey: "invoiceDate",
        cell: (inv) => {
          const d = new Date(inv.invoiceDate);
          return (
            <span className="text-slate-500 font-normal text-xs">
              {isNaN(d.getTime()) ? "—" : d.toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN")}
            </span>
          );
        },
      },
      {
        id: "company",
        header: lang === "gu" ? "કંપની" : "Issuing Company",
        sortable: true,
        accessorFn: (inv) => inv.company?.tradeName || inv.company?.legalName || "—",
        cell: (inv) => (
          <div className="font-medium text-slate-800 text-xs truncate max-w-[170px]" title={inv.company?.tradeName}>
            {inv.company?.tradeName || inv.company?.legalName || "—"}
          </div>
        ),
      },
      {
        id: "partyName",
        header: lang === "gu" ? "ગ્રાહક / પાર્ટી" : "Party / Customer",
        sortable: true,
        accessorFn: (inv) =>
          inv.party?.name ||
          inv.partyName ||
          (lang === "gu" ? "કાઉન્ટર વેચાણ (રોકડ)" : "Counter / Direct Sale"),
        cell: (inv) => (
          <div className="text-slate-600 font-normal text-xs truncate max-w-[170px]">
            {inv.party?.name || inv.partyName || (lang === "gu" ? "કાઉન્ટર વેચાણ" : "Counter Sale")}
          </div>
        ),
      },
      {
        id: "grandTotal",
        header: lang === "gu" ? "કુલ રકમ" : "Grand Total",
        sortable: true,
        accessorKey: "grandTotal",
        className: "font-semibold text-slate-900 text-right text-xs",
        headerClassName: "text-right",
        align: "right",
        cell: (inv) => formatInr(Number(inv.grandTotal || 0)),
      },
      {
        id: "balance",
        header: lang === "gu" ? "બાકી રકમ" : "Balance Due",
        sortable: true,
        accessorFn: (inv) => inv.balanceAmount ?? inv.outstandingBalance ?? 0,
        className: "font-normal text-slate-500 text-right text-xs",
        headerClassName: "text-right",
        align: "right",
        cell: (inv) => {
          const bal = Number(inv.balanceAmount ?? inv.outstandingBalance ?? 0);
          return (
            <span className={bal > 0 ? "text-amber-600 font-medium" : "text-slate-400"}>
              {formatInr(bal)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: lang === "gu" ? "સ્થિતિ" : "Status",
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
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs ${color}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: lang === "gu" ? "ક્રિયાઓ" : "Actions",
        sortable: false,
        align: "right",
        headerClassName: "text-right",
        cell: (inv) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleOpenInvoiceDetails(inv)}
              className="px-2.5 py-1 text-xs font-medium text-[#1677E8] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ વિગતો જુઓ" : "View Invoice Details"}
            >
              <svg className="w-3.5 h-3.5 text-[#1677E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
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
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ ડાઉનલોડ (PDF)" : "Download / Print Invoice"}
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{lang === "gu" ? "પ્રિન્ટ" : "Print"}</span>
            </button>
          </div>
        ),
      },
    ],
    [lang, formatInr, handleOpenInvoiceDetails, copiedInvoiceId]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === "gu" ? "બિઝનેસ ઇન્વોઇસ એક્સપ્લોરર" : "Cross-Tenant Invoices Explorer"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "gu"
              ? "તમામ રજિસ્ટર્ડ કંપનીઓ તરફથી તાજેતરના GST વેચાણ બિલનું કેન્દ્રિય રીડ-ઓન્લી નિરીક્ષણ."
              : "Centralized read-only visibility into recent GST sales transactions across all registered businesses."}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl text-right shadow-2xs">
            <span className="text-[10px] font-medium uppercase text-slate-400 block tracking-wider">
              Recorded Fleet Volume
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {formatInr(stats?.businessVolume?.grossVolume || 0)}
            </span>
          </div>

          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <svg className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
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
        themeColor="blue"
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
