"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LayoutDashboard, ListOrdered, Trophy } from "lucide-react";
import { ResolveNovaPredictNavigationLinkIsContextuallyActive } from "@/lib/navigation/ResolveNovaPredictNavigationLinkIsActive";

/*
  NovaPredictWeeklyDecisionFlowStrip.tsx
  --------------------------------------
  Guided pre-lock workflow strip shown atop app pages (hidden on marketing home).

  Product intent: nudge users through Dashboard → Slate → Challenge instead of
  treating eight routes as peers. Active step highlights based on pathname.
*/

const NOVA_PREDICT_WEEKLY_FLOW_STEPS = [
  {
    href: "/dashboard",
    label: "Review",
    detail: "Scan metrics & alerts",
    icon: LayoutDashboard,
  },
  {
    href: "/slate",
    label: "Pick Slate",
    detail: "Agree or override cards",
    icon: ListOrdered,
  },
  {
    href: "/challenge",
    label: "Challenge",
    detail: "Track your edge",
    icon: Trophy,
  },
] as const;

export function NovaPredictWeeklyDecisionFlowStrip() {
  const pathname = usePathname();

  return (
    <section className="np-weekly-flow-strip np-card-muted" aria-label="Weekly decision workflow">
      <div className="np-weekly-flow-strip-header">
        <p className="np-pill np-pill-cyan">Pre-lock flow</p>
        <Link href="/accountability" className="np-weekly-flow-strip-after">
          Then review accountability →
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
