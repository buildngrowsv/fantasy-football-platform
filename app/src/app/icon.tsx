/*
  Dynamic favicon (32×32) for NovaPredict.

  Next.js App Router automatically wires this file to /icon and injects link rel="icon" tags.
  See BuildNovaPredictBrandMarkImageResponse for the visual system.
*/
import { BuildNovaPredictBrandMarkImageResponse } from "@/lib/seo/BuildNovaPredictBrandMarkImageResponse";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return BuildNovaPredictBrandMarkImageResponse(32);
}
