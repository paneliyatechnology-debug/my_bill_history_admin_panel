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
  const { lang, setActionSuccess, setActionError, refetchStats } = useSuperAdmin();

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
        header: lang === "gu" ? "પૂરું નામ" : "Full Name",
        sortable: true,
        accessorKey: "fullName",
        className: "font-bold text-[#202124]",
      },
      {
        id: "phone",
        header: lang === "gu" ? "ફોન / ઓળખકર્તા" : "Phone / Identifier",
        sortable: true,
        accessorKey: "phone",
        className: "font-mono",
      },
      {
        id: "email",
        header: lang === "gu" ? "ઈમેલ એડ્રેસ" : "Email Address",
        sortable: true,
        accessorKey: "email",
        className: "font-mono text-[#667085]",
        cell: (u) => u.email || <span className="text-slate-300 font-sans">—</span>,
      },
      {
        id: "role",
        header: lang === "gu" ? "ભૂમિકા" : "Role",
        sortable: true,
        accessorKey: "role",
        cell: (u) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              u.role === "SUPER_ADMIN"
                ? "bg-purple-100 text-purple-800 border border-purple-300"
                : u.role === "COMPANY_ADMIN"
                  ? "bg-orange-100 text-orange-800 border border-orange-300"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {u.role}
          </span>
        ),
      },
      {
        id: "organization",
        header: lang === "gu" ? "સંસ્થા" : "Organization",
        sortable: true,
        accessorFn: (u) =>
          u.organization?.name ||
          (u.role === "SUPER_ADMIN"
            ? lang === "gu"
              ? "પ્લેટફોર્મ સુપર એડમિન"
              : "Platform SuperAdmin"
            : "—"),
        className: "text-[#667085]",
      },
      {
        id: "status",
        header: lang === "gu" ? "સ્થિતિ" : "Status",
        sortable: true,
        accessorFn: (u) => (u.isActive ? "Active" : "Inactive"),
        cell: (u) => (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              u.isActive
                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                : "text-rose-700 bg-rose-50 border border-rose-200"
            }`}
          >
            {u.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "નિષ્ક્રિય" : "Inactive")}
          </span>
        ),
      },
      {
        id: "actions",
        header: lang === "gu" ? "ક્રિયાઓ" : "Actions",
        headerClassName: "text-right",
        className: "text-right whitespace-nowrap",
        cell: (u) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setResetPasswordUser(u);
                setNewPasswordVal("");
              }}
              className="px-2.5 py-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] rounded-md text-[11px] font-bold transition-all cursor-pointer"
            >
              {lang === "gu" ? "પાસવર્ડ રીસેટ" : "Reset Password"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleUserStatus(u);
              }}
              className="px-2.5 py-1 bg-white hover:bg-[#F8F9FB] text-[#667085] hover:text-[#202124] border border-[#E5E7EB] rounded-md text-[11px] font-semibold cursor-pointer"
            >
              {u.isActive ? (lang === "gu" ? "નિષ્ક્રિય કરો" : "Deactivate") : (lang === "gu" ? "સક્રિય કરો" : "Activate")}
            </button>
          </div>
        ),
      },
    ],
    [lang, handleToggleUserStatus]
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-[#202124] tracking-tight">
          {lang === "gu" ? "વપરાશકર્તાઓ અને પરવાનગીઓ" : "Platform Users & Security Roles"}
        </h1>
        <p className="text-xs text-[#667085] mt-0.5">
          {lang === "gu"
            ? "એડમિનિસ્ટ્રેટર્સ, એકાઉન્ટન્ટ્સ, બ્રાન્ચ મેનેજર્સ અને ક્રેડેન્શિયલ મેનેજમેન્ટ."
            : "Manage administrators, accountants, branch managers, and reset credentials."}
        </p>
      </div>

      <DataTable<UserItem>
        data={usersList}
        columns={userColumns}
        keyExtractor={(u) => u.id}
        searchPlaceholder={
          lang === "gu"
            ? "નામ, ફોન અથવા ઈમેલ શોધો..."
            : "Search user name, phone, email..."
        }
        searchKeys={["fullName", "phone", "email", "role"]}
        customSearchFn={(u, query) => {
          const s = query.toLowerCase();
          return Boolean(
            u.fullName.toLowerCase().includes(s) ||
              u.phone.toLowerCase().includes(s) ||
              (u.email && u.email.toLowerCase().includes(s)) ||
              u.role.toLowerCase().includes(s) ||
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
            className="bg-[#F8F9FB] border border-[#E5E7EB] text-xs font-semibold rounded-xl px-3 py-1.5 text-[#202124] focus:outline-none focus:bg-white cursor-pointer"
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setResetPasswordUser(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-[#D1D5DB] rounded-2xl w-full max-w-sm p-6 space-y-4 text-[#202124] shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#202124]">Reset User Password</h3>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="text-[#98A2B3] hover:text-[#202124] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-[#667085] block">User:</span>
                <span className="font-bold text-[#202124]">{resetPasswordUser.fullName}</span>
                <span className="block text-[11px] text-[#98A2B3] font-mono">{resetPasswordUser.phone}</span>
              </div>

              <div>
                <label className="text-[#202124] font-bold block mb-1">
                  New Password (min 8 characters):
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full px-3 py-2 bg-[#F8F9FB] border border-[#E5E7EB] rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-[#667085] hover:text-[#202124] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResettingPassword || newPasswordVal.length < 8}
                onClick={handleResetPassword}
                className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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
