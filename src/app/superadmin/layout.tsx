import type { Metadata } from "next";
import { SuperAdminProvider } from "../../context/superadmin-context";
import { SuperAdminShell } from "../../components/superadmin/superadmin-shell";

export const metadata: Metadata = {
  title: "SuperAdmin Console — myownbillbook ERP",
  description: "Enterprise management and observability platform for myownbillbook",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminProvider>
      <SuperAdminShell>{children}</SuperAdminShell>
    </SuperAdminProvider>
  );
}

