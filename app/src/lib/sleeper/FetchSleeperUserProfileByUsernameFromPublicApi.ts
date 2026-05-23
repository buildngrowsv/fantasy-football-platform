/*
  FetchSleeperUserProfileByUsernameFromPublicApi.ts
  ---------------------------------------------------
  Read-only Sleeper user lookup — no auth token required.

  Used by league import discover flow before we persist league_connections rows.
  Sleeper docs: GET https://api.sleeper.app/v1/user/<username>
*/

export interface SleeperUserProfileRecord {
  userId: string;
  username: string;
  displayName: string;
}

export async function FetchSleeperUserProfileByUsernameFromPublicApi(
  username: string,
): Promise<SleeperUserProfileRecord | null> {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) {
    return null;
  }

  const response = await fetch(`https://api.sleeper.app/v1/user/${encodeURIComponent(normalizedUsername)}`, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Sleeper user lookup failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    user_id?: string;
    username?: string;
    display_name?: string;
  };

  if (!payload.user_id) {
    return null;
  }

  return {
    userId: payload.user_id,
    username: payload.username ?? normalizedUsername,
    displayName: payload.display_name ?? payload.username ?? normalizedUsername,
  };
}
