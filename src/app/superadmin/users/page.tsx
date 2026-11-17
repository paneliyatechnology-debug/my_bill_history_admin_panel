"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { apiClient } from "../../../lib/api-client";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";
import SuperAdminLoading from "../loading";
import type { UserItem } from "../../../shared-types/superadmin";

function SuperAdminUsersContent() {
  const searchParams = useSearchParams();
  const { lang, setActionSuccess, setActionError, refetchStats, stats } = useSuperAdmin();

  const initialRole = searchParams.get("role") || "";
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(true);

  // Reset Password Modal
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    const qRole = searchParams.get("role");
    if (qRole !== null) {
      setUserRoleFilter(qRole);
    }
  }, [searchParams]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data: any = await apiClient.get("/super-admin/users", {
        search: userSearch,
        role: userRoleFilter,
        limit: 100,
      });
      setUsersList(data?.data || []);
    } catch (err: any) {
      console.error("Failed to load users", err);
    } finally {
      setIsLoading(false);
    }
  }, [userSearch, userRoleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle user active / inactive status
  const handleToggleUserStatus = useCallback(
    async (u: UserItem) => {
      try {
        await apiClient.patch(`/super-admin/users/${u.id}`, {
          isActive: !u.isActive,
        });
        setActionSuccess(
          lang === "gu"
            ? `વપરાશકર્તા ${u.fullName} ની સ્થિતિ બદલાઈ ગઈ છે.`
            : `User ${u.fullName} status updated.`
        );
        fetchUsers();
        refetchStats();
      } catch (err: any) {
        setActionError(err.message || "Failed to update user status");
      }
    },
    [lang, fetchUsers, refetchStats, setActionSuccess, setActionError]
  );

  // Generate random strong password
  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(pass);
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!resetPasswordUser || newPasswordVal.length < 8) return;
    setIsResettingPassword(true);
    setActionError(null);
    try {
      await apiClient.post(`/super-admin/users/${resetPasswordUser.id}/reset-password`, {
        newPassword: newPasswordVal,
      });
      setActionSuccess(
        lang === "gu"
          ? `${resetPasswordUser.fullName} માટે નવો પાસવર્ડ સફળતાપૂર્વક સેટ થઈ ગયો છે.`
          : `Password reset successfully for ${resetPasswordUser.fullName}.`
      );
      setResetPasswordUser(null);
      setNewPasswordVal("");
    } catch (err: any) {
      setActionError(err.message || "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const userColumns: ColumnDef<UserItem>[] = useMemo(
    () => [
      {
        id: "fullName",
        header: lang === "gu" ? "વપરાશકર્તા" : "USER / NAME",
        sortable: true,
        accessorKey: "fullName",
        cell: (u) => {
          const initials = (u.fullName || "User").slice(0, 2).toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {initials}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  {u.fullName || "Unnamed User"}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {u.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: lang === "gu" ? "ફોન / ઓળખકર્તા" : "PHONE / IDENTIFIER",
        sortable: true,
        accessorKey: "phone",
        className: "font-mono font-bold text-slate-800 text-xs",
      },
      {
        id: "email",
        header: lang === "gu" ? "ઈમેલ એડ્રેસ" : "EMAIL ADDRESS",
        sortable: true,
        accessorKey: "email",
        cell: (u) => (
          <span className="font-mono text-slate-600 text-xs">
            {u.email || <span className="text-slate-300 font-sans font-normal">—</span>}
          </span>
        ),
      },
      {
        id: "role",
        header: lang === "gu" ? "ભૂમિકા" : "SECURITY ROLE",
        sortable: true,
        accessorKey: "role",
        cell: (u) => {
          const role = u.role || "";
          let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
          if (role === "SUPER_ADMIN") {
            badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
          } else if (role === "COMPANY_ADMIN") {
            badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
          } else if (role === "BRANCH_MANAGER" || role === "ACCOUNTANT") {
            badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
          }

          return (
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase font-mono border shadow-2xs ${badgeColor}`}>
              {role}
            </span>
          );
        },
      },
      {
        id: "organization",
        header: lang === "gu" ? "સંસ્થા" : "ORGANIZATION",
        sortable: true,
        accessorFn: (u) =>
          u.organization?.name ||
          (u.role === "SUPER_ADMIN"
            ? lang === "gu"
              ? "પ્લેટફોર્મ સુપર એડમિન"
              : "Platform SuperAdmin"
            : "—"),
        cell: (u) => (
          <div className="text-slate-700 text-xs font-medium truncate max-w-[180px]">
            {u.organization?.name || (u.role === "SUPER_ADMIN" ? "Platform SuperAdmin" : "—")}
          </div>
        ),
      },
      {
        id: "status",
        header: lang === "gu" ? "સ્થિતિ" : "STATUS",
        sortable: true,
        accessorFn: (u) => (u.isActive ? "Active" : "Inactive"),
        cell: (u) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleUserStatus(u);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
              u.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
            title="Click to toggle status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span>{u.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "નિષ્ક્રિય" : "Inactive")}</span>
          </button>
        ),
      },
      {
        id: "actions",
        header: lang === "gu" ? "ક્રિયાઓ" : "ACTIONS",
        headerClassName: "text-right",
        className: "text-right whitespace-nowrap",
        cell: (u) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setResetPasswordUser(u);
                setNewPasswordVal("");
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
            >
              <span>🔑</span>
              <span>{lang === "gu" ? "પાસવર્ડ રીસેટ" : "Reset Password"}</span>
            </button>
          </div>
        ),
      },
    ],
    [lang, handleToggleUserStatus]
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
                Identity & Access Management (IAM)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {stats?.users?.active || 0} Active Staff
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === "gu" ? "વપરાશકર્તાઓ અને પરવાનગીઓ" : "Platform Users & Security Roles"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {lang === "gu"
                ? "એડમિનિસ્ટ્રેટર્સ, એકાઉન્ટન્ટ્સ, બ્રાન્ચ મેનેજર્સ અને ક્રેડેન્શિયલ મેનેજમેન્ટ."
                : "Manage multi-tenant administrators, accountants, branch managers, and secure authentication credentials."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Total Staff Accounts
            </span>
            <span className="text-lg font-black font-mono text-purple-300">
              {stats?.users?.total || 0} Users
            </span>
          </div>
        </div>
      </div>

      <DataTable<UserItem>
        data={usersList}
        columns={userColumns}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        searchPlaceholder={
          lang === "gu"
            ? "નામ, ફોન અથવા ઈમેલ શોધો..."
            : "Search user name, phone, email..."
        }
        searchKeys={["fullName", "phone", "email", "role"]}
        customSearchFn={(u, query) => {
          const s = query.toLowerCase();
          return Boolean(
            u.fullName?.toLowerCase().includes(s) ||
              u.phone?.toLowerCase().includes(s) ||
              (u.email && u.email.toLowerCase().includes(s)) ||
              u.role?.toLowerCase().includes(s) ||
              (u.organization?.name && u.organization.name.toLowerCase().includes(s))
          );
        }}
        lang={lang}
        themeColor="purple"
        exportable
        exportFileName="platform_users"
        filtersSlot={
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs cursor-pointer"
          >
            <option value="">{lang === "gu" ? "તમામ ભૂમિકાઓ (All Roles)" : "All User Roles"}</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="COMPANY_ADMIN">Company Admin</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="BRANCH_MANAGER">Branch Manager</option>
            <option value="CASHIER">Cashier</option>
            <option value="AUDITOR">Auditor</option>
          </select>
        }
      />

      {/* ===================== MODAL: RESET USER PASSWORD ===================== */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setResetPasswordUser(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 space-y-5 text-slate-800 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🔑</span>
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-4">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-purple-600 font-bold block mb-0.5">Account Target:</span>
                <span className="font-bold text-slate-900 text-sm block">{resetPasswordUser.fullName}</span>
                <span className="text-[11px] text-slate-500 font-mono">{resetPasswordUser.phone} • {resetPasswordUser.role}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-800 font-bold block">
                    New Password (min 8 chars):
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
                  >
                    🎲 Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter or generate new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResettingPassword || newPasswordVal.length < 8}
                onClick={handleResetPassword}
                className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isResettingPassword ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminUsersPage() {
  return (
    <Suspense fallback={<SuperAdminLoading />}>
      <SuperAdminUsersContent />
    </Suspense>
  );
}
