import type { ReactNode } from "react";

type Tone = "ink" | "coral" | "teal" | "sand" | "muted";

const TONES: Record<Tone, string> = {
  ink: "bg-ink text-cream",
  coral: "bg-coral text-white",
  teal: "bg-teal text-white",
  sand: "bg-sand-deep text-ink",
  muted: "bg-transparent text-ink/50 border border-ink/20",
};

export function Badge({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
