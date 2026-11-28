"use client";

import React from "react";
import Link from "next/link";
import { useSuperAdmin } from "../../../context/superadmin-context";

export default function FeatureManagementPage() {
  const { plans } = useSuperAdmin();

  const platformModules = [
    {
      key: "posBilling",
      name: "Counter POS & Fast Thermal Billing",
      category: "Sales & POS",
      description: "Barcode scanning, instant bill print, thermal printer receipt 2-inch/3-inch support.",
    },
    {
      key: "gstReports",
      name: "GST Filing & Tax Summary Ledgers",
      category: "Compliance",
      description: "GSTR-1, GSTR-3B summary reports, B2B, B2CL, B2CS, and HSN summary computation.",
    },
    {
      key: "barcodeThermal",
      name: "Barcode Generation & Item Labels",
      category: "Inventory",
      description: "EAN-13, Code-128 barcode generator and thermal sticker printing.",
    },
    {
      key: "doubleEntryLedgers",
      name: "Double-Entry Accounting & Trial Balance",
      category: "Accounting",
      description: "Journal vouchers, ledger accounts, cash/bank daybooks, balance sheets, and P&L.",
    },
    {
      key: "eInvoiceEwaybill",
      name: "Government E-Invoice & E-Waybill (NIC API)",
      category: "Compliance",
      description: "Direct IRN generation, QR code embedding, and E-Way bill generation.",
    },
    {
      key: "stockTransfers",
      name: "Multi-Godown Inter-Branch Stock Transfers",
      category: "Inventory",
      description: "Transfer stock between warehouses with dispatch notes, transit tracking, and approvals.",
    },
    {
      key: "manufacturingBom",
      name: "Manufacturing BOM & Production Orders",
      category: "Manufacturing",
      description: "Bill of materials recipes, raw material consumption, yield, and labor costing.",
    },
    {
      key: "whatsAppReminders",
      name: "Meta WhatsApp Invoicing & Payment Reminders",
      category: "Communication",
      description: "Automated WhatsApp notifications with PDF invoice attachments and payment links.",
    },
    {
      key: "customThemes",
      name: "Custom Festive & Industry Invoice Themes",
      category: "Branding",
      description: "Diwali, New Year, Clean Classic, and Modern GST invoice template themes.",
    },
    {
      key: "prioritySupport",
      name: "Dedicated Account SLA & Hotline Support",
      category: "Support",
      description: "24x7 priority support hotline with guaranteed 15-minute response SLA.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Feature Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Global catalog of platform modules and their respective entitlement availability per subscription tier.
          </p>
        </div>

        <Link
          href="/superadmin/plans"
          className="flex items-center gap-2 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>Edit Plan Entitlements →</span>
        </Link>
      </div>

      {/* Feature Matrix Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FAFBFD] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-1/3">Platform Capability / Module</th>
                <th className="py-3 px-4">Category</th>
                {plans.map((p) => (
                  <th key={p.tier} className="py-3 px-3 text-center">
                    <span className="block font-semibold text-slate-900">{p.name.split(" ")[0]}</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">
                      {p.yearlyPrice > 0 ? `₹${p.yearlyPrice}/yr` : "Free"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-slate-900">
              {platformModules.map((mod) => (
                <tr key={mod.key} className="hover:bg-[#FAFBFD] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 text-xs">{mod.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">{mod.description}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {mod.category}
                    </span>
                  </td>
                  {plans.map((p) => {
                    const isEnabled = Boolean((p.entitlements as any)?.[mod.key]);
                    return (
                      <td key={p.tier} className="py-3.5 px-3 text-center">
                        {isEnabled ? (
                          <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center font-medium text-xs">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal text-sm">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
