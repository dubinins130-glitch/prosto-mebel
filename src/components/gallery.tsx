"use client";

import { useRef, useState } from "react";
import { interiors, withBase, type Photo } from "@/content/site";
import { Arrow, Picture } from "./primitives";

export function Gallery({ items = interiors, numbered = false }: {
  items?: { title: string; photo: Photo }[];
  numbered?: boolean;
}) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const selected = items[active];

  function step(offset: number) {
    setActive((index) => (index + offset + items.length) % items.length);
  }

  return (
    <>
      <div className="interior-grid">
        {items.map(({ title, photo }, index) => (
          <figure key={title} className="interior-figure">
            <button
              type="button"
              className="gallery-image"
              aria-label={`Увеличить фото «${title}»`}
              aria-haspopup="dialog"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setActive(index);
                dialog.current?.showModal();
              }}
            >
              <Picture photo={photo} sizes="(max-width: 640px) 92vw, 54vw" motion="reveal" />
              <span className="gallery-expand" aria-hidden="true"><Arrow /></span>
            </button>
            <figcaption>{numbered && <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}{title}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Примеры интерьерных решений"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        onClose={() => opener.current?.focus({ preventScroll: true })}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            step(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <div className="lightbox-layout">
          <button type="button" className="lightbox-close" aria-label="Закрыть фото" autoFocus onClick={() => dialog.current?.close()}>×</button>
          <figure className="lightbox-figure">
            {/* Full-size local export photography. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase(`/images/${selected.photo.name}-1400.webp`)} alt={selected.photo.alt} loading="lazy" />
            <figcaption className="lightbox-caption" aria-live="polite">
              <span>{selected.title}</span>
              <span>{active + 1} / {items.length}</span>
            </figcaption>
          </figure>
          <div className="lightbox-controls">
            <button type="button" aria-label="Предыдущее фото" onClick={() => step(-1)}><Arrow direction="left" /></button>
            <button type="button" aria-label="Следующее фото" onClick={() => step(1)}><Arrow direction="right" /></button>
          </div>
        </div>
      </dialog>
    </>
  );
}
