import type { CSSProperties, ReactNode } from "react";
import { company, withBase, type Photo } from "@/content/site";

export function Arrow({ direction = "diagonal" }: { direction?: "diagonal" | "right" | "left" | "up" }) {
  const paths = {
    diagonal: "M4.5 15.5 15 5m-8 0h8v8",
    right: "M3.5 10h12m-4.8-4.8L15.5 10l-4.8 4.8",
    left: "M16.5 10h-12m4.8-4.8L4.5 10l4.8 4.8",
    up: "M10 16.5v-12m-4.8 4.8L10 4.5l4.8 4.8",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="arrow">
      <path d={paths[direction]} stroke="currentColor" strokeWidth="1.35" strokeLinecap="square" />
    </svg>
  );
}

export function Brand() {
  return (
    <a className="wordmark" href="#top" aria-label={company.name}>
      <span aria-hidden="true">просто<br />мебель<span className="wordmark-dot">.</span></span>
    </a>
  );
}

export function Line({ children }: { children: ReactNode }) {
  return <span className="heading-clip"><span data-line>{children}</span></span>;
}

export function Picture({
  photo,
  sizes,
  hero = false,
  motion,
}: {
  photo: Photo;
  sizes: string;
  hero?: boolean;
  motion?: "reveal" | "parallax";
}) {
  const path = withBase(`/images/${photo.name}`);
  const srcSet = hero
    ? `${path}-1000.webp 1000w, ${path}-1600.webp 1600w, ${path}-2400.webp 2400w`
    : `${path}-480.webp 480w, ${path}-900.webp 900w, ${path}-1400.webp 1400w`;

  return (
    <span className="photo-frame" data-picture={motion} style={{ "--photo-position": photo.position } as CSSProperties}>
      <picture>
        {hero && <source media="(max-width: 640px)" srcSet={`${path}-mobile-600.webp 600w, ${path}-mobile-960.webp 960w`} sizes={sizes} />}
        {/* Pre-sized local WebPs provide responsive sources in the static export. */}
        <img
          src={hero ? `${path}-1600.webp` : `${path}-900.webp`}
          srcSet={srcSet}
          sizes={sizes}
          alt={photo.alt}
          loading={hero ? "eager" : "lazy"}
          decoding={hero ? "auto" : "async"}
          fetchPriority={hero ? "high" : undefined}
        />
      </picture>
    </span>
  );
}
