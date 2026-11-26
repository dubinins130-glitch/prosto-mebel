"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { company, dimensions, hero, roomFromHash, roomImage, roomHref, rooms, type RoomSlug } from "@/content/site";
import { drawingEase, isPlainClick, useCategoryJourney } from "./category-journey";
import { Arrow } from "./primitives";

const INK = "rgb(30,28,25)";
const PAPER = "rgb(243,240,234)";

// Длины участков сцены в «единицах» (1 единица = 1% высоты окна прокрутки).
const UNITS = { hold: 20, t1: 120, s2: 80, hold2: 40, t2: 90 };

const formatMm = (value: number) => `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} мм`;

type Box = { t: number; r: number; b: number; l: number };

function RulerLabels() {
  return (
    <>
      {Array.from({ length: 110 }, (_, i) => (
        <span className="ruler-label" key={i} style={{ top: i * 80 }}>{i * 100}</span>
      ))}
    </>
  );
}

function Words({ light = false }: { light?: boolean }) {
  const content = hero.lines.map((line, row) => (
    <span className="hl" key={row}>
      {line.map((word) => (
        <span className="w" key={word}><span className="w-in" data-word={word}>{word}</span></span>
      ))}
    </span>
  ));
  return light
    ? <div className="hw hw-light" aria-hidden="true">{content}</div>
    : <h1 className="hw hw-dark" aria-label={hero.title}>{content}</h1>;
}

function HDim({ id, label }: { id: string; label: string }) {
  return (
    <div className="dim dim-h" data-dim={id}>
      <i className="dim-line" /><i className="dim-tick t-a" /><i className="dim-tick t-b" />
      <span className="dim-tag" data-tag>{label}</span>
    </div>
  );
}

function VDim({ id, label }: { id: string; label: string }) {
  return (
    <div className="dim dim-v" data-dim={id}>
      <i className="dim-line" /><i className="dim-tick t-a" /><i className="dim-tick t-b" />
      <span className="dim-tag" data-tag>{label}</span>
    </div>
  );
}

function Leader({ id, label }: { id: string; label: string }) {
  return (
    <div className="dim dim-leader" data-dim={id}>
      <i className="dim-line" /><i className="dim-dot" />
      <span className="dim-tag" data-tag>{label}</span>
    </div>
  );
}

export function Stage() {
  const root = useRef<HTMLDivElement>(null);
  const journey = useCategoryJourney();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    CustomEase.create("mm", drawingEase);
    const el = root.current;
    if (!el) return;

    const html = document.documentElement;
    const q = <T extends HTMLElement = HTMLElement>(selector: string) => el.querySelector<T>(selector)!;
    const qa = <T extends HTMLElement = HTMLElement>(selector: string) => Array.from(el.querySelectorAll<T>(selector));

    const media = gsap.matchMedia();
    const cleanups: Array<() => void> = [];

    media.add({ desktop: "(min-width: 821px)", mobile: "(max-width: 820px)", reduce: "(prefers-reduced-motion: reduce)" }, (context) => {
      const { mobile, reduce } = context.conditions as { mobile: boolean; reduce: boolean };
      try {
      const track = q(".track");
      const pin = q(".pin");
      const photo = q(".photo");
      const photoIntro = q(".photo-intro");
      const baseLayer = q(".layer-base");
      const baseInner = q(".base-inner");
      const baseImg = q<HTMLImageElement>(".base-inner img");
      const shade = q(".photo-shade");
      const slides = qa(".slide");
      const rows = qa(".row");
      const rowWords = qa(".row .w-in");
      const s3 = q(".s3");
      const photoLink = q<HTMLAnchorElement>(".room-entry");
      const cta = q<HTMLAnchorElement>(".room-cta");
      const ctaLabels = qa(".room-cta-label");
      const dims1 = q(".dims-1");
      const dims1In = q(".dims-1-in");
      const dims2 = q(".dims-2");
      const lightLines = qa(".hw-light .hl");
      const darkWords = q(".hw-dark");
      const capHeroIn = q(".cap-hero-in");
      const capIndex = q(".cap-index");
      const capNote = q(".cap-note");
      const capCount = q(".cap-count");
      const winMarks = qa(".win-mark");
      const rulerTrack = q(".ruler-track");
      const rulerRead = q(".ruler-read");
      const count = q(".cap-count-text");

      const cs = getComputedStyle(pin);
      const num = (name: string) => parseFloat(cs.getPropertyValue(name));
      const A: Box = { t: num("--a-t"), r: num("--a-r"), b: num("--a-b"), l: num("--a-l") };
      const C = { t: num("--c-t"), r: num("--c-r"), l: num("--c-l") };
      const roomBottom = () => (pin.getBoundingClientRect().bottom - photoLink.getBoundingClientRect().bottom) / pin.clientHeight;

      // Положение фото внутри слоя на каждой из трёх стадий (доли ширины и высоты окна).
      const S1 = mobile ? { scale: 1.18, x: 0, y: 2 } : { scale: 1.45, x: -4.5, y: -4.5 };
      const S3 = mobile ? { scale: 1, x: 0, y: 0 } : { scale: 1.15, x: 27, y: -13.8 };
      const posX = mobile ? 0.6 : 0.5;

      const U = { ...UNITS, s3: mobile ? 250 : 300 };
      const t1s = U.hold, t1e = t1s + U.t1, s2s = t1e, s2e = s2s + U.s2;
      const t2s = s2e + U.hold2, t2e = t2s + U.t2, s3s = t2e, D = s3s + U.s3;
      const itemLen = U.s3 / rooms.length;

      track.style.height = `${100 + D}svh`;

      // Начальное состояние
      gsap.set(baseInner, { scale: S1.scale, xPercent: S1.x, yPercent: S1.y });
      gsap.set(shade, { opacity: 0 });
      gsap.set(rowWords, { yPercent: 118 });
      gsap.set([...winMarks, capCount, capNote], { opacity: 0 });
      gsap.set(slides, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(el, { "--hc": INK });

      // Размерные линии: положение считается из реальной вёрстки и фото
      const place = (node: HTMLElement | null, box: { left?: number; top?: number; width?: number; height?: number }) => {
        if (!node) return;
        if (box.left !== undefined) node.style.left = `${box.left}px`;
        if (box.top !== undefined) node.style.top = `${box.top}px`;
        if (box.width !== undefined) node.style.width = `${box.width}px`;
        if (box.height !== undefined) node.style.height = `${box.height}px`;
      };
      const dim = (root: HTMLElement, id: string) => root.querySelector<HTMLElement>(`[data-dim="${id}"]`);

      const layout = () => {
        const W = window.innerWidth, H = window.innerHeight;
        const words = darkWords.getBoundingClientRect();
        const photoLeft = W * A.l;

        // Экран 1
        place(dim(dims1, "s1h"), mobile
          ? { left: words.left, top: words.top - 26, width: W - 14 - words.left }
          : { left: words.left, top: words.top - 34, width: photoLeft - words.left });
        const s1v = dim(dims1, "s1v");
        if (s1v) {
          s1v.style.display = mobile ? "none" : "";
          place(s1v, { left: photoLeft - 24, top: 92, height: H - 92 - 60 });
        }

        // Экран 2: координаты в долях изображения → пиксели окна (как у object-fit: cover)
        const nw = baseImg.naturalWidth || 1600, nh = baseImg.naturalHeight || 1067;
        const k = Math.max(W / nw, H / nh);
        const w = nw * k, h = nh * k;
        const ox = (W - w) * posX, oy = (H - h) * 0.5;
        const px = (fx: number) => ox + fx * w;
        const py = (fy: number) => oy + fy * h;

        if (mobile) {
          place(dim(dims2, "a"), { left: 14 + 14, top: H * 0.5, width: W - 14 - 14 - 28 });
          place(dim(dims2, "b"), { left: W - 24, top: H * 0.2, height: H * 0.62 });
          place(dim(dims2, "c"), {});
          place(dim(dims2, "l1"), { left: W * 0.4, top: H * 0.58 });
          place(dim(dims2, "l2"), { left: W * 0.6, top: H * 0.34 });
          const c = dim(dims2, "c");
          if (c) c.style.display = "none";
        } else {
          place(dim(dims2, "a"), { left: px(0.175), top: py(0.545), width: px(0.715) - px(0.175) });
          place(dim(dims2, "b"), { left: px(0.945), top: py(0.337), height: py(0.764) - py(0.337) });
          place(dim(dims2, "c"), { left: px(0.145), top: py(0.585), height: py(0.885) - py(0.585) });
          place(dim(dims2, "l1"), { left: px(0.6), top: py(0.598) });
          place(dim(dims2, "l2"), { left: px(0.47), top: py(0.3) });
        }
      };
      layout();
      const onRefresh = () => layout();
      ScrollTrigger.addEventListener("refreshInit", onRefresh);
      cleanups.push(() => ScrollTrigger.removeEventListener("refreshInit", onRefresh));
      if (!baseImg.complete) baseImg.addEventListener("load", layout, { once: true });

      // Линия рисуется, число считает до значения.
      const drawDim = (tl: gsap.core.Timeline, node: HTMLElement | null, at: number, duration: number, target?: number) => {
        if (!node) return;
        const line = node.querySelector<HTMLElement>(".dim-line")!;
        const ticks = Array.from(node.querySelectorAll<HTMLElement>(".dim-tick, .dim-dot"));
        const tag = node.querySelector<HTMLElement>("[data-tag]")!;
        const vertical = node.classList.contains("dim-v") || node.classList.contains("dim-leader");
        gsap.set(line, vertical ? { scaleY: 0 } : { scaleX: 0 });
        gsap.set(ticks, { opacity: 0, scale: 1 });
        gsap.set(tag, { opacity: 0 });
        const finalText = tag.textContent ?? "";
        tl.to(line, vertical ? { scaleY: 1, duration, ease: "mm" } : { scaleX: 1, duration, ease: "mm" }, at)
          .to(ticks, { opacity: 1, duration: duration * 0.25, ease: "none" }, at + duration * 0.35)
          .to(tag, { opacity: 1, duration: duration * 0.2, ease: "none" }, at + duration * 0.3);
        if (target) {
          const counter = { v: 0 };
          tag.textContent = formatMm(0);
          tl.to(counter, {
            v: target, duration: duration * 1.1, ease: "mm",
            onUpdate: () => { tag.textContent = formatMm(counter.v); },
          }, at + duration * 0.3);
        } else {
          tag.textContent = finalText;
        }
      };

      // Главная шкала: один таймлайн связывает все три экрана
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      // Переход 1 → 2: окно фото растёт, слова меняют цвет на границе
      const ZERO = { "--t": 0, "--r": 0, "--b": 0, "--l": 0 };
      tl.fromTo(photo, { "--t": A.t, "--r": A.r, "--b": A.b, "--l": A.l }, { ...ZERO, duration: U.t1, ease: "mm", immediateRender: false }, t1s)
        .fromTo(baseInner, { scale: S1.scale, xPercent: S1.x, yPercent: S1.y }, { scale: 1, xPercent: 0, yPercent: 0, duration: U.t1, ease: "mm", immediateRender: false }, t1s)
        .to(shade, { opacity: 0.2, duration: U.t1 }, t1s)
        .to(dims1In, { opacity: 0, duration: U.t1 * 0.22 }, t1s)
        .to([capHeroIn, capIndex], { opacity: 0, duration: U.t1 * 0.2 }, t1s)
        .to(el, { "--hc": PAPER, duration: U.t1 * 0.25 }, t1s + U.t1 * 0.62)
        .to(lightLines[0], { yPercent: -135, opacity: 0, duration: U.t1 * 0.45 + U.s2 * 0.2, ease: "power2.in" }, t1s + U.t1 * 0.55)
        .to(lightLines[1], { yPercent: -22, opacity: 0.15, duration: U.t1 * 0.45 + U.s2 * 0.2, ease: "power2.inOut" }, t1s + U.t1 * 0.55)
        .to(darkWords, { opacity: 0, duration: 1 }, t1e - 1);

      // Экран 2: размеры и выноски по очереди
      drawDim(tl, dim(dims2, "a"), s2s + 2, mobile ? 26 : 30, dimensions.heroWidth);
      drawDim(tl, dim(dims2, "b"), s2s + 10, mobile ? 26 : 30, dimensions.heroHeight);
      if (!mobile) drawDim(tl, dim(dims2, "c"), s2s + 20, 22, 900);
      drawDim(tl, dim(dims2, "l1"), s2s + 32, 18);
      drawDim(tl, dim(dims2, "l2"), s2s + 40, 18);
      tl.to(capNote, { opacity: 1, duration: 10 }, s2s + 46);

      // Переход 2 → 3: фото сжимается до окна, возвращается бумага, поднимается список
      tl.to([dims2, capNote], { opacity: 0, duration: U.t2 * 0.2 }, t2s)
        .fromTo(photo, ZERO, { "--t": C.t, "--r": C.r, "--b": roomBottom, "--l": C.l, duration: U.t2, ease: "mm", immediateRender: false }, t2s)
        .fromTo(baseInner, { scale: 1, xPercent: 0, yPercent: 0 }, { scale: S3.scale, xPercent: S3.x, yPercent: S3.y, duration: U.t2, ease: "mm", immediateRender: false }, t2s)
        .to(shade, { opacity: 0, duration: U.t2 * 0.6 }, t2s)
        .to(lightLines, { opacity: 0, duration: U.t2 * 0.2 }, t2s)
        .to(el, { "--hc": INK, duration: U.t2 * 0.3 }, t2s + U.t2 * 0.5)
        .to(rowWords, { yPercent: 0, duration: 34, stagger: 5, ease: "mm" }, t2s + U.t2 * 0.35)
        .to(s3, { opacity: 1, duration: 10 }, t2s + U.t2 * 0.3)
        .to([...winMarks, capCount], { opacity: 1, duration: 14 }, t2e - 14);

      // Шкала должна длиться ровно D единиц, иначе путь прокрутки растянется на меньший участок.
      tl.to({}, { duration: 0.001 }, D - 0.001);

      // Смена фото на экране 3 (по вертикали, в сторону прокрутки)
      const layers = [baseLayer, ...slides];
      const images = [baseImg, ...slides.map((slide) => slide.querySelector<HTMLImageElement>("img")!)];
      const indexOfRoom = (room: RoomSlug) => rooms.findIndex(({ slug }) => slug === room);
      let active = 0;
      let zTop = 10;
      let swapTl: gsap.core.Timeline | null = null;
      let selecting = false;
      let disposed = false;

      const syncChooser = () => {
        const visible = tl.time() >= s3s - 2;
        s3.inert = !visible;
        for (const link of [photoLink, cta]) {
          link.classList.toggle("is-visible", visible);
          link.tabIndex = visible ? 0 : -1;
        }
      };
      tl.eventCallback("onUpdate", syncChooser);

      const setActiveUi = (index: number) => {
        rows.forEach((row, i) => {
          row.classList.toggle("is-active", i === index);
          row.setAttribute("aria-current", String(i === index));
        });
        const room = rooms[index];
        count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(rooms.length).padStart(2, "0")} · ${room.title.toUpperCase()}`;
        cta.href = roomHref(room.slug);
        cta.setAttribute("aria-label", room.action);
        photoLink.href = roomHref(room.slug);
        photoLink.setAttribute("aria-label", `Открыть раздел «${room.title}»`);
        journey.preloadRoom(room.slug);
        syncChooser();
      };

      const setCtaLabel = (index: number) => {
        gsap.set(ctaLabels, { yPercent: 0, visibility: (i) => i === index ? "inherit" : "hidden" });
      };

      const showRoom = (index: number) => {
        swapTl?.progress(1).kill();
        layers.forEach((layer, i) => gsap.set(layer, {
          clipPath: i === index ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          yPercent: 0,
        }));
        gsap.set(baseLayer, { clearProps: "clipPath" });
        gsap.set(layers[index], { zIndex: ++zTop });
        active = index;
        setCtaLabel(index);
        setActiveUi(index);
      };

      const swap = (from: number, to: number, duration = 1.2, done?: () => void) => {
        const dir = to > from ? 1 : -1;
        swapTl?.progress(1);
        const incoming = layers[to];
        const outgoing = layers[from];
        incoming.style.zIndex = String(++zTop);
        const isBase = to === 0;
        const Hpx = pin.clientHeight;
        const bottom = roomBottom();
        // Базовый слой размером с окно браузера, поэтому его «нулевая» рамка считается относительно окна фото.
        const baseFrom = dir > 0
          ? `inset(${(1 - bottom) * Hpx}px 0px ${bottom * Hpx}px 0px)`
          : `inset(${C.t * Hpx}px 0px ${(1 - C.t) * Hpx}px 0px)`;
        const slideFrom = dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
        const to0 = isBase ? "inset(0px 0px 0px 0px)" : "inset(0% 0% 0% 0%)";

        swapTl = gsap.timeline({
          defaults: { duration, ease: "mm" },
          onComplete: () => {
            if (from !== 0) gsap.set(outgoing, { clipPath: "inset(100% 0% 0% 0%)" });
            gsap.set(outgoing, { yPercent: 0 });
            if (isBase) gsap.set(incoming, { clearProps: "clipPath" });
            setCtaLabel(to);
            done?.();
          },
        });
        swapTl.fromTo(incoming, { clipPath: isBase ? baseFrom : slideFrom }, { clipPath: to0 }, 0);
        if (!isBase) {
          const inner = incoming.querySelector(".slide-inner");
          swapTl.fromTo(inner, { yPercent: dir * 12, scale: 1.12 }, { yPercent: 0, scale: 1, duration: duration * 1.42 }, 0);
        }
        swapTl.to(outgoing, { yPercent: -5 * dir, duration }, 0);
        swapTl
          .fromTo(ctaLabels[to], { yPercent: dir * 105, visibility: "inherit" }, { yPercent: 0, duration }, 0)
          .to(ctaLabels[from], { yPercent: -dir * 105, duration }, 0);
        active = to;
        setActiveUi(to);
      };

      setActiveUi(0);

      // Скролл
      const rulerH = () => window.innerHeight / 2;
      const updateRuler = () => {
        const y = window.scrollY;
        rulerTrack.style.transform = `translate3d(0, ${rulerH() - y}px, 0)`;
        rulerRead.textContent = formatMm(y / 0.8);
      };

      const scrub = reduce || window.location.search.includes("nosmooth") ? true : 0.7;
      const trigger = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        animation: tl,
        scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateRuler();
          const t = self.progress * D;
          const index = Math.max(0, Math.min(rooms.length - 1, Math.floor((t - s3s) / itemLen)));
          if (!selecting && index !== active) {
            if (reduce) showRoom(index);
            else swap(active, index);
          }
        },
        onRefresh: updateRuler,
      });
      trigger.refresh();
      updateRuler();
      if (process.env.NODE_ENV !== "production") (window as unknown as Record<string, unknown>).__stage = { tl, trigger, U, D, s3s, itemLen, gsap };
      window.addEventListener("scroll", updateRuler, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", updateRuler));

      const chooseRoom = (index: number, instant = false) => {
        const start = track.getBoundingClientRect().top + window.scrollY;
        const span = track.offsetHeight - window.innerHeight;
        const top = start + ((s3s + (index + 0.5) * itemLen) / D) * span;
        window.scrollTo({ top, behavior: reduce || instant ? "instant" : "smooth" });
        if (instant) {
          trigger.update();
          if (typeof scrub === "number") trigger.getTween()?.progress(1);
          tl.progress(trigger.progress);
        }
      };
      const align = (room: RoomSlug) => {
        const index = indexOfRoom(room);
        selecting = true;
        chooseRoom(index, true);
        showRoom(index);
        selecting = false;
      };
      const openRoom = (event: MouseEvent, index: number) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        journey.openRoom(rooms[index].slug, async () => {
          selecting = true;
          const previous = active;
          chooseRoom(index, true);
          if (previous !== index) {
            await images[index].decode().catch(() => undefined);
            if (disposed) throw new Error("Stage was unmounted");
            await new Promise<void>((resolve) => swap(previous, index, 0.48, resolve));
          } else {
            swapTl?.progress(1);
          }
          chooseRoom(index, true);
          selecting = false;
        });
      };
      const handlers = rows.map((row, index) => {
        const handler = (event: MouseEvent) => openRoom(event, index);
        row.addEventListener("click", handler);
        return () => row.removeEventListener("click", handler);
      });
      cleanups.push(...handlers);
      const openActive = (event: MouseEvent) => openRoom(event, active);
      for (const link of [photoLink, cta]) {
        link.addEventListener("click", openActive);
        cleanups.push(() => link.removeEventListener("click", openActive));
      }

      const initialRoom = roomFromHash(location.hash);
      if (initialRoom) {
        align(initialRoom);
        const snapAfterLayout = requestAnimationFrame(() => align(initialRoom));
        cleanups.push(() => cancelAnimationFrame(snapAfterLayout));
      }
      cleanups.push(journey.register("furniture", {
        root: el,
        artwork: (room) => ({ frame: photoLink, image: images[indexOfRoom(room)] }),
        align,
        focus: (room) => rows[indexOfRoom(room)]?.focus({ preventScroll: true }),
        details: () => [s3, ...winMarks, capCount, cta],
      }));
      const anchor = q<HTMLAnchorElement>(".cap-action");
      const onAnchor = (event: Event) => {
        event.preventDefault();
        document.getElementById("contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      };
      anchor.addEventListener("click", onAnchor);
      cleanups.push(() => anchor.removeEventListener("click", onAnchor));

      // Вход на страницу
      const heroWords = (index: number) => qa(`.hw .hl:nth-child(${index})`).flatMap((line) => Array.from(line.querySelectorAll<HTMLElement>(".w-in")));
      const all = [...heroWords(1), ...heroWords(2)];
      const hdr = q(".hdr");
      const capHero = q(".cap-hero");
      const s1h = dim(dims1, "s1h")!;
      const s1v = dim(dims1, "s1v");
      let introTl: gsap.core.Timeline | null = null;

      const drawIntroDim = (tl2: gsap.core.Timeline, node: HTMLElement | null, at: number, duration: number, target: number) => {
        if (!node) return;
        const line = node.querySelector<HTMLElement>(".dim-line")!;
        const ticks = Array.from(node.querySelectorAll<HTMLElement>(".dim-tick"));
        const tag = node.querySelector<HTMLElement>("[data-tag]")!;
        const vertical = node.classList.contains("dim-v");
        gsap.set(line, vertical ? { scaleY: 0 } : { scaleX: 0 });
        gsap.set([...ticks, tag], { opacity: 0 });
        const counter = { v: 0 };
        tag.textContent = formatMm(0);
        tl2.to(line, vertical ? { scaleY: 1, duration, ease: "mm" } : { scaleX: 1, duration, ease: "mm" }, at)
          .to([...ticks, tag], { opacity: 1, duration: 0.3, ease: "none" }, at + duration * 0.25)
          .to(counter, { v: target, duration: duration * 1.05, ease: "power3.out", onUpdate: () => { tag.textContent = formatMm(counter.v); } }, at + duration * 0.15);
      };

      const finishIntro = () => {
        html.classList.remove("intro");
        try { sessionStorage.setItem("pm-intro", "1"); } catch { /* sessionStorage may be unavailable */ }
        ScrollTrigger.refresh();
      };

      const startIntro = () => {
        gsap.set(dims1, { opacity: 1 });
        gsap.set(all, { y: 0, yPercent: 118 });
        gsap.set(photo, { "--iv": 0.5 });
        gsap.set(photoIntro, { scale: 1.14 });
        gsap.set(hdr, { opacity: 1, yPercent: -120 });
        gsap.set(capHero, { opacity: 1 });
        gsap.set([capHeroIn, capIndex], { y: 14, opacity: 0 });
        introTl = gsap.timeline({ defaults: { ease: "mm" }, onComplete: finishIntro });
        drawIntroDim(introTl, s1h, 0, 0.9, dimensions.heroWidth);
        introTl
          .to(all, { yPercent: 0, duration: 1.1, stagger: { each: 0.09, from: "start" }, ease: "expo.out" }, 0.14)
          .to(photo, { "--iv": 0, duration: 1.5 }, 0.5)
          .to(photoIntro, { scale: 1, duration: 1.7 }, 0.45);
        drawIntroDim(introTl, s1v, 0.9, 0.9, dimensions.heroHeight);
        introTl
          .to(hdr, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 1.15)
          .to([capHeroIn, capIndex], { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 1.3);
      };

      const quickIntro = () => {
        gsap.fromTo(all, { y: 0, yPercent: 118 }, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" });
        gsap.fromTo(photoIntro, { scale: 1.1 }, { scale: 1, duration: 1.3, ease: "mm" });
        drawIntroDim(gsap.timeline({ delay: 0.15 }), s1h, 0, 0.9, dimensions.heroWidth);
      };

      const skip = () => { introTl?.progress(1); };

      if (html.classList.contains("intro") && !mobile && !reduce) {
        // Ждём только то, что действительно нужно кадру: шрифты и главное фото. Ничего не растягиваем искусственно.
        Promise.all([document.fonts.ready, baseImg.decode().catch(() => undefined)]).then(() => {
          if (disposed) return;
          layout();
          startIntro();
        });
        window.addEventListener("pointerdown", skip, { once: true });
        window.addEventListener("keydown", skip, { once: true });
        cleanups.push(() => { window.removeEventListener("pointerdown", skip); window.removeEventListener("keydown", skip); });
      } else {
        html.classList.remove("intro");
        if (!reduce && !location.hash && window.scrollY < 10) {
          Promise.all([document.fonts.ready, baseImg.decode().catch(() => undefined)]).then(() => {
            if (!disposed) { layout(); quickIntro(); }
          });
        }
      }

      return () => {
        disposed = true;
        baseImg.removeEventListener("load", layout);
        cleanups.splice(0).forEach((fn) => fn());
        swapTl?.kill();
        introTl?.kill();
        trigger.kill();
        tl.kill();
      };
      } catch (error) {
        html.classList.remove("intro");
        console.error("stage build failed", error);
      }
    });

    return () => { media.revert(); };
  }, [journey]);

  return (
    <div className="stage" ref={root}>
      <a className="skip-link" href="#contact">К контактам</a>

      <header className="hdr">
        <a className="wordmark" href="#top" aria-label={company.name}>просто<br />мебель<i>.</i></a>
        {company.phoneHref && <a className="hdr-phone" href={company.phoneHref}>{company.phone}</a>}
      </header>

      <div className="ruler" aria-hidden="true">
        <div className="ruler-track"><RulerLabels /></div>
        <span className="ruler-now" />
        <span className="ruler-read">0 мм</span>
      </div>

      <main id="top">
        <div className="track">
          <div className="pin">
            <Words />

            <div className="dims-1" aria-hidden="true">
              <div className="dims-1-in">
                <HDim id="s1h" label={formatMm(dimensions.heroWidth)} />
                <VDim id="s1v" label={formatMm(dimensions.heroHeight)} />
              </div>
            </div>

            <nav className="s3" aria-label="Направления мебели" inert>
              {rooms.map((room, index) => (
                <a className="row" key={room.slug} href={roomHref(room.slug)} aria-label={room.title}>
                  <span className="row-rule" aria-hidden="true" />
                  <span className="w"><span className="w-in">{room.title}</span></span>
                  <span className="row-idx" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="row-note">{room.note}</span>
                </a>
              ))}
            </nav>

            <div className="photo">
              <div className="photo-intro">
                <div className="layer layer-base">
                  <div className="base-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      {...roomImage(rooms[0])}
                      sizes="100vw" alt={hero.photoAlt} fetchPriority="high" decoding="async"
                    />
                  </div>
                </div>
                {rooms.slice(1).map((room) => (
                  <div className="slide" key={room.image} style={room.position ? ({ "--pos": room.position } as React.CSSProperties) : undefined}>
                    <div className="slide-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        {...roomImage(room)}
                        sizes="40vw" alt={room.alt} loading="lazy" decoding="async"
                      />
                    </div>
                  </div>
                ))}
                <div className="photo-shade" />
              </div>
              <Words light />
            </div>

            <div className="dims-2" aria-hidden="true">
              <HDim id="a" label={formatMm(dimensions.heroWidth)} />
              <VDim id="b" label={formatMm(dimensions.heroHeight)} />
              <VDim id="c" label="900 мм" />
              <Leader id="l1" label="СТОЛЕШНИЦА · 38 ММ" />
              <Leader id="l2" label="ФАСАД · 18 ММ" />
            </div>

            <i className="win-mark win-tl" /><i className="win-mark win-tr" />
            <i className="win-mark win-bl" /><i className="win-mark win-br" />
            <a className="room-entry" href={roomHref(rooms[0].slug)} aria-label="Открыть раздел «Кухни»" tabIndex={-1} />
            <a className="room-cta" href={roomHref(rooms[0].slug)} aria-label={rooms[0].action} aria-describedby="room-cta-hint" tabIndex={-1}>
              <span className="room-cta-copy">
                <span className="room-cta-titles" aria-hidden="true">
                  {rooms.map((room) => <span key={room.slug} className="room-cta-label">{room.action}</span>)}
                </span>
                <span className="room-cta-hint" id="room-cta-hint">Укажите размеры и выберите материалы</span>
              </span>
              <span className="room-cta-arrow"><Arrow /></span>
            </a>

            <div className="caption cap-hero">
              <div className="cap-hero-in">
                <span>{hero.caption}</span>
                <a className="cap-action" href="#contact">{hero.action}
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 10h12m-4.8-4.8L15.5 10l-4.8 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" /></svg>
                </a>
              </div>
            </div>
            <ol className="caption cap-index" aria-hidden="true">
              {rooms.map((room, index) => <li key={room.title}><span>{String(index + 1).padStart(2, "0")}</span>{room.title}</li>)}
            </ol>
            <div className="caption cap-note">{dimensions.note}</div>
            <div className="caption cap-count" aria-live="polite"><span className="cap-count-text">01 / 05 · КУХНИ</span></div>
          </div>
        </div>
      </main>

      <footer className="end" id="contact">
        <span>{company.name} · {company.contactLocation}</span>
        {company.phoneHref && <a href={company.phoneHref}>{company.phone}</a>}
        {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
        <span>Демонстрационная версия.</span>
      </footer>
    </div>
  );
}
