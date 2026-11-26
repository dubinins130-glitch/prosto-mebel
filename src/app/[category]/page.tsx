import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { company, rooms } from "@/content/site";
import { estimates } from "@/content/estimate";
import { AllFurnitureLink, CategorySkipLink, RoomHero } from "@/components/room-hero";
import { FurnitureEstimate } from "@/components/furniture-estimate";
import "./configurator.css";

type PageProps = { params: Promise<{ category: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => rooms.map(({ slug }) => ({ category: slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const room = rooms.find(({ slug }) => slug === category);
  if (!room) notFound();
  return { title: `${room.title} на заказ в Благовещенске | ${company.name}`, description: estimates[room.slug].description };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const index = rooms.findIndex(({ slug }) => slug === category);
  const room = rooms[index];
  if (!room) notFound();
  return (
    <div className="category">
      <CategorySkipLink />
      <span className="category-rail" aria-hidden="true"><i /><span>{String(index + 1).padStart(2, "0")}</span></span>
      <header className="category-header category-shell">
        <Link href="/" className="wordmark" aria-label={company.name}>просто<br />мебель<i>.</i></Link>
        <AllFurnitureLink room={room.slug} className="category-return category-mono" />
        {company.phoneHref && <a className="hdr-phone" href={company.phoneHref}>{company.phone}</a>}
      </header>
      <main className="category-shell" id="category-content" tabIndex={-1}>
        <RoomHero room={room} index={index} />
        <FurnitureEstimate key={room.slug} room={room.slug} />
      </main>
      <footer className="category-shell category-footer">
        <span className="category-mono">{company.name} · Дизайн и разработка {company.studio}</span>
        <AllFurnitureLink room={room.slug} className="category-return category-mono" />
      </footer>
    </div>
  );
}
