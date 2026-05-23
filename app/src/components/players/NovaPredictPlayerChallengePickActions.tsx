"use client";

/*
  NovaPredictPlayerChallengePickActions.tsx
  -----------------------------------------
  Agree / Override buttons on player cards — persists picks to novapredict_user_challenge_picks.

  Product flow (Challenge the Model spec):
  - Agree logs user_pick = model projection (one tap).
  - Override requires user PPR number + reason code for Edge Finder analytics later.

  Called from players/[id]/page.tsx. Requires sign-in — otherwise prompts redirect to sign-in.
*/

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS,
  type NovaPredictChallengePickType,
} from "@/lib/challenge/NovaPredictChallengePickConstants";

interface NovaPredictPlayerChallengePickActionsProps {
  playerId: string;
  playerName: string;
  playerTeam: string;
  playerPosition: string;
  season: number;
  week: number;
  modelPprProjection: number;
  isAuthenticated: boolean;
  isLocked: boolean;
  lockLabel: string | null;
  existingPick: {
    pickType: NovaPredictChallengePickType;
    userPprProjection: number | null;
    overrideReason: string | null;
  } | null;
}

export function NovaPredictPlayerChallengePickActions({
  playerId,
  playerName,
  playerTeam,
  playerPosition,
  season,
  week,
  modelPprProjection,
  isAuthenticated,
  isLocked,
  lockLabel,
  existingPick,
}: NovaPredictPlayerChallengePickActionsProps) {
  const router = useRouter();
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [userProjection, setUserProjection] = useState(
    existingPick?.userPprProjection?.toString() ?? modelPprProjection.toFixed(1),
  );
  const [overrideReason, setOverrideReason] = useState(existingPick?.overrideReason ?? "matchup_read");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="np-player-challenge-actions">
        <Link
          href={`/sign-in?returnTo=${encodeURIComponent(`/players/${encodeURIComponent(playerId)}`)}`}
          className="np-btn np-btn-primary"
        >
          Sign in to challenge the model
        </Link>
      </div>
    );
  }

  async function submitPick(pickType: NovaPredictChallengePickType, overridePayload?: { userPpr: number; reason: string }) {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/challenge/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          playerName,
          playerTeam,
          playerPosition,
          season,
          week,
          pickType,
          modelPprProjection: modelPprProjection,
          userPprProjection: pickType === "override" ? overridePayload?.userPpr : undefined,
          overrideReason: pickType === "override" ? overridePayload?.reason : undefined,
        }),
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Could not save pick.");
        return;
      }

      setStatusMessage(pickType === "agree" ? "Agreed with NovaPredict — pick saved." : "Override saved for this week.");
      setShowOverrideForm(false);
      router.refresh();
    } catch {
      setErrorMessage("Network error — try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAgreeClick() {
    void submitPick("agree");
  }

  function handleOverrideSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedProjection = Number.parseFloat(userProjection);
    if (!Number.isFinite(parsedProjection)) {
      setErrorMessage("Enter a valid PPR projection.");
      return;
    }
    void submitPick("override", { userPpr: parsedProjection, reason: overrideReason });
  }

  const existingLabel =
    existingPick?.pickType === "agree"
      ? "You agreed with the model this week."
      : existingPick
        ? `Your override: ${existingPick.userPprProjection?.toFixed(1)} PPR`
        : null;

  return (
    <div className="np-player-challenge-actions">
      {isLocked ? <p className="np-player-challenge-locked">{lockLabel ?? "Picks locked for this game."}</p> : null}
      {existingLabel ? <p className="np-player-challenge-existing">{existingLabel}</p> : null}
      {statusMessage ? <p className="np-player-challenge-status">{statusMessage}</p> : null}
      {errorMessage ? <p className="np-auth-error">{errorMessage}</p> : null}

      {!isLocked ? (
        <>
          <div className="np-player-challenge-action-row">
            <button type="button" className="np-btn np-btn-primary" disabled={isSubmitting} onClick={handleAgreeClick}>
              Agree · start
            </button>
            <button
              type="button"
              className="np-btn np-btn-secondary"
              disabled={isSubmitting}
              onClick={() => setShowOverrideForm((current) => !current)}
            >
              Override projection
            </button>
          </div>

          {showOverrideForm ? (
            <form className="np-player-challenge-override-form" onSubmit={handleOverrideSubmit}>
              <label className="np-auth-field">
                <span>Your PPR projection</span>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={80}
                  required
                  value={userProjection}
                  onChange={(event) => setUserProjection(event.target.value)}
                />
              </label>
              <label className="np-auth-field">
                <span>Why you disagree</span>
                <select value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)}>
                  {NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="np-btn np-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save override"}
              </button>
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
