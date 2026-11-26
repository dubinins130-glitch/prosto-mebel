"use client";

import { useLayoutEffect, useRef } from "react";
import { furnitureHref, roomImage, type Room, type RoomSlug } from "@/content/site";
import { jumpWithinCategory, useCategoryJourney } from "./category-journey";
import { Arrow } from "./primitives";

export function AllFurnitureLink({ room, className }: { room: RoomSlug; className?: string }) {
  const { backToFurniture } = useCategoryJourney();
  return (
    <a className={className} href={furnitureHref(room)} onClick={(event) => backToFurniture(room, event)}><Arrow direction="left" />Вся мебель</a>
  );
}

export function CategorySkipLink() {
  return <a className="skip-link" href="#category-content" onClick={jumpWithinCategory}>К содержанию</a>;
}

export function RoomHero({ room, index }: { room: Room; index: number }) {
  const host = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const journey = useCategoryJourney();
  const titleId = room.slug === "kitchens" ? "kitchen-title" : `${room.slug}-title`;

  useLayoutEffect(() => {
    const root = host.current?.closest<HTMLElement>(".category");
    const windowFrame = frame.current;
    const image = photo.current;
    if (!root || !windowFrame || !image) return;
    return journey.register(room.slug, {
      root,
      artwork: () => ({ frame: windowFrame, image }),
      align: () => window.scrollTo({ top: 0, behavior: "instant" }),
      focus: () => heading.current?.focus({ preventScroll: true }),
      details: () => Array.from(root.querySelectorAll("[data-flight-detail]")),
    });
  }, [journey, room.slug]);

  return (
    <section className="kitchen-hero" ref={host} aria-labelledby={titleId}>
      <div className="kitchen-hero-copy">
        <div className="kitchen-hero-measure" data-flight-detail><span>{String(index + 1).padStart(2, "0")} / 05</span><span>Мебель на заказ</span></div>
        <h1 id={titleId} className="kitchen-title" data-room={room.slug} ref={heading} tabIndex={-1} data-flight-detail>{room.title}<span>.</span></h1>
        <p data-flight-detail>{room.intro}</p>
        <a className="category-action" href="#estimate" data-flight-detail onClick={jumpWithinCategory}>Подготовить расчёт <Arrow /></a>
      </div>
      <figure className="kitchen-hero-figure">
        <div className="kitchen-hero-frame">
          <div ref={frame} className="kitchen-hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={photo}
              {...roomImage(room)}
              sizes={room.slug === "kitchens" ? "100vw" : "(max-width: 630px) 90vw, 60vw"}
              style={room.position ? { objectPosition: room.position } : undefined}
              alt={room.alt}
              fetchPriority="high"
            />
          </div>
        </div>
        <figcaption className="category-mono kitchen-hero-caption" data-flight-detail>
          Иллюстративное фото
        </figcaption>
      </figure>
    </section>
  );
}
