"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { REGIONS } from "@/lib/data";
import type { RegionId } from "@/lib/types";
import type { Suggestion } from "@/lib/search";
import { useWeddingDate } from "@/stores";

interface Props {
  initialQ?: string;
  initialRegion?: RegionId;
}

export default function SearchBar({ initialQ = "", initialRegion }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [region, setRegion] = useState<string>(initialRegion ?? "");
  const { date, setDate } = useWeddingDate();
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery<Suggestion[]>({
    queryKey: ["suggest", q],
    queryFn: () => fetch(`/api/suggest?q=${encodeURIComponent(q)}`).then((r) => r.json()),
    enabled: focused && q.trim().length >= 2,
  });

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function submit() {
    const path = region ? `/${region}` : "/";
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    router.push(sp.size ? `${path}?${sp}` : path);
    setFocused(false);
  }

  const showSuggest = focused && q.trim().length >= 2 && (suggestions?.length ?? 0) > 0;

  return (
    <div className="searchbar" ref={wrapRef}>
      <div className="field">
        <label htmlFor="search-q">Što tražite?</label>
        <input
          id="search-q"
          placeholder="fotograf, dvorana, bend…"
          value={q}
          autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {showSuggest && (
          <div className="suggest" role="listbox">
            {suggestions!.map((s, i) => (
              <button
                key={i}
                role="option"
                aria-selected={false}
                onClick={() => {
                  setFocused(false);
                  router.push(s.href);
                }}
              >
                <span>{s.label}</span>
                <span className="sub">{s.sub}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="field">
        <label htmlFor="search-region">Regija</label>
        <select id="search-region" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Cijela Hrvatska</option>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="search-date">Datum (opcionalno)</label>
        <input
          id="search-date"
          type="date"
          value={date ?? ""}
          onChange={(e) => setDate(e.target.value || null)}
        />
      </div>
      <button className="submit" onClick={submit}>
        Traži
      </button>
    </div>
  );
}
