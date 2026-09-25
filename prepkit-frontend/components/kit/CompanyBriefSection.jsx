"use client";

import { useState } from "react";

export default function CompanyBriefSection({ brief, source, onChange, onRegenerate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(brief.summary);
  const [regenerating, setRegenerating] = useState(false);

  function save() {
    onChange({ ...brief, summary: draft, edited: true });
    setEditing(false);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm">
      <div className="flex items-center justify-between p-space-lg border-b border-outline-variant/30">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {source.company || "Company"} Brief
          </h3>
          {brief.edited && (
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Edited by you
            </span>
          )}
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors disabled:opacity-60"
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                regenerating ? "animate-spin" : ""
              }`}
            >
              auto_fix_normal
            </span>
            <span className="hidden sm:inline">Regenerate</span>
          </button>
          <button
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg"
            type="button"
            onClick={() => setEditing((v) => !v)}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </div>

      <div className="p-space-lg flex flex-col gap-space-md">
        <div>
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
            Summary
          </h4>
          {editing ? (
            <div className="flex flex-col gap-space-sm">
              <textarea
                className="w-full rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm p-space-md focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5]"
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="flex gap-space-sm">
                <button
                  className="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm"
                  type="button"
                  onClick={save}
                >
                  Save
                </button>
                <button
                  className="px-space-md py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm"
                  type="button"
                  onClick={() => {
                    setDraft(brief.summary);
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              {brief.summary || "No summary available for this company yet."}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
            What they do
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            {brief.what_they_do || "Not found — the company site didn't have enough public detail."}
          </p>
        </div>

        <div>
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
            Sources
          </h4>
          <div className="flex flex-wrap gap-space-xs">
            {brief.sources?.length ? (
              brief.sources.map((src) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-primary hover:underline truncate max-w-[220px]"
                >
                  {src}
                </a>
              ))
            ) : (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                No sources found
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
