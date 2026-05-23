import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NovaPredictSiteHeader } from "@/components/layout/NovaPredictSiteHeader";
import { BuildNovaPredictRootSiteMetadata } from "@/lib/seo/BuildNovaPredictRootSiteMetadata";
import { NOVA_PREDICT_COLOR_SCHEME_ATTRIBUTE, NOVA_PREDICT_COLOR_SCHEME_STORAGE_KEY } from "@/lib/theme/NovaPredictColorSchemeCatalog";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = BuildNovaPredictRootSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const colorSchemeInitScript = `
(function () {
  var storageKey = ${JSON.stringify(NOVA_PREDICT_COLOR_SCHEME_STORAGE_KEY)};
  var attribute = ${JSON.stringify(NOVA_PREDICT_COLOR_SCHEME_ATTRIBUTE)};
  var preference = null;
  try {
    preference = localStorage.getItem(storageKey);
  } catch (error) {
    preference = null;
  }
  var resolved = preference === "light" || preference === "dark"
    ? preference
    : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute(attribute, resolved);
})();
`.trim();

  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Script id="np-color-scheme-init" strategy="beforeInteractive">
          {colorSchemeInitScript}
        </Script>
        {/*
          We keep one global nav mounted at the root because this platform has both
          a marketing narrative and a power-user workflow. A persistent nav prevents
          users from feeling "lost in a separate app" when they jump between those contexts.
        */}
        <NovaPredictSiteHeader />
        <main className="np-main-content">{children}</main>
      </body>
    </html>
  );
}
