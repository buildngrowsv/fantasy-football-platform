/*
  Apple touch icon (180×180) for home-screen shortcuts on iOS/iPadOS.

  Without this, Safari falls back to a cropped screenshot of the page — off-brand and blurry.
*/
import { BuildNovaPredictBrandMarkImageResponse } from "@/lib/seo/BuildNovaPredictBrandMarkImageResponse";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return BuildNovaPredictBrandMarkImageResponse(180);
}
