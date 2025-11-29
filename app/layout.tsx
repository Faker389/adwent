import type { Metadata } from "next";
import { Crimson_Text, Mountains_of_Christmas } from "next/font/google";
import "./globals.css";

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const mountainsOfChristmas = Mountains_of_Christmas({
  variable: "--font-christmas",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Kalendarz Adwentowy",
  description: "24 dni pełnych świątecznej magii",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-[100dvh]">
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
      </head>
      <body
        className={`${crimsonText.variable} ${mountainsOfChristmas.variable} h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}