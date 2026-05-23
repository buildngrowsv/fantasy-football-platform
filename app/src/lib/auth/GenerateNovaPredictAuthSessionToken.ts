/*
  GenerateNovaPredictAuthSessionToken.ts
  --------------------------------------
  Creates cryptographically random opaque session ids for novapredict_user_sessions.

  Uses Web Crypto (available on Workers) — 32 bytes → base64url without padding.
*/

export function GenerateNovaPredictAuthSessionToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const base64 = btoa(String.fromCharCode(...randomBytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
