import { Noto_Sans_Gujarati, Hind_Vadodara, Inter } from "next/font/google";

export const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  variable: "--font-noto-sans-gujarati",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

export const hindVadodara = Hind_Vadodara({
  subsets: ["gujarati", "latin"],
  variable: "--font-hind-vadodara",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const gujaratiFontClassName = `${notoSansGujarati.variable} ${hindVadodara.variable} ${inter.variable}`;
