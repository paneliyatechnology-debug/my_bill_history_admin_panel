"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

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
          <p className="text-xs text-slate-500 mt-1">
            Audit payment gateway settlements, online checkouts, and customer invoice receipts.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
        >
          <svg className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Total Captured</p>
          <p className="text-xl font-semibold text-emerald-600 mt-1">{formatCurrency(metrics.totalCaptured)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Pending Orders</p>
          <p className="text-xl font-semibold text-amber-600 mt-1">{formatCurrency(metrics.totalPending)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Refunds Settled</p>
          <p className="text-xl font-semibold text-rose-600 mt-1">{formatCurrency(metrics.totalRefunded)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Net Platform Revenue</p>
          <p className="text-xl font-semibold text-[#1677E8] mt-1">{formatCurrency(metrics.netSettled)}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID or receipt #..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1677E8] outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="captured">Captured (Success)</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total <span className="font-semibold text-slate-900">{transactions.length}</span> transaction records
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">Receipt & Order ID</th>
                <th className="py-3 px-4 font-medium">Subscriber</th>
                <th className="py-3 px-4 font-medium">Plan & Cycle</th>
                <th className="py-3 px-4 text-right font-medium">Amount</th>
                <th className="py-3 px-4 text-center font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Date & Time</th>
                <th className="py-3 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Receipt & IDs */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 text-xs">{tx.receiptNo}</p>
                      <p className="text-[11px] text-slate-400 font-normal truncate max-w-[180px]">{tx.orderId}</p>
                      {tx.paymentId && <p className="text-[11px] text-[#1677E8] font-normal">{tx.paymentId}</p>}
                    </td>

                    {/* Subscriber */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 text-xs">{tx.organizationName}</p>
                      {tx.customerPhone && <p className="text-[11px] text-slate-400 font-normal">{tx.customerPhone}</p>}
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 text-xs">{tx.tier}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">({tx.billingCycle})</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-medium text-slate-900 text-xs">
                      {formatCurrency(tx.amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs ${
                          tx.status === "CAPTURED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : tx.status === "REFUNDED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-right text-slate-400 font-normal text-xs">
                      {formatDate(tx.paidAt || tx.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {tx.status === "CAPTURED" && (
                        <button
                          onClick={() => setRefundTarget(tx)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Process Refund</h3>
              <button onClick={() => setRefundTarget(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to refund <span className="font-bold text-slate-900">{formatCurrency(refundTarget.amount)}</span> for {refundTarget.organizationName}?
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Reason</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for audit log..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRefundTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
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
      )}
    </div>
  );
}
