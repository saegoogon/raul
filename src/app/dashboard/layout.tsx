import { DashboardShell } from "@/components/DashboardShell";
import { getProfile, requireUser } from "@/lib/links-server";

export const metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { user } = await requireUser();
  const profile = await getProfile();
  return (
    <DashboardShell username={profile.username} email={user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
