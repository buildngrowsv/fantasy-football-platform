/*
  NovaPredictWeekContextStatusStrip.tsx
  -------------------------------------
  Compact week + lock countdown shown in the app header (desktop/tablet).

  Values are static placeholders until live schedule ingest wires real lock times.
  Design comps always show "Week 7" + amber lock pill — we mirror that chrome so
  the product feels season-aware even before backend countdown is connected.
*/

export function NovaPredictWeekContextStatusStrip() {
  return (
    <div className="np-week-context-strip" aria-label="Current NFL week context">
      <span className="np-week-context-week">Week 7</span>
      <span className="np-week-context-lock">
        <span className="np-week-context-lock-dot" aria-hidden />
        31h 14m to lock
      </span>
    </div>
  );
}
