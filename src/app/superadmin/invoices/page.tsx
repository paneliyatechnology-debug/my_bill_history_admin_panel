"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { apiClient } from "../../../lib/api-client";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";
import { InvoiceDetailsModal } from "../../../components/invoice/invoice-details-modal";
import type { InvoiceItem } from "../../../shared-types/superadmin";

export default function SuperAdminInvoicesPage() {
  const { lang, formatInr } = useSuperAdmin();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const invoiceColumns: ColumnDef<InvoiceItem>[] = useMemo(
    () => [
      {
        id: "invoiceNumber",
        header: lang === "gu" ? "ઇન્વૉઇસ નંબર" : "Invoice #",
        sortable: true,
        accessorKey: "invoiceNumber",
        cell: (inv) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInvoiceDetails(inv);
            }}
            className="font-mono font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1.5 cursor-pointer text-left group"
            title={lang === "gu" ? "વિગતો અને ડાઉનલોડ" : "View Details & Download"}
          >
            <span>{inv.invoiceNumber}</span>
            <span className="text-[10px] text-purple-400 group-hover:translate-x-0.5 transition-transform">↗</span>
          </button>
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
            <span className="text-[#667085] font-medium">
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
        className: "font-bold text-[#202124]",
      },
      {
        id: "partyName",
        header: lang === "gu" ? "ગ્રાહક / પાર્ટી" : "Party / Customer",
        sortable: true,
        accessorFn: (inv) =>
          inv.party?.name ||
          inv.partyName ||
          (lang === "gu" ? "કાઉન્ટર વેચાણ (રોકડ)" : "Counter / Direct Sale"),
        className: "text-[#667085]",
      },
      {
        id: "grandTotal",
        header: lang === "gu" ? "કુલ રકમ" : "Grand Total",
        sortable: true,
        accessorKey: "grandTotal",
        className: "font-mono font-bold text-[#202124]",
        cell: (inv) => formatInr(Number(inv.grandTotal || 0)),
      },
      {
        id: "balance",
        header: lang === "gu" ? "બાકી રકમ" : "Balance Due",
        sortable: true,
        accessorFn: (inv) => inv.balanceAmount ?? inv.outstandingBalance ?? 0,
        className: "font-mono font-semibold text-slate-700",
        cell: (inv) => formatInr(Number(inv.balanceAmount ?? inv.outstandingBalance ?? 0)),
      },
      {
        id: "status",
        header: lang === "gu" ? "સ્થિતિ" : "Status",
        sortable: true,
        accessorKey: "status",
        cell: (inv) => {
          const status = inv.status;
          const color =
            status === "PAID"
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : status === "PARTIALLY_PAID"
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : status === "ISSUED"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-slate-100 text-slate-700 border-slate-300";
          return (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase font-mono ${color}`}>
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
        cell: (inv) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleOpenInvoiceDetails(inv)}
              className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ વિગતો જુઓ" : "View Invoice Details"}
            >
              <span>👁️</span>
              <span>{lang === "gu" ? "વિગતો" : "Details"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleOpenInvoiceDetails(inv);
                setTimeout(() => {
                  window.print();
                }, 300);
              }}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ ડાઉનલોડ (PDF)" : "Download / Print Invoice"}
            >
              <span>📥</span>
              <span>{lang === "gu" ? "ડાઉનલોડ" : "Download"}</span>
            </button>
          </div>
        ),
      },
    ],
    [lang, formatInr, handleOpenInvoiceDetails]
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-[#202124] tracking-tight">
          {lang === "gu" ? "બિઝનેસ ઇન્વોઇસ એક્સપ્લોરર" : "Cross-Tenant Invoices Explorer"}
        </h1>
        <p className="text-xs text-[#667085] mt-0.5">
          {lang === "gu"
            ? "તમામ રજિસ્ટર્ડ કંપનીઓ તરફથી તાજેતરના GST વેચાણ બિલનું કેન્દ્રિય રીડ-ઓન્લી નિરીક્ષણ."
            : "Centralized read-only visibility into recent GST sales transactions across all registered businesses."}
        </p>
      </div>

      <DataTable<InvoiceItem>
        data={invoices}
        columns={invoiceColumns}
        keyExtractor={(inv) => inv.id}
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

