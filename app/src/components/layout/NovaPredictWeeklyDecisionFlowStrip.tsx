"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LayoutDashboard, ListOrdered, Trophy } from "lucide-react";
import { NOVA_PREDICT_CURRENT_WEEK_LABEL } from "@/lib/copy/NovaPredictPlatformUserFacingCopyCatalog";
import { ResolveNovaPredictNavigationLinkIsContextuallyActive } from "@/lib/navigation/ResolveNovaPredictNavigationLinkIsActive";

/*
  NovaPredictWeeklyDecisionFlowStrip.tsx
  --------------------------------------
  Lightweight wayfinding for the three screens managers actually use before lock.
  No framework jargon — just the natural order of operations.
*/

const NOVA_PREDICT_WEEKLY_FLOW_STEPS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    detail: "Check alerts and top signals",
    icon: LayoutDashboard,
  },
  {
    href: "/slate",
    label: "Pick slate",
    detail: "Lock in starts and sits",
    icon: ListOrdered,
  },
  {
    href: "/challenge",
    label: "Challenge",
    detail: "Back your overrides",
    icon: Trophy,
  },
] as const;

export function NovaPredictWeeklyDecisionFlowStrip() {
  const pathname = usePathname();

  return (
    <section className="np-weekly-flow-strip np-card-muted" aria-label={`${NOVA_PREDICT_CURRENT_WEEK_LABEL} workflow`}>
      <div className="np-weekly-flow-strip-header">
        <p className="np-pill np-pill-cyan">{NOVA_PREDICT_CURRENT_WEEK_LABEL}</p>
        <Link href="/accountability" className="np-weekly-flow-strip-after">
          After Sunday — see the gradebook →
        </Link>
      </div>

      <ol className="np-weekly-flow-steps">
        {NOVA_PREDICT_WEEKLY_FLOW_STEPS.map((step, index) => {
          const isActive = ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname, step.href);
          const Icon = step.icon;

          return (
            <li key={step.href} className={`np-weekly-flow-step${isActive ? " is-active" : ""}`}>
              <Link href={step.href} className="np-weekly-flow-step-link">
                <span className="np-weekly-flow-step-index">{index + 1}</span>
                <span className="np-weekly-flow-step-icon">
                  <Icon size={16} strokeWidth={2} aria-hidden />
                </span>
                <span className="np-weekly-flow-step-copy">
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </span>
                <ArrowRight size={14} className="np-weekly-flow-step-arrow" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
