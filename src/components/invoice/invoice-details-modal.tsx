"use client";

import React, { useRef } from "react";

export interface InvoiceItemDetails {
  id?: string;
  description?: string | null;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxableAmount?: number;
  taxRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
  item?: {
    id?: string;
    name: string;
    nameGujarati?: string | null;
    sku?: string | null;
    primaryUom?: {
      name?: string;
      symbol?: string;
      uqcCode?: string;
    } | null;
  } | null;
}

export interface DetailedInvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  category?: string;
  status: string;
  paymentMode?: string;
  isB2B?: boolean;
  subTotal?: number;
  discountTotal?: number;
  taxableAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  utgstAmount?: number;
  cessAmount?: number;
  roundOff?: number;
  grandTotal: number;
  paidAmount?: number;
  balanceAmount?: number;
  outstandingBalance?: number;
  notes?: string | null;
  termsAndConditions?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  company?: {
    id?: string;
    tradeName?: string;
    legalName?: string;
    gstin?: string | null;
    phone?: string;
    email?: string | null;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    pincode?: string;
    stateCode?: string;
    bankName?: string | null;
    bankAccountNo?: string | null;
    bankIfsc?: string | null;
    bankBranch?: string | null;
    upiVpa?: string | null;
  } | null;
  partyName?: string | null;
  party?: {
    id?: string;
    name: string;
    nameGujarati?: string | null;
    phone?: string;
    email?: string | null;
    gstin?: string | null;
    stateCode?: string;
    billingAddress?: any;
  } | null;
  items?: InvoiceItemDetails[];
}

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: DetailedInvoiceData | null;
  lang?: "en" | "gu";
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
  lang = "en",
}: InvoiceDetailsModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const company = invoice.company || ({} as NonNullable<DetailedInvoiceData["company"]>);
  const party = invoice.party || ({} as NonNullable<DetailedInvoiceData["party"]>);
  const items = Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items : [];

  const invoiceDateStr = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const dueDateStr = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "PARTIALLY_PAID":
        return "bg-amber-50 text-amber-700 border-amber-300";
      case "ISSUED":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-modal-content, #invoice-modal-content * {
            visibility: visible;
          }
          #invoice-modal-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="invoice-modal-content"
        ref={printRef}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {lang === "gu" ? "GST કર ઇન્વોઇસ વિગતો" : "GST TAX INVOICE DETAILS"}
              </div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{invoice.invoiceNumber}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono border font-bold ${getStatusBadge(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download / Print Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title={lang === "gu" ? "ઇન્વોઇસ ડાઉનલોડ કરો / પ્રિન્ટ કરો" : "Download / Print Invoice"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{lang === "gu" ? "ડાઉનલોડ (PDF)" : "Download (PDF)"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>{lang === "gu" ? "પ્રિન્ટ" : "Print"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-xs print:p-0 print:overflow-visible">
          {/* Invoice Document Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {invoice.category || "TAX INVOICE"}
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">
                {invoice.invoiceNumber}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-slate-500 font-medium">
                <span>
                  <strong>{lang === "gu" ? "તારીખ:" : "Date:"}</strong> {invoiceDateStr}
                </span>
                {dueDateStr && (
                  <span>
                    <strong>{lang === "gu" ? "છેલ્લી તારીખ:" : "Due Date:"}</strong> {dueDateStr}
                  </span>
                )}
                {invoice.paymentMode && (
                  <span className="capitalize">
                    <strong>{lang === "gu" ? "ચુકવણી:" : "Mode:"}</strong> {invoice.paymentMode.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Total Badge in Header */}
            <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-100 sm:min-w-[180px]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {lang === "gu" ? "કુલ રકમ (Grand Total)" : "Grand Total"}
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {formatInr(Number(invoice.grandTotal || 0))}
              </div>
              <div className="flex items-center sm:justify-end gap-2 mt-1">
                <span className="text-[11px] text-slate-600">
                  {lang === "gu" ? "બાકી:" : "Due:"} <strong className="font-mono">{formatInr(Number(invoice.balanceAmount ?? invoice.outstandingBalance ?? 0))}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Business (Seller) & Customer (Buyer) Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seller */}
            <div className="bg-[#FAFBFD] p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>{lang === "gu" ? "બિલ આપનાર (વિક્રેતા / કંપની)" : "BILLED BY (SUPPLIER / ISSUER)"}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {company.tradeName || company.legalName || "Main Business Company"}
              </h3>
              {company.legalName && company.tradeName && company.legalName !== company.tradeName && (
                <p className="text-slate-600 font-medium">{company.legalName}</p>
              )}
              {company.gstin && (
                <p className="font-mono font-semibold text-purple-700">
                  GSTIN: {company.gstin}
                </p>
              )}
              <p className="text-slate-600">
                {[company.addressLine1, company.addressLine2, company.city, company.pincode]
                  .filter(Boolean)
                  .join(", ") || "Business Address Registered"}
              </p>
              {(company.phone || company.email) && (
                <p className="text-slate-500 text-[11px]">
                  {company.phone && <span>📞 {company.phone}</span>}
                  {company.phone && company.email && " • "}
                  {company.email && <span>✉️ {company.email}</span>}
                </p>
              )}
            </div>

            {/* Buyer */}
            <div className="bg-[#FAFBFD] p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{lang === "gu" ? "બિલ મેળવનાર (ગ્રાહક / પાર્ટી)" : "BILLED TO (CUSTOMER / BUYER)"}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {party.name || invoice.partyName || (lang === "gu" ? "કાઉન્ટર કેશ કસ્ટમર" : "Walk-in Cash Customer")}
              </h3>
              {party.nameGujarati && (
                <p className="text-slate-600 font-medium">{party.nameGujarati}</p>
              )}
              {party.gstin && (
                <p className="font-mono font-semibold text-blue-700">
                  GSTIN: {party.gstin}
                </p>
              )}
              <p className="text-slate-600">
                {typeof party.billingAddress === "string"
                  ? party.billingAddress
                  : party.billingAddress?.line1
                  ? [party.billingAddress.line1, party.billingAddress.city, party.billingAddress.pincode]
                      .filter(Boolean)
                      .join(", ")
                  : (lang === "gu" ? "સ્થાનિક કાઉન્ટર વેચાણ" : "Counter Retail Sale")}
              </p>
              {party.phone && (
                <p className="text-slate-500 text-[11px]">
                  📞 {party.phone}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                {lang === "gu" ? "આઇટમ અને પ્રોડક્ટ વિગતો" : "INVOICE LINE ITEMS"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">{lang === "gu" ? "આઇટમ વર્ણન" : "Item & Description"}</th>
                    <th className="py-2.5 px-3 text-center">{lang === "gu" ? "HSN" : "HSN/SAC"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "gu" ? "જથ્થો" : "Qty"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "gu" ? "ભાવ (₹)" : "Rate (₹)"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "gu" ? "કરપાત્ર (₹)" : "Taxable (₹)"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "gu" ? "GST %" : "GST %"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "gu" ? "કુલ (₹)" : "Total (₹)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.length > 0 ? (
                    items.map((it, idx) => {
                      const itemName = it.item?.name || it.description || `Item #${idx + 1}`;
                      const hsn = it.hsnCode || "—";
                      const uom = it.item?.primaryUom?.symbol || "";
                      const taxRate = it.taxRate ? `${it.taxRate}%` : "—";
                      const taxable = it.taxableAmount ?? Number(it.quantity) * Number(it.unitPrice);
                      const total = it.totalAmount ?? (Number(taxable) + Number(it.cgstAmount || 0) + Number(it.sgstAmount || 0) + Number(it.igstAmount || 0));

                      return (
                        <tr key={it.id || idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{itemName}</div>
                            {it.item?.nameGujarati && (
                              <div className="text-[11px] text-slate-500">{it.item.nameGujarati}</div>
                            )}
                            {it.description && it.description !== itemName && (
                              <div className="text-[10px] text-slate-400">{it.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600">{hsn}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {Number(it.quantity)} {uom}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {formatInr(Number(it.unitPrice))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                            {formatInr(Number(taxable))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-purple-700 font-semibold">
                            {taxRate}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatInr(Number(total))}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                        {lang === "gu" ? "આ ઇન્વોઇસમાં સીધી પ્રોડક્ટ વિગતો શામેલ નથી." : "Standard summary invoice record (No granular items attached)."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Tax Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Notes & Bank Details */}
            <div className="space-y-3">
              {(company.bankName || company.bankAccountNo) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    {lang === "gu" ? "બેંક વિગતો (ચુકવણી માટે)" : "BANK DETAILS FOR PAYMENT"}
                  </div>
                  <div className="text-slate-700 font-medium space-y-0.5">
                    {company.bankName && <div><strong>Bank:</strong> {company.bankName}</div>}
                    {company.bankAccountNo && <div><strong>A/C No:</strong> <span className="font-mono">{company.bankAccountNo}</span></div>}
                    {company.bankIfsc && <div><strong>IFSC:</strong> <span className="font-mono">{company.bankIfsc}</span></div>}
                    {company.upiVpa && <div><strong>UPI VPA:</strong> <span className="font-mono text-purple-700">{company.upiVpa}</span></div>}
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">
                    {lang === "gu" ? "ખાસ નોંધ" : "Notes"}
                  </div>
                  <p>{invoice.notes}</p>
                </div>
              )}

              {invoice.termsAndConditions && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    {lang === "gu" ? "નિયમો અને શરતો" : "Terms & Conditions"}
                  </div>
                  <p>{invoice.termsAndConditions}</p>
                </div>
              )}
            </div>

            {/* Calculations Card */}
            <div className="bg-[#FAFBFD] p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                {lang === "gu" ? "કર અને હિસાબ સારાંશ" : "TAXABLE & FINANCIAL BREAKDOWN"}
              </div>

              {invoice.subTotal !== undefined && (
                <div className="flex justify-between py-1 text-slate-600 font-medium">
                  <span>{lang === "gu" ? "સબ ટોટલ:" : "Sub Total:"}</span>
                  <span className="font-mono">{formatInr(Number(invoice.subTotal || 0))}</span>
                </div>
              )}

              {invoice.discountTotal ? (
                <div className="flex justify-between py-1 text-emerald-600 font-medium">
                  <span>{lang === "gu" ? "ડિસ્કાઉન્ટ:" : "Total Discount:"}</span>
                  <span className="font-mono">-{formatInr(Number(invoice.discountTotal))}</span>
                </div>
              ) : null}

              {invoice.taxableAmount !== undefined && (
                <div className="flex justify-between py-1 text-slate-700 font-semibold">
                  <span>{lang === "gu" ? "કરપાત્ર રકમ (Taxable Value):" : "Total Taxable Value:"}</span>
                  <span className="font-mono">{formatInr(Number(invoice.taxableAmount || 0))}</span>
                </div>
              )}

              {Number(invoice.cgstAmount || 0) > 0 && (
                <div className="flex justify-between py-1 text-purple-700 font-medium">
                  <span>CGST:</span>
                  <span className="font-mono">{formatInr(Number(invoice.cgstAmount))}</span>
                </div>
              )}

              {Number(invoice.sgstAmount || 0) > 0 && (
                <div className="flex justify-between py-1 text-purple-700 font-medium">
                  <span>SGST:</span>
                  <span className="font-mono">{formatInr(Number(invoice.sgstAmount))}</span>
                </div>
              )}

              {Number(invoice.igstAmount || 0) > 0 && (
                <div className="flex justify-between py-1 text-purple-700 font-medium">
                  <span>IGST:</span>
                  <span className="font-mono">{formatInr(Number(invoice.igstAmount))}</span>
                </div>
              )}

              {Number(invoice.roundOff || 0) !== 0 && (
                <div className="flex justify-between py-1 text-slate-500">
                  <span>{lang === "gu" ? "રાઉન્ડ ઓફ:" : "Round Off:"}</span>
                  <span className="font-mono">{formatInr(Number(invoice.roundOff))}</span>
                </div>
              )}

              <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-slate-900 font-black text-sm">
                <span>{lang === "gu" ? "કુલ ચૂકવવાપાત્ર રકમ:" : "Grand Total:"}</span>
                <span className="font-mono text-base">{formatInr(Number(invoice.grandTotal || 0))}</span>
              </div>

              {invoice.paidAmount !== undefined && Number(invoice.paidAmount) > 0 && (
                <div className="flex justify-between py-1 text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                  <span>{lang === "gu" ? "ચૂકવેલ રકમ:" : "Amount Paid:"}</span>
                  <span className="font-mono">{formatInr(Number(invoice.paidAmount))}</span>
                </div>
              )}

              <div className="flex justify-between py-1 text-rose-700 font-bold">
                <span>{lang === "gu" ? "બાકી રહેલ રકમ:" : "Balance Due:"}</span>
                <span className="font-mono">
                  {formatInr(Number(invoice.balanceAmount ?? invoice.outstandingBalance ?? 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Signatory Line */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-100 text-[11px] text-slate-500">
            <div>
              <p>Generated by <strong>myownbillbook</strong> SuperAdmin Console</p>
              <p className="font-mono text-[10px]">Record ID: {invoice.id}</p>
            </div>
            <div className="text-right">
              <div className="w-44 border-b border-slate-400 mb-1" />
              <p className="font-bold text-slate-700">
                For {company.tradeName || company.legalName || "Issuing Company"}
              </p>
              <p className="text-[10px] text-slate-400">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (No Print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <span>💡</span>
            <span>{lang === "gu" ? "પ્રિન્ટ અથવા ડાઉનલોડ બટન દબાવીને ક્રોમ / બ્રાઉઝરમાંથી સીધી PDF સેવ કરી શકો છો." : "Click Download or Print to save directly as PDF or print on any printer."}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{lang === "gu" ? "ઇન્વોઇસ ડાઉનલોડ (PDF)" : "Download Invoice (PDF)"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              {lang === "gu" ? "બંધ કરો" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
