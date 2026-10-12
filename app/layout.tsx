import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { THEME_INIT_SCRIPT } from "@/lib/themeScript";
  import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "FoodKeeper", template: "%s · FoodKeeper" },
  description: "Ton carnet de restaurants : notes, visites, dépenses et stats.",
  applicationName: "FoodKeeper",
};

export const viewport: Viewport = {
  themeColor: "#f3ece1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Applique le thème choisi avant l'affichage (pas de flash) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${bricolage.variable} min-h-dvh antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}