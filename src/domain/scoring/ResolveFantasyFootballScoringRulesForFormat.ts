import { FantasyFootballScoringFormat } from "@/domain/types/FantasyFootballScoringFormat";
import { StandardFantasyFootballScoringRules } from "@/domain/scoring/StandardFantasyFootballScoringRules";

/**
 * ResolveFantasyFootballScoringRulesForFormat
 *
 * Returns the scoring rule object for a given league format. Called from
 * league creation wizards and the scoring explainer on the marketing site.
 * Half-PPR and full PPR only adjust reception points — everything else stays
 * on the standard baseline to reduce commissioner confusion.
 */
export function ResolveFantasyFootballScoringRulesForFormat(
  scoringFormat: FantasyFootballScoringFormat,
) {
  if (scoringFormat === FantasyFootballScoringFormat.PointPerReception) {
    return {
      ...StandardFantasyFootballScoringRules,
      receptionPoints: 1,
    };
  }

  if (scoringFormat === FantasyFootballScoringFormat.HalfPointPerReception) {
    return {
      ...StandardFantasyFootballScoringRules,
      receptionPoints: 0.5,
    };
  }

  return StandardFantasyFootballScoringRules;
}
