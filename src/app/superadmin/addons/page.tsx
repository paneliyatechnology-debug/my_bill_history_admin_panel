"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

interface AddonItem {
  id: string;
  name: string;
  nameGujarati: string;
  code: string;
  category: string;
  description: string;
  price: number;
  billingCycle: string;
  quotaAdded: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

export default function AddonsManagementPage() {
  const { setActionSuccess, setActionError } = useSuperAdmin();
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCategory, setFormCategory] = useState("INFRASTRUCTURE");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState(999);
  const [formCycle, setFormCycle] = useState("YEARLY");
  const [formQuota, setFormQuota] = useState(1);
  const [formUnit, setFormUnit] = useState("Unit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get("/super-admin/addons");
      setAddons(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Failed to load addons", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setIsSubmitting(true);
      await apiClient.post("/super-admin/addons", {
        name: formName.trim(),
        code: formCode.trim().toUpperCase() || `ADDON_${Date.now()}`,
        category: formCategory,
        description: formDescription,
        price: Number(formPrice),
        billingCycle: formCycle,
        quotaAdded: Number(formQuota),
        unit: formUnit,
      });

      setActionSuccess(`Add-on pack "${formName}" created.`);
      setIsCreateOpen(false);
      setFormName("");
      setFormCode("");
      setFormDescription("");
      fetchAddons();
    } catch (err: any) {
      setActionError(err?.message || "Failed to create add-on pack.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAddon = async (addon: AddonItem) => {
    try {
      await apiClient.patch(`/super-admin/addons/${addon.id}`, {
        isActive: !addon.isActive,
      });
      setActionSuccess(`Add-on ${addon.name} status updated.`);
      fetchAddons();
    } catch (err: any) {
      setActionError(err?.message || "Failed to toggle add-on.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add-ons & Quota Packs</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Configure standalone resource capacity packs (staff seats, godowns, WhatsApp SMS, NIC e-Invoice credits).
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Add-on Pack</span>
        </button>
      </div>

      {/* Grid of Add-ons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {addons.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E5E7EB] hover:border-[#1677E8]/60 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1677E8] border border-blue-200">
                  {item.category}
                </span>
                <button
                  onClick={() => handleToggleAddon(item)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                    item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.isActive ? "Active" : "Disabled"}
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Quota Added</span>
                  <span className="font-semibold tabular-nums text-slate-900">+{item.quotaAdded} {item.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Price / Cycle</span>
                  <span className="font-bold tabular-nums text-[#1677E8] text-sm">
                    ₹{item.price.toLocaleString("en-IN")}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">/{item.billingCycle.toLowerCase()}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAddon}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Add-on Pack</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Add-on Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 5 Additional Staff Users Pack"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Increases staff account limit by 5 members"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle</label>
                  <select
                    value={formCycle}
                    onChange={(e) => setFormCycle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="YEARLY">Yearly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ONE_TIME">One-Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quota Added</label>
                  <input
                    type="number"
                    min={1}
                    value={formQuota}
                    onChange={(e) => setFormQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="e.g. Users, Branches, SMS"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Create Add-on"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
