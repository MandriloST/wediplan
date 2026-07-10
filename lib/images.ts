import type { Vendor } from "./types";
import { vendorGroup } from "./budget";

/**
 * Konvencija slika:
 *   {BASE}/vendors/<slug>/01.jpg, 02.jpg, 03.jpg   ← stvarne slike (max 3, uz dozvolu!)
 *   {BASE}/defaults/<grupa>.jpg                    ← default dok stvarne ne stignu
 *
 * BASE je danas /images (public/ u repou). Selidba na Bunny CDN = postaviti
 * NEXT_PUBLIC_IMAGE_BASE=https://wediplan.b-cdn.net s istom strukturom foldera
 * (next.config.mjs automatski dodaje remotePattern) — kod se ne mijenja.
 *
 * vendors.json polje `photos` (npr. ["01.jpg","02.jpg"]) puni import skripta
 * skeniranjem public/images/vendors/<slug>/ — vidi scripts/import-vendors.mjs
 * i `npm run sync:images`.
 */
export const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "/images";

export interface VendorImage {
  src: string;
  isDefault: boolean;
}

export function vendorImages(vendor: Vendor): VendorImage[] {
  if (vendor.photos && vendor.photos.length > 0) {
    return vendor.photos.map((file) => ({
      src: `${IMAGE_BASE}/vendors/${vendor.slug}/${file}`,
      isDefault: false,
    }));
  }
  return [{ src: `${IMAGE_BASE}/defaults/${vendorGroup(vendor)}.jpg`, isDefault: true }];
}

export function coverImage(vendor: Vendor): VendorImage {
  return vendorImages(vendor)[0];
}
