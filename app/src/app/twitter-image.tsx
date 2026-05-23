/*
  Twitter/X large summary card image — same creative as opengraph-image for consistent previews.
*/
import { BuildNovaPredictOpenGraphPreviewImageResponse } from "@/lib/seo/BuildNovaPredictOpenGraphPreviewImageResponse";

export const alt = "NovaPredict — Fantasy intelligence platform powered by sportsbook probability";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return BuildNovaPredictOpenGraphPreviewImageResponse();
}
