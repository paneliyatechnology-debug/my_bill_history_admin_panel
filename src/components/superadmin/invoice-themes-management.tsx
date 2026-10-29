"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../lib/api-client";

export interface InvoiceThemeItem {
  id: string;
  name: string;
  category: "festive" | "standard" | "branding";
  festivalName?: string;
  description?: string;
  primaryColor: string;
  badge?: string | null;
  thumbnail: string;
  variants: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceThemesManagementProps {
  lang?: "en" | "gu";
}

export function InvoiceThemesManagement({ lang = "en" }: InvoiceThemesManagementProps) {
  const [themes, setThemes] = useState<InvoiceThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "festive" | "standard">("all");
  const [banner, setBanner] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<InvoiceThemeItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    category: "festive" | "standard" | "branding";
    festivalName: string;
    description: string;
    primaryColor: string;
    badge: string;
    thumbnail: string;
    variant1: string;
    variant2: string;
    isActive: boolean;
    sortOrder: number;
  }>({
    name: "",
    category: "festive",
    festivalName: "",
    description: "",
    primaryColor: "#F97316",
    badge: "FESTIVE",
    thumbnail: "/themes/navaratri_1.jpg",
    variant1: "/themes/navaratri_1.jpg",
    variant2: "",
    isActive: true,
    sortOrder: 1,
  });

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiClient.get("/invoice-settings/superadmin/themes");
      if (Array.isArray(res)) {
        setThemes(res);
      } else if (res?.managedThemes && Array.isArray(res.managedThemes)) {
        setThemes(res.managedThemes);
      } else {
        setThemes([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load invoice themes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleOpenAdd = () => {
    setEditingTheme(null);
    setFormData({
      name: "",
      category: "festive",
      festivalName: "",
      description: "",
      primaryColor: "#F97316",
      badge: "FESTIVE",
      thumbnail: "/themes/navaratri_1.jpg",
      variant1: "/themes/navaratri_1.jpg",
      variant2: "",
      isActive: true,
      sortOrder: themes.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (theme: InvoiceThemeItem) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      category: theme.category,
      festivalName: theme.festivalName || "",
      description: theme.description || "",
      primaryColor: theme.primaryColor || "#F97316",
      badge: theme.badge || "",
      thumbnail: theme.thumbnail || "",
      variant1: theme.variants[0] || "",
      variant2: theme.variants[1] || "",
      isActive: theme.isActive,
      sortOrder: theme.sortOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (theme: InvoiceThemeItem) => {
    try {
      const nextActive = !theme.isActive;
      await apiClient.put(`/invoice-settings/superadmin/themes/${theme.id}`, {
        isActive: nextActive,
      });
      setThemes((prev) =>
        prev.map((t) => (t.id === theme.id ? { ...t, isActive: nextActive } : t))
      );
      setBanner(`Theme "${theme.name}" ${nextActive ? "activated" : "deactivated"}.`);
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to toggle status: " + err?.message);
    }
  };

  const handleDelete = async (theme: InvoiceThemeItem) => {
    if (!confirm(`Are you sure you want to delete theme "${theme.name}"?`)) return;
    try {
      await apiClient.delete(`/invoice-settings/superadmin/themes/${theme.id}`);
      setThemes((prev) => prev.filter((t) => t.id !== theme.id));
      setBanner(`Theme "${theme.name}" deleted.`);
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to delete theme: " + err?.message);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Restore default festive themes (Navaratri, Durga Puja, Dussehra, Dhanteras, Diwali)?")) return;
    try {
      setLoading(true);
      const res: any = await apiClient.post("/invoice-settings/superadmin/themes/reset");
      if (Array.isArray(res)) {
        setThemes(res);
      } else {
        await fetchThemes();
      }
      setBanner("Default themes successfully restored!");
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to reset themes: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a theme name");
      return;
    }

    const variants: string[] = [];
    if (formData.variant1.trim()) variants.push(formData.variant1.trim());
    if (formData.variant2.trim()) variants.push(formData.variant2.trim());

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      festivalName: formData.festivalName.trim() || formData.name.trim(),
      description: formData.description.trim(),
      primaryColor: formData.primaryColor,
      badge: formData.badge.trim() || null,
      thumbnail: formData.thumbnail.trim() || variants[0] || "/themes/navaratri_1.jpg",
      variants: variants.length > 0 ? variants : ["/themes/navaratri_1.jpg"],
      isActive: formData.isActive,
      sortOrder: Number(formData.sortOrder) || 1,
    };

    try {
      if (editingTheme) {
        const updated: any = await apiClient.put(
          `/invoice-settings/superadmin/themes/${editingTheme.id}`,
          payload
        );
        setThemes((prev) =>
          prev.map((t) => (t.id === editingTheme.id ? { ...t, ...updated } : t))
        );
        setBanner(`Theme "${payload.name}" updated successfully!`);
      } else {
        const created: any = await apiClient.post("/invoice-settings/superadmin/themes", payload);
        setThemes((prev) => [...prev, created]);
        setBanner(`Theme "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to save theme: " + err?.message);
    }
  };

  const filteredThemes = themes.filter((t) => {
    if (activeTab === "festive") return t.category === "festive" || t.category === "branding";
    if (activeTab === "standard") return t.category === "standard";
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Notice */}
      {banner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === "gu" ? "ઇન્વૉઇસ થીમ સ્ટોર મેનેજમેન્ટ" : "Invoice Themes & Festive Store"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {lang === "gu"
              ? "તહેવારોની સ્પેશિયલ બેકગ્રાઉન્ડ ઇમેજીસ, રંગો અને થીમ્સ સુપર એડમિનથી લાઇવ મેનેજ કરો. અહીંથી કરેલા ફેરફારો બધા યુઝર્સના ઇન્વૉઇસ સેટિંગ્સમાં તરત જ દેખાશે."
              : "Manage seasonal festival backgrounds, letterhead stationery artwork, and GST invoice themes in real-time. Changes configured here instantly appear in all tenants' invoice live preview studios."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="py-2.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Restore default festive themes (Navaratri, Durga Puja, Dussehra, Dhanteras, Diwali)"
          >
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{lang === "gu" ? "ડિફોલ્ટ પુનઃસ્થાપિત કરો" : "Reset Defaults"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-sm">+</span>
            <span>{lang === "gu" ? "નવી થીમ ઉમેરો" : "Add New Theme"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Themes", count: themes.length },
            { id: "festive", label: "Festive & Seasonal", count: themes.filter((t) => t.category === "festive" || t.category === "branding").length },
            { id: "standard", label: "Standard GST Themes", count: themes.filter((t) => t.category === "standard").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#7C3AED] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={fetchThemes}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <span>↻ Refresh</span>
        </button>
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-medium">
          Loading invoice themes catalogue...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-xs text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
          {error}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">
          No themes found under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredThemes.map((theme) => {
            const hasMultipleVariants = theme.variants.length > 1;
            return (
              <div
                key={theme.id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-3.5 shadow-xs transition-all hover:shadow-md ${
                  theme.isActive ? "border-slate-200" : "border-slate-200 bg-slate-50/60 opacity-65"
                }`}
              >
                {/* Badge on top right */}
                {theme.badge && (
                  <span className="absolute top-2.5 right-2.5 z-10 rounded-full bg-[#7C3AED] px-2 py-0.5 text-[8.5px] font-black uppercase text-white shadow-xs">
                    {theme.badge}
                  </span>
                )}

                {/* Preview Thumbnail Box */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-100 bg-[#FAF8F5] shadow-2xs">
                  {theme.thumbnail ? (
                    <img
                      src={theme.thumbnail}
                      alt={theme.name}
                      className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 text-xs font-semibold">
                      Standard Layout
                    </div>
                  )}

                  {/* Primary Color Indicator */}
                  <div
                    className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 shadow-2xs backdrop-blur-xs text-[10px] font-bold text-slate-800"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span>{theme.primaryColor}</span>
                  </div>

                  {hasMultipleVariants && (
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                      {theme.variants.length} Variants
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors truncate">
                        {theme.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {theme.category}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 leading-tight">
                      {theme.description || "Invoice stationery background template"}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    {/* Active/Inactive Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(theme)}
                      className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                        theme.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {theme.isActive ? "● Active" : "○ Inactive"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(theme)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(theme)}
                        className="rounded-lg border border-rose-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 shadow-2xs"
                        title="Delete theme"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Theme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingTheme ? "Edit Invoice Theme" : "Add New Invoice Theme"}
                </h3>
                <p className="text-xs text-slate-500">
                  Upload or configure background artwork images for the live invoice studio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Theme Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Holi Special, Diwali 2026"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Festival / Tag Name</label>
                  <input
                    type="text"
                    value={formData.festivalName}
                    onChange={(e) => setFormData({ ...formData, festivalName: e.target.value })}
                    placeholder="e.g. Navaratri, Diwali"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-[#7C3AED] focus:outline-none"
                  >
                    <option value="festive">Festive / Seasonal</option>
                    <option value="standard">Standard GST</option>
                    <option value="branding">Custom Branding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. NEW, FESTIVE"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-2 py-1.5 font-mono text-xs focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Variant 1 Background Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.variant1}
                  onChange={(e) => setFormData({ ...formData, variant1: e.target.value, thumbnail: formData.thumbnail || e.target.value })}
                  placeholder="/themes/navaratri_1.jpg or https://..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                />
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Full sheet letterhead stationery background artwork. Available presets: /themes/navaratri_1.jpg, /themes/navaratri_2.jpg, /themes/durga_puja_1.jpg, /themes/dussehra_1.jpg, /themes/dhanteras_1.jpg, /themes/diwali_1.jpg
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Variant 2 Background Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.variant2}
                  onChange={(e) => setFormData({ ...formData, variant2: e.target.value })}
                  placeholder="/themes/navaratri_2.jpg or https://..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thumbnail Preview Image URL
                </label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Defaults to Variant 1 if left empty"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of this theme..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span>Active & Visible to all users</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] px-5 py-2 font-bold text-white shadow-xs"
                >
                  {editingTheme ? "Update Theme" : "Create Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
