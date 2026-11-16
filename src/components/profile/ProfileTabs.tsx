"use client";

import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n";
import type { Platform } from "@/lib/platforms/types";
import { TabLinks } from "../ui";

export function ProfileTabs({ platform, username, t }: { platform: Platform; username: string; t: Dict }) {
  const path = usePathname();
  const base = `/${platform}/${username}`;
  const tabs = [
    { key: "posts", href: base, label: t.profile.tabs.posts },
    { key: "stories", href: `${base}/stories`, label: t.profile.tabs.stories },
    { key: "analytics", href: `${base}/analytics`, label: t.profile.tabs.analytics },
    { key: "followers", href: `${base}/followers`, label: t.profile.tabs.followers },
    { key: "following", href: `${base}/following`, label: t.profile.tabs.following },
  ];
  const active = tabs.slice(1).find((x) => path.startsWith(x.href))?.key ?? "posts";
  return <TabLinks tabs={tabs} active={active} />;
}
