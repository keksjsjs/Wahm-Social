"use client";

import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n";
import type { Platform } from "@/lib/platforms/types";
import { TabLinks } from "../ui";
import { useSite } from "../I18nProvider";

export function ProfileTabs({ platform, username, t }: { platform: Platform; username: string; t: Dict }) {
  const path = usePathname();
  const site = useSite();
  const base = `/${platform}/${username}`;
  const tabs = [
    { key: "posts", href: base, label: t.profile.tabs.posts },
    { key: "stories", href: `${base}/stories`, label: t.profile.tabs.stories },
    { key: "analytics", href: `${base}/analytics`, label: t.profile.tabs.analytics },
    { key: "followers", href: `${base}/followers`, label: t.profile.tabs.followers },
    { key: "following", href: `${base}/following`, label: t.profile.tabs.following },
  ].filter((x) =>
    x.key === "stories"
      ? site.stories
      : x.key === "followers"
        ? site.followers
        : x.key === "following"
          ? site.following
          : x.key === "analytics"
            ? site.analytics
            : true,
  );
  const active = tabs.slice(1).find((x) => path.startsWith(x.href))?.key ?? "posts";
  return <TabLinks tabs={tabs} active={active} />;
}
