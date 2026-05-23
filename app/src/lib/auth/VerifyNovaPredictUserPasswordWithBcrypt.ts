/*
  VerifyNovaPredictUserPasswordWithBcrypt.ts
  ------------------------------------------
  Compares sign-in password against stored bcrypt hash.

  Called by: POST /api/auth/sign-in
*/

import bcrypt from "bcryptjs";

export async function VerifyNovaPredictUserPasswordWithBcrypt(
  plaintextPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintextPassword, passwordHash);
}
