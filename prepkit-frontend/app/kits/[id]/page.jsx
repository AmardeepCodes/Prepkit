"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../components/AppShell";
import CompanyBriefSection from "../../../components/kit/CompanyBriefSection";
import RequirementsSection from "../../../components/kit/RequirementsSection";
import QuestionBankSection from "../../../components/kit/QuestionBankSection";
import FlashcardsSection from "../../../components/kit/FlashcardsSection";
import ScheduleSection from "../../../components/kit/ScheduleSection";
import { kitsApi } from "../../../lib/api/kits";
import { useRequireAuth } from "../../../lib/hooks/useRequireAuth";

const TABS = [
  { key: "brief", label: "Company Brief", icon: "domain" },
  { key: "requirements", label: "Requirements", icon: "checklist" },
  { key: "questions", label: "Question Bank", icon: "quiz" },
  { key: "flashcards", label: "Flashcards", icon: "style" },
  { key: "schedule", label: "Schedule", icon: "calendar_month" },
];

export default function KitBuilderPage() {
  const authed = useRequireAuth();
  const { id } = useParams();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("brief");
  const [saveState, setSaveState] = useState("saved");

  useEffect(() => {
    if (!authed) return;
    kitsApi
      .get(id)
      .then((data) => setKit(data.kit))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authed, id]);

  async function persist(patch) {
    setSaveState("saving");
    const next = { ...kit, ...patch };
    setKit(next);
    try {
      await kitsApi.update(id, patch);
      setSaveState("saved");
    } catch (err) {
      setError(err.message);
      setSaveState("saved");
    }
  }

  // These three call the real regenerate endpoint and replace the whole
  // kit with what the server sends back — the server already merged
  // pinned/edited items with the freshly generated ones, so we don't
  // need to hand-merge anything here.
  async function regenerateBrief() {
    const data = await kitsApi.regenerate(id, "brief");
    setKit(data.kit);
  }

  async function regenerateQuestionCategoryHandler(category) {
    const data = await kitsApi.regenerate(id, "questions", category);
    setKit(data.kit);
  }

  async function regenerateSchedule() {
    const data = await kitsApi.regenerate(id, "schedule");
    setKit(data.kit);
  }

  const uncoveredIds = useMemo(() => {
    if (!kit) return [];
    const covered = new Set(kit.questions.flatMap((q) => q.requirement_ids));
    return kit.role?.requirements
      .filter((r) => r.priority === "must" && !covered.has(r.id))
      .map((r) => r.id);
  }, [kit]);

  if (!authed) return null;
  if (loading) {
    return (
      <AppShell active="Dashboard">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Loading kit...</p>
      </AppShell>
    );
  }
  if (error || !kit) {
    return (
      <AppShell active="Dashboard">
        <p className="font-body-sm text-body-sm text-error">{error || "Kit not found."}</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="Dashboard">
      <div className="flex flex-col gap-space-md mb-space-lg">
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Kits</Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">{kit.source.company || "Untitled"}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {kit.source?.role || "Untitled role"} · Interview Kit
            </h1>
            <div className="flex items-center gap-space-xs mt-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {saveState === "saving" ? "Saving..." : "All changes saved"}
              </span>
              {kit.status === "draft" && (
                <span className="ml-space-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  Draft — research not run yet
                </span>
              )}
            </div>
          </div>

         <div className="flex items-center gap-space-sm">
            <Link
              href={`/kits/${id}/weak-spots`}
              className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Weak Spots</span>
            </Link>
            <Link
              href={`/kits/${id}/practice`}
              className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all shadow-md active:scale-[0.98] w-fit"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Practice Mode</span>
            </Link>
          </div>

        </div>
      </div>

      <div className="flex items-center gap-space-xs overflow-x-auto mb-space-lg pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-space-xs px-space-md py-2 rounded-xl font-label-lg text-label-lg whitespace-nowrap transition-all ${
              tab === t.key
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "brief" && (
        <CompanyBriefSection
          brief={kit.company_brief}
          source={kit.source}
          onChange={(company_brief) => persist({ company_brief })}
          onRegenerate={regenerateBrief}
        />
      )}
      {tab === "requirements" && (
        <RequirementsSection requirements={kit.role?.requirements} uncoveredIds={uncoveredIds} />
      )}
      {tab === "questions" && (
        <QuestionBankSection
          questions={kit.questions}
          requirements={kit.role?.requirements}
          onChange={(questions) => persist({ questions })}
          onRegenerateCategory={regenerateQuestionCategoryHandler}
        />
      )}
      {tab === "flashcards" && (
        <FlashcardsSection
          flashcards={kit.flashcards}
          onChange={(flashcards) => persist({ flashcards })}
        />
      )}
      {tab === "schedule" && (
        <ScheduleSection
          schedule={kit.schedule}
          questions={kit.questions}
          onRegenerate={regenerateSchedule}
        />
      )}
    </AppShell>
  );
}