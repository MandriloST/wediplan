import type { Metadata } from "next";
import MapPageShell from "@/components/MapPageShell";

export const metadata: Metadata = { title: "Karta — Wediplan" };

export default function MapPage() {
  return <MapPageShell />;
}
