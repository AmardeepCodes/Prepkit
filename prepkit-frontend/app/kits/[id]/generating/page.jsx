

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../../components/AppShell";
import { kitsApi } from "../../../../lib/api/kits";
import { useRequireAuth } from "../../../../lib/hooks/useRequireAuth";

const POLL_INTERVAL_MS = 3000;

// The pipeline runs multiple sequential LLM calls server-side (1-2 minutes
// total), so this page polls GET /api/kits/:id until status flips from
// "generating" to "ready" or "failed", rather than trying to stream
// step-by-step progress from a process we don't have a channel into yet.
export default function GeneratingPage() {
  const authed = useRequireAuth();
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("generating");
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    if (!authed) return;

    async function poll() {
      try {
        const data = await kitsApi.get(id);
        setStatus(data.kit.status);

        if (data.kit.status === "ready") {
          clearInterval(pollRef.current);
          router.push(`/kits/${id}`);
        } else if (data.kit.status === "failed") {
          clearInterval(pollRef.current);
          setError("Generation failed. You can retry from the kit page.");
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setError(err.message || "Lost connection while checking progress.");
      }
    }

    poll(); // check immediately, don't wait for the first interval tick
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [authed, id, router]);

  if (!authed) return null;

  return (
    <AppShell active="Dashboard">
      <div className="max-w-2xl mx-auto w-full py-space-xl text-center">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Generating your kit
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          This takes a minute or two — we're researching the company and
          drafting each section. Feel free to leave this page; the kit will
          be ready when you come back to it.
        </p>

        <div className="mt-space-xl bg-surface-container-lowest rounded-2xl shadow-sm p-space-xl flex flex-col items-center gap-space-md">
          {error ? (
            <>
              <span className="material-symbols-outlined text-[40px] text-error">
                error
              </span>
              <p className="font-body-sm text-body-sm text-error">{error}</p>
              <button
                className="mt-space-sm px-space-lg py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md"
                onClick={() => router.push(`/kits/${id}`)}
              >
                Go to kit
              </button>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[40px] text-primary animate-spin">
                progress_activity
              </span>
              <p className="font-label-md text-label-md text-on-surface-variant">
                Status: {status}
              </p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}