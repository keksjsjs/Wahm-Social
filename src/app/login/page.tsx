import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { buildMetadata } from "@/lib/seo";
import { currentUser } from "@/lib/server/auth";

export const metadata = buildMetadata({ title: "login | Frostly", path: "/login", noindex: true });
export const dynamic = "force-dynamic";

export default async function Page() {
  if (await currentUser()) redirect("/account");
  return (
    <div className="container-w py-16">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
