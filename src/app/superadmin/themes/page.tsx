"use client";

import React from "react";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { InvoiceThemesManagement } from "../../../components/superadmin/invoice-themes-management";

export default function SuperAdminThemesPage() {
  const { lang } = useSuperAdmin();

  return <InvoiceThemesManagement lang={lang} />;
}

