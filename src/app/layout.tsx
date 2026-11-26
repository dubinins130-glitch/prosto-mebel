import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/onest";
import "./globals.css";
import { company, withBase } from "@/content/site";
import { CategoryJourney } from "@/components/category-journey";

const title = `${company.name}: по вашим размерам`;
const description = "Кухни, шкафы, гардеробные, прихожие и детская мебель на заказ в Благовещенске.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, siteName: company.name, locale: "ru_RU", type: "website" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#F3F0EA" };

// Стартовое состояние до гидратации: без него на секунду мелькнул бы готовый кадр и сразу началась бы анимация.
const introState = `(function(){try{var d=document.documentElement;var w=window.innerWidth>=1100;var seen=sessionStorage.getItem('pm-intro');var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(location.pathname===${JSON.stringify(withBase("/"))}&&!location.hash&&w&&!seen&&!reduce&&window.scrollY<10){d.classList.add('intro');setTimeout(function(){d.classList.remove('intro')},9000)}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Script id="intro-state" strategy="beforeInteractive">{introState}</Script>
        <CategoryJourney>{children}</CategoryJourney>
      </body>
    </html>
  );
}
