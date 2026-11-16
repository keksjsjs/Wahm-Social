import "server-only";
import { redirect } from "next/navigation";
import { adminBase, adminHref } from "./path";
import { isAdmin } from "./session";
import { getSettings } from "../site/store";

/** Call at the top of every panel page (the layout checks too — defence in depth). */
export async function guardPage() {
  if (!(await isAdmin())) redirect(adminHref("login"));
  const settings = await getSettings();
  return { base: adminBase(), settings };
}
