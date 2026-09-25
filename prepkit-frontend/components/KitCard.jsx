import Link from "next/link";

const STATUS_STYLES = {
  draft: "bg-surface-container text-on-surface-variant",
  generating: "bg-secondary-fixed text-on-secondary-fixed-variant",
  ready: "bg-primary-container text-on-primary",
};

const STATUS_LABEL = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
};

export default function KitCard({ kit }) {
  const initial = kit.company?.charAt(0)?.toUpperCase() || "?";

  return (
    <Link
      href={`/kits/${kit.id}`}
      className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary font-bold text-headline-sm flex items-center justify-center shadow-sm">
              {initial}
            </div>
            <div>
              <p className="font-label-lg text-label-lg text-on-surface font-semibold">
                {kit.role}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {kit.company}
              </p>
            </div>
          </div>
          <span
            className={`font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold ${
              STATUS_STYLES[kit.status] || STATUS_STYLES.draft
            }`}
          >
            {STATUS_LABEL[kit.status] || "Draft"}
          </span>
        </div>

        <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
          <span>Coverage</span>
          <span className="text-primary font-semibold">{kit.coverage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden mb-space-md">
          <div
            className="h-full bg-primary-container rounded-full"
            style={{ width: `${kit.coverage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-space-sm border-t border-outline-variant/30">
        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">event</span>
          {kit.daysAvailable} day{kit.daysAvailable === 1 ? "" : "s"} left
        </span>
        <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </span>
      </div>
    </Link>
  );
}
