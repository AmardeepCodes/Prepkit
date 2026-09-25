"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../../../components/AppShell";
import { getMockKit } from "../../../../../lib/mockKit";

export default function PracticeSummaryPage() {
  const { id } = useParams();
  const kit = useMemo(() => getMockKit(id), [id]);

  const covered = kit.role.requirements.length - kit.coverage.uncovered_requirement_ids.length;
  const coveragePct = Math.round((covered / kit.role.requirements.length) * 100);

  return (
    <AppShell active="Practice Mode">
      <div className="max-w-2xl mx-auto w-full py-space-xl flex flex-col gap-space-lg">
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Practice Summary
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Here's how this session went — and what to review next.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">
              Requirement Coverage
            </span>
            <span className="font-headline-sm text-headline-sm text-primary">
              {covered} / {kit.role.requirements.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </div>

        {kit.coverage.uncovered_requirement_ids.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
              Still uncovered
            </h2>
            <div className="flex flex-col gap-space-sm">
              {kit.coverage.uncovered_requirement_ids.map((rid) => {
                const req = kit.role.requirements.find((r) => r.id === rid);
                if (!req) return null;
                return (
                  <div
                    key={rid}
                    className="flex items-center justify-between gap-space-sm p-space-md rounded-xl bg-error-container/40"
                  >
                    <span className="font-body-sm text-body-sm text-on-surface">
                      {req.text}
                    </span>
                    <Link
                      href={`/kits/${id}`}
                      className="font-label-sm text-label-sm text-primary font-semibold whitespace-nowrap"
                    >
                      Add question
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-space-sm">
          <Link
            href={`/kits/${id}/practice`}
            className="px-space-lg py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg shadow-sm transition-all"
          >
            Practise again
          </Link>
          <Link
            href={`/kits/${id}`}
            className="px-space-lg py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-md transition-all"
          >
            Back to kit
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
