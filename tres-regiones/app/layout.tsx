import type { Metadata } from "next";
import { Karla, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

const sans = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

export const metadata: Metadata = {
  title: "Atlas · Tres regiones",
  description:
    "Pokédex de Kanto, Johto y Hoenn consumiendo la PokeAPI. Proyecto Nivel 3.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
