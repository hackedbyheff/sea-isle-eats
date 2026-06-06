import { Heart } from "lucide-react";

/**
 * Mission callout shown near a restaurant's menu/order links: ordering direct
 * (or calling) keeps more money with the local kitchen than third-party apps.
 */
export function OrderDirectNote() {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-coral/30 bg-coral/[0.06] px-4 py-3">
      <Heart size={18} className="mt-0.5 shrink-0 text-coral" fill="currentColor" />
      <p className="text-sm text-ink/75">
        <span className="font-semibold text-ink">Order direct.</span> Third-party
        delivery apps can take <span className="font-semibold">as much as 30%</span>{" "}
        of an order from the restaurant. Calling or ordering on their own site keeps
        more in the local kitchen — so every link here goes straight to them, never a
        middleman.
      </p>
    </div>
  );
}
