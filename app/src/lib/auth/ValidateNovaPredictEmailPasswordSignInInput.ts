/*
  ValidateNovaPredictEmailPasswordSignInInput.ts
  ----------------------------------------------
  Zod schema for sign-in API requests.
*/

import { z } from "zod";

export const NovaPredictEmailPasswordSignInInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(320)
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required").max(128),
});

export type NovaPredictEmailPasswordSignInInput = z.infer<typeof NovaPredictEmailPasswordSignInInputSchema>;
