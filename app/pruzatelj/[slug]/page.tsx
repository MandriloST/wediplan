import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VendorProfile from "@/components/VendorProfile";
import { getProfile } from "@/lib/profile";
import { CATEGORY_BY_SLUG, REGION_BY_ID, VENDORS } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return VENDORS.map((v) => ({ slug: v.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const data = getProfile(params.slug);
  if (!data) return {};
  const { vendor } = data;
  const cat = CATEGORY_BY_SLUG[vendor.category];
  return {
    title: `${vendor.name} — ${cat.name}, ${vendor.city} | Wediplan`,
    description: `${vendor.name} (${cat.name}, ${REGION_BY_ID[vendor.region].name}) — ${formatPrice(
      vendor.price
    )}, ocjena ${vendor.rating}. Usporedite cijene i dostupnost na Wediplanu.`,
  };
}

export default function VendorPage({ params }: Props) {
  const data = getProfile(params.slug);
  if (!data) notFound();
  return <VendorProfile data={data} />;
}
