"use client";

const KIND_STYLE = {
  technical: "bg-primary-fixed text-on-primary-fixed-variant",
  behavioural: "bg-secondary-fixed text-on-secondary-fixed-variant",
  domain: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

export default function RequirementsSection({ requirements, uncoveredIds }) {
  const musts = requirements.filter((r) => r.priority === "must");
  const nice = requirements.filter((r) => r.priority === "nice");

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-lg">
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
          Must-have ({musts.length})
        </h3>
        <div className="flex flex-col gap-space-sm">
          {musts.map((req) => (
            <RequirementRow
              key={req.id}
              req={req}
              uncovered={uncoveredIds.includes(req.id)}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
          Nice-to-have ({nice.length})
        </h3>
        <div className="flex flex-col gap-space-sm">
          {nice.map((req) => (
            <RequirementRow
              key={req.id}
              req={req}
              uncovered={uncoveredIds.includes(req.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RequirementRow({ req, uncovered }) {
  return (
    <div className="flex items-start justify-between gap-space-sm p-space-md rounded-xl bg-surface-container-low">
      <div className="flex items-start gap-space-sm">
        <span
          className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-semibold shrink-0 ${
            KIND_STYLE[req.kind] || KIND_STYLE.technical
          }`}
        >
          {req.kind}
        </span>
        <p className="font-body-sm text-body-sm text-on-surface">{req.text}</p>
      </div>
      {uncovered && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm shrink-0">
          <span className="material-symbols-outlined text-[14px]">
            report
          </span>
          No question yet
        </span>
      )}
    </div>
  );
}
