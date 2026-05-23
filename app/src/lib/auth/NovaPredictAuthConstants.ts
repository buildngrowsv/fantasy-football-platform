/*
  NovaPredictAuthConstants.ts
  ---------------------------
  Shared auth configuration for cookie sessions on Cloudflare Workers + Neon.

  We use opaque DB-backed session tokens (not JWTs) because:
  - Sessions can be revoked instantly on sign-out or password change.
  - No secret rotation complexity on the edge — cookie is just a random id.
  - Works identically in local dev and OpenNext Worker production.
*/

export const NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME = "np_session";

/** 30 days — aligns with typical fantasy season engagement window. */
export const NOVA_PREDICT_AUTH_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const NOVA_PREDICT_AUTH_BCRYPT_SALT_ROUNDS = 12;

export const NOVA_PREDICT_AUTH_MIN_PASSWORD_LENGTH = 8;
