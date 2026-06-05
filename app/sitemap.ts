import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getPublishedRestaurants } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { restaurants } = await getPublishedRestaurants();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...restaurants.map((r) => ({
      url: `${SITE_URL}/r/${r.id}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
