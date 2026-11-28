"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";

interface TransactionItem {
  id: string;
  orderId: string;
  paymentId: string | null;
  receiptNo: string;
  tenantId: string | null;
  organizationId: string | null;
  organizationName: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  tier: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: "CAPTURED" | "PENDING" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
  notes: any;
}

export default function TransactionsManagementPage() {
  const { setActionSuccess, setActionError } = useSuperAdmin();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [metrics, setMetrics] = useState({ totalCaptured: 0, totalPending: 0, totalRefunded: 0, netSettled: 0 });

  // Refund Dialog
  const [refundTarget, setRefundTarget] = useState<TransactionItem | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const res: any = await apiClient.get("/super-admin/transactions", params);
      setTransactions(res?.data || []);
      if (res?.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err: any) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleProcessRefund = async () => {
    if (!refundTarget) return;
    try {
      setIsRefunding(true);
      await apiClient.post(`/super-admin/transactions/${refundTarget.id}/refund`, {
        reason: refundReason || "Requested by customer",
      });
      setActionSuccess(`Transaction ${refundTarget.orderId} successfully refunded.`);
      setRefundTarget(null);
      setRefundReason("");
      fetchTransactions();
    } catch (err: any) {
      setActionError(err?.message || "Failed to process refund.");
    } finally {
      setIsRefunding(false);
    }
  };

  const formatCurrency = (amt: number) => {
    return "₹" + amt.toLocaleString("en-IN");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions & Billing</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Audit payment gateway settlements, online checkouts, and customer invoice receipts.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#1677E8]/60 hover:bg-blue-50/40 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className={`w-4 h-4 text-[#1677E8] ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] hover:border-emerald-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Captured</p>
          <p className="text-xl font-bold tabular-nums text-[#16834A] mt-1">{formatCurrency(metrics.totalCaptured)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] hover:border-amber-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending Orders</p>
          <p className="text-xl font-bold tabular-nums text-amber-600 mt-1">{formatCurrency(metrics.totalPending)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] hover:border-rose-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Refunds Settled</p>
          <p className="text-xl font-bold tabular-nums text-rose-600 mt-1">{formatCurrency(metrics.totalRefunded)}</p>
        </div>
        <div className="bg-white border border-blue-200 bg-blue-50/40 hover:border-[#1677E8] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Net Platform Revenue</p>
          <p className="text-xl font-bold tabular-nums text-[#1677E8] mt-1">{formatCurrency(metrics.netSettled)}</p>
        </div>
      </div>

      <DataTable<TransactionItem>
        data={transactions}
        isLoading={isLoading}
        keyExtractor={(tx) => tx.id}
        searchPlaceholder="Search order ID, receipt #, organization..."
        searchKeys={["receiptNo", "orderId", "paymentId", "organizationName", "tier"]}
        themeColor="blue"
        exportable
        exportFileName="transactions"
        emptyMessage="No transactions found."
        filtersSlot={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1677E8] focus:border-[#1677E8] cursor-pointer shadow-2xs"
          >
            <option value="all">All Payment Statuses</option>
            <option value="captured">Captured (Success)</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        }
        columns={[
          {
            id: "receiptNo",
            header: "Receipt & Order ID",
            accessorKey: "receiptNo",
            sortable: true,
            cell: (tx) => (
              <div>
                <p className="font-semibold text-slate-900 text-xs tabular-nums">{tx.receiptNo}</p>
                <p className="text-[11px] text-slate-500 tabular-nums truncate max-w-[180px]">{tx.orderId}</p>
                {tx.paymentId && <p className="text-[11px] text-[#1677E8] tabular-nums">{tx.paymentId}</p>}
              </div>
            ),
          },
          {
            id: "organizationName",
            header: "Subscriber",
            accessorKey: "organizationName",
            sortable: true,
            cell: (tx) => (
              <div>
                <p className="font-semibold text-slate-900 text-xs">{tx.organizationName}</p>
                {tx.customerPhone && <p className="text-[11px] text-slate-500 tabular-nums">{tx.customerPhone}</p>}
              </div>
            ),
          },
          {
            id: "tier",
            header: "Plan & Cycle",
            accessorKey: "tier",
            sortable: true,
            cell: (tx) => (
              <div>
                <span className="font-semibold text-slate-900 text-xs">{tx.tier}</span>
                <span className="text-[10px] text-slate-500 block">({tx.billingCycle})</span>
              </div>
            ),
          },
          {
            id: "amount",
            header: "Amount",
            accessorKey: "amount",
            sortable: true,
            align: "right",
            className: "tabular-nums font-bold text-slate-900 text-xs",
            cell: (tx) => formatCurrency(tx.amount),
          },
          {
            id: "status",
            header: "Status",
            accessorKey: "status",
            sortable: true,
            align: "center",
            cell: (tx) => (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs ${
                  tx.status === "CAPTURED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : tx.status === "REFUNDED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {tx.status}
              </span>
            ),
          },
          {
            id: "createdAt",
            header: "Date & Time",
            accessorFn: (tx) => tx.paidAt || tx.createdAt,
            sortable: true,
            align: "right",
            cell: (tx) => (
              <span className="text-slate-500 text-xs whitespace-nowrap">
                {formatDate(tx.paidAt || tx.createdAt)}
              </span>
            ),
          },
          {
            id: "actions",
            header: "Action",
            align: "right",
            cell: (tx) =>
              tx.status === "CAPTURED" ? (
                <button
                  onClick={() => setRefundTarget(tx)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Refund
                </button>
              ) : (
                <span className="text-slate-300">—</span>
              ),
          },
        ] as ColumnDef<TransactionItem>[]}
      />

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-4 border-t-[#1677E8] shadow-2xl max-w-sm w-full overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-blue-50/40 via-white to-white">
              <h3 className="text-sm font-bold text-slate-900">Process Refund</h3>
              <button onClick={() => setRefundTarget(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Are you sure you want to refund <span className="font-bold tabular-nums text-slate-900">{formatCurrency(refundTarget.amount)}</span> for {refundTarget.organizationName}?
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Refund Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for audit log..."
                  className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setRefundTarget(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRefund}
                  disabled={isRefunding}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isRefunding ? "Processing..." : "Confirm Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
