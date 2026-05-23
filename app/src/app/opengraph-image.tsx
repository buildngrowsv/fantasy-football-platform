/*
  Default Open Graph image (1200×630) for link previews on Slack, iMessage, Facebook, LinkedIn, etc.
*/
import { BuildNovaPredictOpenGraphPreviewImageResponse } from "@/lib/seo/BuildNovaPredictOpenGraphPreviewImageResponse";

export const alt = "NovaPredict — Fantasy intelligence platform powered by sportsbook probability";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return BuildNovaPredictOpenGraphPreviewImageResponse();
}
