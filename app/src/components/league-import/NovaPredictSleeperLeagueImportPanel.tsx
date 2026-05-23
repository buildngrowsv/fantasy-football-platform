"use client";

/*
  NovaPredictSleeperLeagueImportPanel.tsx
  ---------------------------------------
  Authenticated Sleeper import flow:
  1. User enters Sleeper username (public read-only API).
  2. We discover leagues for the configured NFL season.
  3. User selects leagues to connect → persisted in league_connections.

  ESPN/Yahoo remain placeholder cards on /import until OAuth is wired.
*/

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { NOVA_PREDICT_NFL_SEASON } from "@/lib/constants/NovaPredictNflSeasonConstants";
import type { NovaPredictLeagueConnectionRecord } from "@/lib/db/schema";

interface DiscoveredSleeperLeague {
  leagueId: string;
  leagueName: string;
  season: number;
  totalRosters: number;
  status: string;
}

interface NovaPredictSleeperLeagueImportPanelProps {
  existingConnections: NovaPredictLeagueConnectionRecord[];
}

export function NovaPredictSleeperLeagueImportPanel({ existingConnections }: NovaPredictSleeperLeagueImportPanelProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [discoveredLeagues, setDiscoveredLeagues] = useState<DiscoveredSleeperLeague[]>([]);
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([]);
  const [sleeperUserId, setSleeperUserId] = useState<string | null>(null);
  const [sleeperUsernameResolved, setSleeperUsernameResolved] = useState<string | null>(null);
  const [discoveredSeason, setDiscoveredSeason] = useState<number>(NOVA_PREDICT_NFL_SEASON);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleDiscover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsDiscovering(true);
    setDiscoveredLeagues([]);
    setSelectedLeagueIds([]);

    try {
      const response = await fetch("/api/league-import/sleeper/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, season: NOVA_PREDICT_NFL_SEASON }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        season?: number;
        sleeperUser?: { userId: string; username: string; displayName: string };
        leagues?: DiscoveredSleeperLeague[];
      };

      if (!response.ok || !payload.ok || !payload.sleeperUser) {
        setErrorMessage(payload.error ?? "Could not find Sleeper leagues.");
        return;
      }

      setSleeperUserId(payload.sleeperUser.userId);
      setSleeperUsernameResolved(payload.sleeperUser.username);
      const leagues = payload.leagues ?? [];
      const resolvedSeason = payload.season ?? NOVA_PREDICT_NFL_SEASON;
      setDiscoveredSeason(resolvedSeason);
      setDiscoveredLeagues(leagues);
      setSelectedLeagueIds(leagues.map((league) => league.leagueId));

      if (leagues.length === 0) {
        setStatusMessage(`No Sleeper leagues found for @${payload.sleeperUser.username} in ${NOVA_PREDICT_NFL_SEASON} or ${NOVA_PREDICT_NFL_SEASON - 1}.`);
      } else {
        setStatusMessage(`Found ${leagues.length} ${resolvedSeason} league${leagues.length === 1 ? "" : "s"} for @${payload.sleeperUser.username}.`);
      }
    } catch {
      setErrorMessage("Network error — try again.");
    } finally {
      setIsDiscovering(false);
    }
  }

  function toggleLeagueSelection(leagueId: string) {
    setSelectedLeagueIds((current) =>
      current.includes(leagueId) ? current.filter((id) => id !== leagueId) : [...current, leagueId],
    );
  }

  async function handleConnectSelectedLeagues() {
    if (!sleeperUserId || !sleeperUsernameResolved || selectedLeagueIds.length === 0) {
      return;
    }

    setErrorMessage(null);
    setIsConnecting(true);

    try {
      const leaguesToConnect = discoveredLeagues
        .filter((league) => selectedLeagueIds.includes(league.leagueId))
        .map((league) => ({ leagueId: league.leagueId, leagueName: league.leagueName }));

      const response = await fetch("/api/league-import/sleeper/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleeperUserId,
          sleeperUsername: sleeperUsernameResolved,
          season: discoveredSeason,
          leagues: leaguesToConnect,
        }),
      });

      const payload = (await response.json()) as { ok: boolean; error?: string; connectedCount?: number };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Failed to connect leagues.");
        return;
      }

      setStatusMessage(`Connected ${payload.connectedCount ?? leaguesToConnect.length} league(s).`);
      setDiscoveredLeagues([]);
      setSelectedLeagueIds([]);
      router.refresh();
    } catch {
      setErrorMessage("Network error — try again.");
    } finally {
      setIsConnecting(false);
    }
  }

  const sleeperConnections = existingConnections.filter((connection) => connection.provider === "Sleeper");

  return (
    <div className="np-league-import-sleeper">
      <form className="np-league-import-form" onSubmit={handleDiscover}>
        <label className="np-auth-field">
          <span>Sleeper username</span>
          <input
            type="text"
            name="sleeperUsername"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="your_sleeper_handle"
          />
        </label>
        <button type="submit" className="np-btn np-btn-primary" disabled={isDiscovering}>
          {isDiscovering ? "Finding leagues…" : `Find ${NOVA_PREDICT_NFL_SEASON} leagues`}
        </button>
      </form>

      {errorMessage ? <p className="np-auth-error">{errorMessage}</p> : null}
      {statusMessage ? <p className="np-league-import-status">{statusMessage}</p> : null}

      {discoveredLeagues.length > 0 ? (
        <div className="np-league-import-discovered">
          <p className="np-league-import-discovered-title">Select leagues to connect</p>
          <div className="np-league-import-discovered-list">
            {discoveredLeagues.map((league) => (
              <label key={league.leagueId} className="np-league-import-discovered-row">
                <input
                  type="checkbox"
                  checked={selectedLeagueIds.includes(league.leagueId)}
                  onChange={() => toggleLeagueSelection(league.leagueId)}
                />
                <span>
                  <strong>{league.leagueName}</strong>
                  <small>
                    {league.totalRosters} teams · {league.status}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="np-btn np-btn-primary np-league-import-connect-btn"
            disabled={isConnecting || selectedLeagueIds.length === 0}
            onClick={handleConnectSelectedLeagues}
          >
            {isConnecting ? "Connecting…" : `Connect ${selectedLeagueIds.length} league(s)`}
          </button>
        </div>
      ) : null}

      {sleeperConnections.length > 0 ? (
        <div className="np-league-import-connected">
          <p className="np-league-import-connected-title">Your connected Sleeper leagues</p>
          <ul className="np-league-import-connected-list">
            {sleeperConnections.map((connection) => (
              <li key={connection.id}>
                <strong>{connection.leagueName}</strong>
                <span>
                  {connection.season} · @{connection.sleeperUsername ?? "sleeper"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
