/*
  HashNovaPredictUserPasswordWithBcrypt.ts
  --------------------------------------
  Hashes plaintext passwords for storage in novapredict_users.password_hash.

  bcryptjs is pure JavaScript — runs on Cloudflare Workers with nodejs_compat
  without native addon issues that block edge deploys.

  Called by: POST /api/auth/sign-up
*/

import bcrypt from "bcryptjs";

import { NOVA_PREDICT_AUTH_BCRYPT_SALT_ROUNDS } from "@/lib/auth/NovaPredictAuthConstants";

export async function HashNovaPredictUserPasswordWithBcrypt(plaintextPassword: string): Promise<string> {
  return bcrypt.hash(plaintextPassword, NOVA_PREDICT_AUTH_BCRYPT_SALT_ROUNDS);
}
