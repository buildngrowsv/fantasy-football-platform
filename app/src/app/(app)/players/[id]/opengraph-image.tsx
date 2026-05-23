/*
  Player-specific Open Graph image for /players/[id] share links.
*/
import { getNovaPredictPlayerById } from "@/lib/db/queries";
import { BuildNovaPredictPlayerOpenGraphPreviewImageResponse } from "@/lib/seo/BuildNovaPredictPlayerOpenGraphPreviewImageResponse";

export const alt = "NovaPredict player projection card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PlayerOpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const player = await getNovaPredictPlayerById(resolvedParams.id);

  if (!player) {
    const { BuildNovaPredictOpenGraphPreviewImageResponse } = await import(
      "@/lib/seo/BuildNovaPredictOpenGraphPreviewImageResponse"
    );
    return BuildNovaPredictOpenGraphPreviewImageResponse();
  }

  return BuildNovaPredictPlayerOpenGraphPreviewImageResponse({
    fullName: player.fullName,
    position: player.position,
    team: player.team,
    opponent: player.opponent,
    novaPprProjection: player.novaPprProjection,
    vegasPprProjection: player.vegasPprProjection,
    marketSignalLabel: player.marketSignalLabel,
    matchupLabel: player.matchupLabel,
  });
}
