"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { kitsApi } from "../../../lib/api/kits";
import { useRequireAuth } from "../../../lib/hooks/useRequireAuth";


async function parseFile(file) {
  const text = await file.text();
  const isJson = file.name.endsWith(".json");

  if (isJson) {
    const data = JSON.parse(text);
    return (Array.isArray(data) ? data : []).map((row) => ({
      jd: row.jd || row.description || "",
      companyUrl: row.company_url || row.companyUrl || "",
      days: Number(row.days) || 5,
    })).filter((r) => r.jd && r.companyUrl);
  }

  // CSV: expects header row "jd,company_url,days"
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const [header, ...rows] = lines;
  const cols = header.split(",").map((c) => c.trim().toLowerCase());
  const jdIdx = cols.indexOf("jd");
  const urlIdx = cols.findIndex((c) => c === "company_url" || c === "companyurl");
  const daysIdx = cols.indexOf("days");

  return rows
    .map((line) => {
      const cells = line.split(",");
      return {
        jd: cells[jdIdx]?.trim() || "",
        companyUrl: cells[urlIdx]?.trim() || "",
        days: Number(cells[daysIdx]) || 5,
      };
    })
    .filter((r) => r.jd && r.companyUrl);
}



export default function NewKitPage() {
  const authed = useRequireAuth();
  const router = useRouter();
  const [mode, setMode] = useState("single"); // single | bulk
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState(5);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "single") {
      if (jd.trim().length < 20) {
        setError("Paste the full job description (at least a couple of sentences).");
        return;
      }
      if (!companyUrl.trim()) {
        setError("The company website is required so we can research it.");
        return;
      }
    } else if (!file) {
      setError("Upload a CSV or JSON file with your description/company pairs.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "single") {
        const data = await kitsApi.create(jd, companyUrl, days);
        // Fire-and-forget: the generating page polls the kit's status
        // itself, so we navigate immediately rather than waiting here.
        kitsApi.generate(data.kit._id).catch(() => {
          // Errors surface via the kit's own "failed" status field.
        });
        router.push(`/kits/${data.kit._id}/generating`);
    } else {
        const entries = await parseFile(file);
        if (entries.length === 0) {
          setError("Could not find any valid entries in the file.");
          setSubmitting(false);
          return;
        }
        await kitsApi.createBulk(entries);
        router.push("/dashboard");
      }

    } catch (err) {
      setError(err.message || "Could not create the kit.");
      setSubmitting(false);
    }
  }

  if (!authed) return null;

  return (
    <AppShell active="Dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Create a new interview kit
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Paste the job description and tell us where to research the company.
          </p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-surface-container-high self-start md:self-auto shadow-sm">
          <button
            className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-lg text-label-lg transition-all duration-150 ${
              mode === "single"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setMode("single")}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_outline
            </span>
            <span>Single Role</span>
          </button>
          <button
            className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-lg text-label-lg transition-all duration-150 ${
              mode === "bulk"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setMode("bulk")}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">dataset</span>
            <span>Bulk Upload</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
              CSV / JSON
            </span>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start"
      >
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {mode === "single" ? (
            <>
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <label
                  className="font-label-lg text-label-lg text-on-surface font-semibold"
                  htmlFor="jd"
                >
                  Job description
                </label>
                <textarea
                  id="jd"
                  rows={10}
                  className="w-full rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 p-space-md focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all resize-y"
                  placeholder="Paste the full job description here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {jd.length} characters
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <label
                  className="font-label-lg text-label-lg text-on-surface font-semibold"
                  htmlFor="companyUrl"
                >
                  Company website
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/60 text-[20px] pointer-events-none">
                    language
                  </span>
                  <input
                    id="companyUrl"
                    type="url"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                    placeholder="https://company.com"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                  />
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  We&apos;ll crawl this site to find what they do and how they hire.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <label
                  className="font-label-lg text-label-lg text-on-surface font-semibold"
                  htmlFor="days"
                >
                  Days until interview
                </label>
                <input
                  id="days"
                  type="number"
                  min={1}
                  max={60}
                  className="w-32 h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#4f46e5] transition-all"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Your study schedule will span exactly this many days.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <label className="font-label-lg text-label-lg text-on-surface font-semibold">
                Upload description/company pairs
              </label>
              <label
                htmlFor="bulkFile"
                className="flex flex-col items-center justify-center gap-space-xs border-2 border-dashed border-outline-variant rounded-xl py-space-2xl cursor-pointer hover:border-primary hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[32px] text-primary">
                  upload_file
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {file ? file.name : "Click to choose a .csv or .json file"}
                </span>
                <input
                  id="bulkFile"
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Each row/entry needs a job description, a company URL and the
                number of days available.
              </p>
            </div>
          )}

          {error && (
            <p className="font-body-sm text-body-sm text-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-fit inline-flex items-center justify-center gap-space-xs px-space-xl py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Starting research...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  auto_awesome
                </span>
                <span>Generate Kit</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
              What we&apos;ll research
            </h2>
            <ul className="flex flex-col gap-space-sm">
              {[
                "What the company does, from its own site",
                "How they hire — careers page, handbook, engineering blog",
                "Public discussion of their interview process",
                "The requirements hidden in your job description",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-space-sm font-body-sm text-body-sm text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">
                    task_alt
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
              Good to know
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              If a source can&apos;t be reached, we&apos;ll say so honestly in the
              brief instead of guessing. A thin description produces a thin —
              but honest — kit.
            </p>
          </div>
        </div>
      </form>
    </AppShell>
  );
}