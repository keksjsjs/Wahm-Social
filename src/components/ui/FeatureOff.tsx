import { DISABLED_MSG, type Feature } from "@/lib/site/flags";
import { EmptyState } from "./EmptyState";

/** Shown in place of a section the admin switched off. */
export function FeatureOff({ feature }: { feature: Feature }) {
  const [ar, en] = DISABLED_MSG[feature].split(/(?<=\.)\s(?=[A-Z])/);
  return <EmptyState icon="⏸" title={ar ?? DISABLED_MSG[feature]} desc={en} />;
}
