import {
  NOVA_PREDICT_CURRENT_WEEK_LABEL,
  NOVA_PREDICT_LOCK_COUNTDOWN_LABEL,
} from "@/lib/copy/NovaPredictPlatformUserFacingCopyCatalog";

/*
  NovaPredictWeekContextStatusStrip.tsx
  -------------------------------------
  Compact week + lock countdown shown in the app header (desktop/tablet).

  Values are static until live schedule ingest wires real lock times — but the
  label reads like product chrome, not a developer placeholder comment.
*/

export function NovaPredictWeekContextStatusStrip() {
  return (
    <div className="np-week-context-strip" aria-label="Current NFL week">
      <span className="np-week-context-week">{NOVA_PREDICT_CURRENT_WEEK_LABEL}</span>
      <span className="np-week-context-lock">
        <span className="np-week-context-lock-dot" aria-hidden />
        {NOVA_PREDICT_LOCK_COUNTDOWN_LABEL}
      </span>
    </div>
  );
}
