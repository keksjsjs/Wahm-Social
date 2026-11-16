import { redirect } from "next/navigation";
import { adminHref } from "@/lib/admin/path";
import { isAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

/** Every panel page requires a valid admin session. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect(adminHref("login"));
  return <>{children}</>;
}
