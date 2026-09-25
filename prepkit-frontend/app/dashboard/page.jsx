"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import KitCard from "../../components/KitCard";
import { kitsApi } from "../../lib/api/kits";
import { useRequireAuth } from "../../lib/hooks/useRequireAuth";

const FILTERS = [
  { key: "all", label: "All Kits" },
  { key: "generating", label: "Generating" },
  { key: "ready", label: "Ready" },
  { key: "draft", label: "Draft" },
];

function toCardKit(kit) {
  const total = kit.role?.requirements?.length || 0;
  const uncovered = kit.coverage?.uncovered_requirement_ids?.length || 0;
  const coverage = total === 0 ? 0 : Math.round(((total - uncovered) / total) * 100);

  return {
    id: kit._id,
    company: kit.source?.company || "Unknown company",
    role: kit.source?.role || "Untitled role",
    status: kit.status,
    coverage,
    daysAvailable: kit.schedule?.days_available || 0,
  };
}

export default function DashboardPage() {
  const authed = useRequireAuth();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;
    kitsApi
      .list()
      .then((data) => setKits(data.kits.map(toCardKit)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authed]);

  const visibleKits = useMemo(() => {
    return kits.filter((kit) => {
      const matchesFilter = filter === "all" || kit.status === filter;
      const matchesQuery =
        query.trim() === "" ||
        `${kit.role} ${kit.company}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [kits, filter, query]);

  if (!authed) return null;

  return (
    <AppShell active="Dashboard">
      <div className="relative w-full rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-lowest p-space-lg mb-space-xl shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
            Your Kits
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
            Interview Kits
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Manage, practise and track your tailored AI interview preparation kits.
          </p>
        </div>
        <Link
          href="/kits/new"
          className="relative z-10 flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all active:scale-[0.98] w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>New Kit</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-label-lg font-label-lg transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-space-sm w-full lg:w-80 bg-surface-container-lowest px-space-md py-2.5 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-outline">search</span>
          <input
            className="bg-transparent border-none outline-none text-on-surface placeholder:text-outline font-body-sm text-body-sm w-full"
            placeholder="Search kits by role or company..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Loading your kits...</p>
      )}

      {error && (
        <p className="font-body-sm text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && visibleKits.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-space-2xl bg-surface-container-lowest rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-space-md">
            <span className="material-symbols-outlined text-[32px] text-primary">folder_open</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">No kits yet</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
            Paste a job description and a company URL to generate your first interview prep kit.
          </p>
          <Link
            href="/kits/new"
            className="mt-space-md inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Create your first kit</span>
          </Link>
        </div>
      )}

      {!loading && !error && visibleKits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg mb-space-2xl">
          {visibleKits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      )}
    </AppShell>
  );
}