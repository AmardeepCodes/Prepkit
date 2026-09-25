"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../../components/AppShell";
import WeakSpotsReport from "../../../../components/kit/WeakSpotsReport";
import { kitsApi } from "../../../../lib/api/kits";
import { useRequireAuth } from "../../../../lib/hooks/useRequireAuth";

export default function WeakSpotsPage() {
  const authed = useRequireAuth();
  const { id } = useParams();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) return;
    kitsApi.get(id).then((data) => setKit(data.kit)).finally(() => setLoading(false));
  }, [authed, id]);

  if (!authed) return null;
  if (loading) {
    return (
      <AppShell active="Dashboard">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Loading...</p>
      </AppShell>
    );
  }
  if (!kit) {
    return (
      <AppShell active="Dashboard">
        <p className="font-body-sm text-body-sm text-error">Kit not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="Dashboard">
      <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant mb-space-md">
        <Link href={`/kits/${id}`} className="hover:text-primary transition-colors">
          {kit.source.company || "Kit"}
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">Weak Spots</span>
      </div>

      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
        Weak Spots Report
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
        Based on your Practice Mode confidence ratings — see what to review before Day 1.
      </p>

      <WeakSpotsReport kit={kit} />
    </AppShell>
  );
}