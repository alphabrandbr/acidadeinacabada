import type { Metadata, Viewport } from "next";
import { Fraunces, Lora, Special_Elite } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});
const maquina = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-maquina",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acidadeinacabada.com.br";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "A Cidade Inacabada — Marcelinho",
  description:
    "O que você faria se todos os projetos que você começou e não terminou viessem bater na sua porta? Um romance para todo mundo que já começou alguma coisa.",
  openGraph: {
    title: "A Cidade Inacabada",
    description:
      "O que você faria se todos os projetos que você começou e não terminou viessem bater na sua porta?",
    type: "book",
    images: ["/hero_page.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${lora.variable} ${maquina.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('dta-atendido'))document.documentElement.setAttribute('data-atendido','1')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
