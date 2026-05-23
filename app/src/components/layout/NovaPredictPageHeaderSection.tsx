/*
  NovaPredictPageHeaderSection
  ----------------------------
  Shared page hero/header card used across app routes and marketing sections.

  We extracted this because every page duplicated the same inline grid + h1 + lead pattern,
  which made global brand refreshes painful and encouraged one-off styling drift.
*/

import type { ReactNode } from "react";

export interface NovaPredictPageHeaderSectionProps {
  kicker?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
}

export function NovaPredictPageHeaderSection({
  kicker,
  title,
  lead,
  children,
  className = "",
}: NovaPredictPageHeaderSectionProps) {
  return (
    <article className={`np-card np-page-header ${className}`.trim()}>
      {kicker ? <p className="np-kicker">{kicker}</p> : null}
      <h1 className="np-page-title">{title}</h1>
      {lead ? <p className="np-page-lead">{lead}</p> : null}
      {children}
    </article>
  );
}
