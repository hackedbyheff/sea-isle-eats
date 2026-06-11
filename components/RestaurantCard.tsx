import Link from "next/link";
import { Phone, Clock, CreditCard, Banknote, ShoppingBag, Star, BadgeCheck, Facebook, Instagram, Utensils, Package, Car, Wine, ChefHat, Waves } from "lucide-react";
import type { Restaurant } from "@/lib/types";
import { priceLabel, parseCuisines } from "@/lib/format";
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
      className={`group relative rounded-2xl bg-white p-5 border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        r.featured ? "border-coral ring-1 ring-coral/30" : "border-ink/10 hover:border-ink/25"
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
            {/* Stretched link: makes the whole card navigate to the detail page */}
            <Link
              href={`/r/${r.id}`}
              className="group-hover:text-coral after:absolute after:inset-0 after:content-['']"
            >
              {r.name}
            </Link>
          </h3>
          <div className="mt-1 text-sm text-ink/55">
            {[...parseCuisines(r.cuisine), price].filter(Boolean).join(" · ")}
          </div>
        </div>
        {r.rating != null && (
          <div className="flex items-center gap-1 text-coral font-semibold text-sm shrink-0">
            <Star size={15} fill="currentColor" /> {r.rating}
          </div>
        )}
      </div>

      {r.description && (
        <p className="mt-2 text-ink/75 text-[15px] font-light line-clamp-2">{r.description}</p>
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
        {r.owner_verified && (
          <Badge tone="teal">
            <BadgeCheck size={12} /> Owner-Verified
          </Badge>
        )}
        {r.accepts_cards === true && (
          <Badge tone="sand">
            <CreditCard size={12} /> Cards
          </Badge>
        )}
        {r.accepts_cards === false && (
          <Badge tone="muted">
            <Banknote size={12} /> Cash Only
          </Badge>
        )}
        {r.online_ordering && (
          <Badge tone="ink">
            <ShoppingBag size={12} /> Order Online
          </Badge>
        )}
        {r.dine_in && (
          <Badge tone="sand">
            <Utensils size={12} /> Dine In
          </Badge>
        )}
        {r.takeout && (
          <Badge tone="sand">
            <Package size={12} /> Take Out
          </Badge>
        )}
        {r.delivery && (
          <Badge tone="sand">
            <Car size={12} /> Delivery
          </Badge>
        )}
        {r.byob && (
          <Badge tone="teal">
            <Wine size={12} /> BYOB
          </Badge>
        )}
        {r.catering && (
          <Badge tone="sand">
            <ChefHat size={12} /> Catering
          </Badge>
        )}
        {r.beach_delivery && (
          <Badge tone="teal">
            <Waves size={12} /> Beach Delivery
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-3">
        {r.phone && (
          <a
            href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
            className="relative z-10 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-coral"
          >
            <Phone size={14} /> {r.phone}
          </a>
        )}
        <div className="ml-auto flex items-center gap-3">
          {r.facebook_url && (
            <a
              href={r.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="relative z-10 text-ink/40 hover:text-coral"
            >
              <Facebook size={16} />
            </a>
          )}
          {r.instagram_url && (
            <a
              href={r.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="relative z-10 text-ink/40 hover:text-coral"
            >
              <Instagram size={16} />
            </a>
          )}
          <span className="text-sm font-semibold text-coral group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </article>
  );
}
