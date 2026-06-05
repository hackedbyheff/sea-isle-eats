import { Check, AlertCircle, CircleDashed, type LucideIcon } from "lucide-react";
import type { ListingStatus } from "@/lib/types";

export const STATUS: Record<
  ListingStatus,
  { label: string; tone: string; bg: string; icon: LucideIcon }
> = {
  unverified: { label: "Unverified", tone: "#9A8C72", bg: "#EFE3CC", icon: CircleDashed },
  needs_call: { label: "Needs call", tone: "#E8674C", bg: "#FBE2DB", icon: AlertCircle },
  verified: { label: "Verified", tone: "#2F7A6E", bg: "#D7EBE5", icon: Check },
};

/** Queue sort order: needs-call first, then unverified, then verified. */
export const STATUS_ORDER: Record<ListingStatus, number> = {
  needs_call: 0,
  unverified: 1,
  verified: 2,
};
