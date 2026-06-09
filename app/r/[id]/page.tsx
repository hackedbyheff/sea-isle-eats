import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Star,
  ShoppingBag,
  ExternalLink,
  ArrowLeft,
  CreditCard,
  Banknote,
  BadgeCheck,
  Globe,
  Facebook,
  Instagram,
  Utensils,
  Package,
  Car,
  Wine,
  ChefHat,
} from "lucide-react";
import { getRestaurantById } from "@/lib/data";
import { getCurrentCity } from "@/lib/cities";
import { restaurantJsonLd } from "@/lib/jsonld";
import { priceLabel, parseCuisines } from "@/lib/format";
import { SITE_LOCATION, SITE_NAME } from "@/lib/config";
import { RestaurantHours } from "@/components/RestaurantHours";
import { AdBanner } from "@/components/AdBanner";
import { OrderDirectNote } from "@/components/OrderDirectNote";
import { Badge } from "@/components/Badge";
import { SuggestChangeForm } from "@/components/SuggestChangeForm";
import { ClaimListingForm } from "@/components/ClaimListingForm";
import { Footer } from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = await getRestaurantById(id);
  if (!r) return { title: "Not found" };
  const bits = [...parseCuisines(r.cuisine), priceLabel(r.price_level)]
    .filter(Boolean)
    .join(" · ");
  const description =
    r.description ??
    `${r.name}${bits ? ` (${bits})` : ""} in ${SITE_LOCATION}. Hours, payment, and where to see the menu.`;
  const url = `/r/${r.id}`;
  return {
    title: r.name, // template appends " — Sea Isle Eats"
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${r.name} — ${SITE_NAME}`,
      description,
      url,
    },
  };
}

export default async function RestaurantDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getRestaurantById(id);
  if (!r) notFound();
  const currentCity = await getCurrentCity();

  const price = priceLabel(r.price_level);
  const meta = [...parseCuisines(r.cuisine), price].filter(Boolean).join(" · ");
  const mapsQuery = encodeURIComponent(
    r.address ? r.address : `${r.name}, ${SITE_LOCATION}`,
  );

  return (
    <div className="min-h-screen w-full bg-page text-ink">
      <script
        type="application/ld+json"
        // schema.org Restaurant structured data for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(r)) }}
      />

      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-coral"
        >
          <ArrowLeft size={16} /> All restaurants
        </Link>

        {/* Header */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-coral font-semibold tracking-[0.2em] uppercase text-xs mb-2">
              <MapPin size={13} /> {SITE_LOCATION}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[0.98]">
              {r.name}
            </h1>
            {meta && <div className="mt-2 text-ink/55">{meta}</div>}
            {r.owner_verified && (
              <div className="mt-2">
                <Badge tone="teal">
                  <BadgeCheck size={12} /> Owner-verified
                </Badge>
              </div>
            )}
          </div>
          {r.rating != null && (
            <div className="flex items-center gap-1 text-coral font-semibold shrink-0">
              <Star size={18} fill="currentColor" /> {r.rating}
            </div>
          )}
        </div>

        {r.description && (
          <p className="mt-4 text-lg text-ink/75 font-light max-w-2xl">
            {r.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {r.menu_url && (
            <a
              href={r.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 text-sm font-semibold hover:brightness-110"
            >
              <ExternalLink size={15} /> View menu
            </a>
          )}
          {r.online_ordering && r.order_url && (
            <a
              href={r.order_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110"
            >
              <ShoppingBag size={15} /> Order Online
            </a>
          )}
          {r.catering_url && (
            <a
              href={r.catering_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-teal text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110"
            >
              <ChefHat size={15} /> Order Catering
            </a>
          )}
        </div>

        {/* Find them online */}
        {(r.website_url || r.facebook_url || r.instagram_url) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {r.website_url && (
              <a
                href={r.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:border-ink/50 hover:text-coral"
              >
                <Globe size={15} /> Website
              </a>
            )}
            {r.facebook_url && (
              <a
                href={r.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:border-ink/50 hover:text-coral"
              >
                <Facebook size={15} /> Facebook
              </a>
            )}
            {r.instagram_url && (
              <a
                href={r.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:border-ink/50 hover:text-coral"
              >
                <Instagram size={15} /> Instagram
              </a>
            )}
          </div>
        )}

        <OrderDirectNote />

        {/* Payment badges */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {r.accepts_cards === true && (
            <Badge tone="sand">
              <CreditCard size={12} /> Cards
            </Badge>
          )}
          {r.accepts_cards === false && (
            <Badge tone="muted">
              <Banknote size={12} /> Cash only
            </Badge>
          )}
          {r.online_ordering ? (
            <Badge tone="ink">
              <ShoppingBag size={12} /> Order Online
            </Badge>
          ) : (
            <Badge tone="muted">No online ordering</Badge>
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
        </div>

        {/* Hours + contact */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl bg-white border border-ink/10 p-5">
            <RestaurantHours hours={r.hours} />
          </section>

          <section className="rounded-2xl bg-white border border-ink/10 p-5 space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
              Location & contact
            </h2>
            {r.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-sm text-ink hover:text-coral"
              >
                <MapPin size={16} className="mt-0.5 shrink-0" /> {r.address}
              </a>
            )}
            {r.phone && (
              <a
                href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 text-sm text-ink hover:text-coral"
              >
                <Phone size={16} /> {r.phone}
              </a>
            )}
            {r.lat != null && r.lng != null && (
              <iframe
                title={`Map showing ${r.name}`}
                loading="lazy"
                className="mt-1 w-full h-44 rounded-xl border border-ink/10"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${r.lng - 0.008}%2C${r.lat - 0.004}%2C${r.lng + 0.008}%2C${r.lat + 0.004}&layer=mapnik&marker=${r.lat}%2C${r.lng}`}
              />
            )}
          </section>
        </div>

        {/* Sponsor slot — this city's sponsors, stable per restaurant */}
        <div className="mt-8">
          <AdBanner citySlug={currentCity?.slug} seed={r.id} />
        </div>

        {/* Public forms */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <SuggestChangeForm restaurantId={r.id} />
          <ClaimListingForm restaurantId={r.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
