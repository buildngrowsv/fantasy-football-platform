/*
  ValidateNovaPredictChallengePickSubmissionInput.ts
  --------------------------------------------------
  Zod schema for POST /api/challenge/picks — agree locks model projection, override requires reason + user number.
*/

import { z } from "zod";

import { NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS } from "@/lib/challenge/NovaPredictChallengePickConstants";

const overrideReasonValues = NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS.map((option) => option.value);

export const NovaPredictChallengePickSubmissionInputSchema = z
  .object({
    playerId: z.string().min(1),
    playerName: z.string().min(1),
    playerTeam: z.string().min(2).max(4),
    playerPosition: z.string().min(1).max(8),
    season: z.number().int().min(2017).max(2035),
    week: z.number().int().min(1).max(22),
    pickType: z.enum(["agree", "override"]),
    modelPprProjection: z.number().min(0).max(80),
    userPprProjection: z.number().min(0).max(80).optional(),
    overrideReason: z.enum(overrideReasonValues as [string, ...string[]]).optional(),
  })
  .superRefine((value, context) => {
    if (value.pickType === "override") {
      if (value.userPprProjection === undefined) {
        context.addIssue({
          code: "custom",
          message: "Enter your PPR projection when overriding the model.",
          path: ["userPprProjection"],
        });
      }
      if (!value.overrideReason) {
        context.addIssue({
          code: "custom",
          message: "Select why you disagree with the model.",
          path: ["overrideReason"],
        });
      }
    }
  });

export type NovaPredictChallengePickSubmissionInput = z.infer<typeof NovaPredictChallengePickSubmissionInputSchema>;
