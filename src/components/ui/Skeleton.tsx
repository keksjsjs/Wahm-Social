import { cx } from "./cx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}
