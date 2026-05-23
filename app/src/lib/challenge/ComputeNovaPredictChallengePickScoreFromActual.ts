/*
  ComputeNovaPredictChallengePickScoreFromActual.ts
  -------------------------------------------------
  Pure scoring math for Challenge the Model after games finish.

  user_beat_model = user's projection was strictly closer to actual PPR than the model's.
  Agree picks always tie the model (same number) so they never "beat" the model on accuracy.
*/

export interface NovaPredictChallengePickScoreComputationResult {
  actualPpr: number;
  userAbsError: number;
  modelAbsError: number;
  userBeatModel: boolean;
}

export function ComputeNovaPredictChallengePickScoreFromActual(
  userPprProjection: number,
  modelPprProjection: number,
  actualPpr: number,
): NovaPredictChallengePickScoreComputationResult {
  const userAbsError = Math.abs(actualPpr - userPprProjection);
  const modelAbsError = Math.abs(actualPpr - modelPprProjection);

  return {
    actualPpr,
    userAbsError,
    modelAbsError,
    userBeatModel: userAbsError < modelAbsError,
  };
}
