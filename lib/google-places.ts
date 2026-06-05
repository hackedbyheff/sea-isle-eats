/**
 * Thin client for Google Places API (New).
 *  - Text Search returns place IDs (paginated).
 *  - Place Details returns the full field set we map into our schema.
 */

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_BASE = "https://places.googleapis.com/v1/places";

/** Field mask for Place Details — exactly the fields the sync maps. */
const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "nationalPhoneNumber",
  "regularOpeningHours",
  "rating",
  "priceLevel",
  "paymentOptions",
  "editorialSummary",
  "types",
].join(",");

export interface PlaceDetails {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
  regularOpeningHours?: {
    periods?: {
      open?: { day?: number; hour?: number; minute?: number };
      close?: { day?: number; hour?: number; minute?: number };
    }[];
  };
  rating?: number;
  priceLevel?: string;
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
  editorialSummary?: { text?: string };
  types?: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Text Search across all pages. Returns deduped place IDs.
 * `maxPages` is a safety cap.
 */
export async function searchAllPlaceIds(
  apiKey: string,
  textQuery: string,
  maxPages = 10,
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  let pages = 0;

  do {
    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,nextPageToken",
      },
      body: JSON.stringify(pageToken ? { textQuery, pageToken } : { textQuery }),
    });

    if (!res.ok) {
      throw new Error(`Places text search failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      places?: { id: string }[];
      nextPageToken?: string;
    };
    for (const p of data.places ?? []) if (p.id) ids.push(p.id);

    pageToken = data.nextPageToken;
    pages++;
    if (pageToken && pages < maxPages) await sleep(1500); // token settle
  } while (pageToken && pages < maxPages);

  return Array.from(new Set(ids));
}

export async function getPlaceDetails(
  apiKey: string,
  placeId: string,
): Promise<PlaceDetails> {
  const res = await fetch(`${DETAILS_BASE}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  });
  if (!res.ok) {
    throw new Error(`Place details failed for ${placeId}: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as PlaceDetails;
}
