/*
  PWA manifest icon at 192×192 referenced from manifest.webmanifest.

  Next.js only auto-discovers icon.tsx and apple-icon.tsx — this route handler serves the
  mid-size tile Android/Chrome uses when pinning NovaPredict to the home screen.
*/
import { BuildNovaPredictBrandMarkImageResponse } from "@/lib/seo/BuildNovaPredictBrandMarkImageResponse";

export async function GET() {
  return BuildNovaPredictBrandMarkImageResponse(192);
}
