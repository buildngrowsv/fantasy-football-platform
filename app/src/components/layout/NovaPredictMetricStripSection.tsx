/*
  NovaPredictMetricStripSection
  -----------------------------
  Horizontal metric strip shared by homepage, dashboard, accountability, and challenge.

  Centralizing this removes the repeated auto-fit grid + mono value + uppercase label blocks
  that were copy-pasted across routes during early scaffolding.
*/

export interface NovaPredictMetricStripItem {
  label: string;
  value: string;
  subLabel?: string;
  tone?: "default" | "accent" | "data" | "amber";
}

export interface NovaPredictMetricStripSectionProps {
  metrics: NovaPredictMetricStripItem[];
  className?: string;
}

function resolveMetricValueClass(tone: NovaPredictMetricStripItem["tone"]): string {
  if (tone === "accent") return "np-metric-value is-accent";
  if (tone === "data") return "np-metric-value is-data";
  if (tone === "amber") return "np-metric-value is-amber";
  return "np-metric-value";
}

export function NovaPredictMetricStripSection({ metrics, className = "" }: NovaPredictMetricStripSectionProps) {
  return (
    <article className={`np-card np-metric-strip ${className}`.trim()}>
      {metrics.map((metric) => (
        <div key={metric.label} className="np-metric-cell">
          <div className={resolveMetricValueClass(metric.tone)}>{metric.value}</div>
          <div className="np-metric-label">{metric.label}</div>
          {metric.subLabel ? <div className="np-metric-sublabel">{metric.subLabel}</div> : null}
        </div>
      ))}
    </article>
  );
}
