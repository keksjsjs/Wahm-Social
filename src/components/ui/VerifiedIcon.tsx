import { cx } from "./cx";

export function VerifiedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("inline-block text-sky-400", className)} aria-label="verified">
      <path
        fill="currentColor"
        d="M12 1.5l2.6 2 3.3-.3 1 3.1 2.8 1.8-1 3.1 1 3.1-2.8 1.8-1 3.1-3.3-.3L12 22.5l-2.6-2-3.3.3-1-3.1-2.8-1.8 1-3.1-1-3.1 2.8-1.8 1-3.1 3.3.3z"
      />
      <path fill="#fff" d="M10.6 15.6l-3.2-3.2 1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4z" />
    </svg>
  );
}
