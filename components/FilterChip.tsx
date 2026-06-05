import type { ReactNode } from "react";

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
        active
          ? "bg-ink text-cream border-ink shadow-md"
          : "bg-transparent text-ink border-ink/25 hover:border-ink/60"
      }`}
    >
      {children}
    </button>
  );
}
