import type { MetadataRoute } from "next";
import { CATEGORIES, REGIONS, VENDORS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/budzet`, lastModified: now, priority: 0.6 },
  ];
  for (const r of REGIONS) urls.push({ url: `${SITE_URL}/${r.id}`, lastModified: now, priority: 0.8 });
  for (const c of CATEGORIES) urls.push({ url: `${SITE_URL}/${c.slug}`, lastModified: now, priority: 0.7 });
  for (const r of REGIONS)
    for (const c of CATEGORIES)
      urls.push({ url: `${SITE_URL}/${r.id}/${c.slug}`, lastModified: now, priority: 0.5 });
  for (const v of VENDORS)
    urls.push({ url: `${SITE_URL}/pruzatelj/${v.slug}`, lastModified: now, priority: 0.6 });
  return urls;
}
