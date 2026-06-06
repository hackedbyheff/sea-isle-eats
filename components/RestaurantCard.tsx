import Link from "next/link";
import { Phone, Clock, CreditCard, Banknote, ShoppingBag, Star } from "lucide-react";
import type { Restaurant } from "@/lib/types";
import { priceLabel } from "@/lib/format";
import { isOpenNow, todayHoursLabel, type NowInET } from "@/lib/hours";
import { Badge } from "./Badge";

export function RestaurantCard({
  restaurant: r,
  now,
}: {
  restaurant: Restaurant;
  now: NowInET | null;
}) {
  const price = priceLabel(r.price_level);
  const open = now ? isOpenNow(r.hours, now) : null;
  const hoursLabel = now ? todayHoursLabel(r.hours, now.day) : null;

  return (
    <article
      className={`relative rounded-2xl bg-white p-5 border transition-shadow hover:shadow-lg ${
        r.featured ? "border-coral ring-1 ring-coral/30" : "border-ink/10"
      }`}
    >
      {r.featured && (
        <div className="absolute -top-2.5 left-5">
          <Badge tone="coral">Featured</Badge>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold leading-tight">
            <Link href={`/r/${r.id}`} className="hover:text-coral focus:text-coral outline-none">
              {r.name}
            </Link>
          </h3>
          <div className="mt-1 text-sm text-ink/55">
            {[r.cuisine, price].filter(Boolean).join(" · ")}
          </div>
        </div>
        {r.rating != null && (
          <div className="flex items-center gap-1 text-coral font-semibold text-sm shrink-0">
            <Star size={15} fill="currentColor" /> {r.rating}
          </div>
        )}
      </div>

      {r.description && (
        <p className="mt-2 text-ink/75 text-[15px] font-light">{r.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5 items-center text-sm">
        <span
          className={`inline-flex items-center gap-1 font-medium ${
            open ? "text-teal" : "text-ink/40"
          }`}
        >
          <Clock size={14} />
          {open === null
            ? hoursLabel ?? "Hours"
            : `${open ? "Open" : "Closed"}${hoursLabel ? ` · ${hoursLabel}` : ""}`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {r.accepts_cards === true && (
          <Badge tone="sand">
            <CreditCard size={12} /> Cards
          </Badge>
        )}
        {r.accepts_cash && (
          <Badge tone="sand">
            <Banknote size={12} /> Cash
          </Badge>
        )}
        {r.accepts_cards === false && <Badge tone="muted">Cash only</Badge>}
        {r.online_ordering ? (
          r.order_url ? (
            <a
              href={r.order_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-[filter] hover:brightness-110"
              title="Order online"
            >
              <Badge tone="ink">
                <ShoppingBag size={12} /> Order online →
              </Badge>
            </a>
          ) : (
            <Badge tone="ink">
              <ShoppingBag size={12} /> Order online
            </Badge>
          )
        ) : (
          <Badge tone="muted">No online ordering</Badge>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-3">
        {r.phone && (
          <a
            href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-coral"
          >
            <Phone size={14} /> {r.phone}
          </a>
        )}
        {r.menu_url ? (
          <a
            href={r.menu_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm font-semibold text-coral hover:underline"
          >
            View menu →
          </a>
        ) : (
          <Link
            href={`/r/${r.id}`}
            className="ml-auto text-sm font-semibold text-coral hover:underline"
          >
            Details →
          </Link>
        )}
      </div>
    </article>
  );
}
