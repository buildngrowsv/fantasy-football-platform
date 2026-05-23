/*
  ValidateNovaPredictEmailPasswordSignUpInput.ts
  ---------------------------------------------
  Zod schema for sign-up API — keeps validation identical across route and forms.
*/

import { z } from "zod";

import { NOVA_PREDICT_AUTH_MIN_PASSWORD_LENGTH } from "@/lib/auth/NovaPredictAuthConstants";

export const NovaPredictEmailPasswordSignUpInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(320)
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(
      NOVA_PREDICT_AUTH_MIN_PASSWORD_LENGTH,
      `Password must be at least ${NOVA_PREDICT_AUTH_MIN_PASSWORD_LENGTH} characters`,
    )
    .max(128),
  displayName: z.string().trim().min(1).max(80).optional(),
});

export type NovaPredictEmailPasswordSignUpInput = z.infer<typeof NovaPredictEmailPasswordSignUpInputSchema>;
