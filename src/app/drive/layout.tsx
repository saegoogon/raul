import { DriveShell } from "@/components/drive/DriveShell";
import { profileName, requireDrive, usedBytes } from "@/lib/drive-server";

export const metadata = {
  title: "My Drive",
  robots: { index: false },
};

export default async function DriveLayout({ children }: LayoutProps<"/drive">) {
  await requireDrive();
  const [used, name] = await Promise.all([usedBytes(), profileName()]);
  return (
    <DriveShell used={used} name={name}>
      {children}
    </DriveShell>
  );
}
