"use client";

import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { furniturePath, roomFromHash, roomPath, roomSlugs, withBase, type RoomSlug } from "@/content/site";

export const drawingEase = ".62,.04,.18,1";

type Screen = "furniture" | RoomSlug;
type Rect = { left: number; top: number; width: number; height: number };
type Artwork = { frame: HTMLElement; image: HTMLImageElement };
type Surface = {
  root: HTMLElement;
  artwork: (room: RoomSlug) => Artwork;
  align: (room: RoomSlug) => void;
  focus: (room: RoomSlug) => void;
  details: () => Element[];
};

type Journey = {
  to: Screen;
  room: RoomSlug;
  covered: boolean;
  arrived: boolean;
  timeline?: gsap.core.Timeline;
  timeout?: number;
  frameRequest?: number;
  restore?: Array<() => void>;
};

type Controls = {
  register: (screen: Screen, surface: Surface) => () => void;
  openRoom: (room: RoomSlug, prepare: () => Promise<void>) => void;
  preloadRoom: (room: RoomSlug) => void;
  backToFurniture: (room: RoomSlug, event: MouseEvent<HTMLAnchorElement>) => void;
};

const JourneyContext = createContext<Controls | null>(null);

export function useCategoryJourney() {
  const journey = useContext(JourneyContext);
  if (!journey) throw new Error("Category journey requires its layout provider");
  return journey;
}

export function isPlainClick(event: MouseEvent | globalThis.MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function jumpWithinCategory(event: MouseEvent<HTMLAnchorElement>) {
  if (!isPlainClick(event)) return;
  const target = document.getElementById(event.currentTarget.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView();
  (target.querySelector<HTMLElement>("h1, h2") ?? target).focus({ preventScroll: true });
}

function box(rect: Rect) {
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

function imageCover(frame: Rect, ratio: number, x = 0.5, y = 0.5, zoom = 1): Rect {
  const width = Math.max(frame.width, frame.height * ratio) * zoom;
  const height = width / ratio;
  return { width, height, left: frame.left + (frame.width - width) * x, top: frame.top + (frame.height - height) * y };
}

function capture({ frame, image }: Artwork) {
  const windowRect = { left: 0, top: 0, width: document.documentElement.clientWidth, height: window.innerHeight };
  const sourceFrame = frame.getBoundingClientRect();
  const ratio = image.naturalWidth / image.naturalHeight || 1.5;
  const [positionX, positionY] = getComputedStyle(image).objectPosition.split(" ").map((part) => (parseFloat(part) || 0) / 100);

  const left = Math.max(0, sourceFrame.left);
  const top = Math.max(0, sourceFrame.top);
  const width = Math.min(windowRect.width, sourceFrame.right) - left;
  const height = Math.min(windowRect.height, sourceFrame.bottom) - top;
  const visible = width > 0 && height > 36;
  const visibleFrame = visible
    ? { left, top, width, height }
    : { left: windowRect.width * 0.18, top: windowRect.height * 0.19, width: windowRect.width * 0.64, height: windowRect.height * 0.62 };
  const imageRect = visible
    ? imageCover(image.getBoundingClientRect(), ratio, positionX, positionY)
    : imageCover(visibleFrame, ratio);

  return { frame: visibleFrame, image: imageRect, ratio, window: windowRect, source: image.currentSrc || image.src, visible };
}

function relativeTo(image: Rect, frame: Rect): Rect {
  return { ...image, left: image.left - frame.left, top: image.top - frame.top };
}

function keepStyles(flight: Journey, elements: Element[]) {
  const styles = elements.map((element) => [element, element.getAttribute("style")] as const);
  (flight.restore ??= []).push(() => {
    for (const [element, style] of styles) {
      if (style === null) element.removeAttribute("style");
      else element.setAttribute("style", style);
    }
  });
}

export function CategoryJourney({ children }: { children: ReactNode }) {
  const router = useRouter();
  const surface = useRef<Partial<Record<Screen, Surface>>>({});
  const current = useRef<Journey | null>(null);
  const readyFocus = useRef<Pick<Journey, "to" | "room"> | null>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const projection = useRef<HTMLImageElement>(null);
  const scenery = useRef<HTMLDivElement>(null);
  const enteredFromHome = useRef<RoomSlug | null>(null);
  const prefetched = useRef(new Set<RoomSlug>());
  const handlers = useRef<{ pop: () => void; dispose: () => void } | null>(null);

  function release(flight: Journey, focus = false) {
    if (current.current !== flight) return;
    current.current = null;
    flight.timeline?.kill();
    flight.restore?.reverse().forEach((restore) => restore());
    window.clearTimeout(flight.timeout);
    if (flight.frameRequest !== undefined) cancelAnimationFrame(flight.frameRequest);
    if (overlay.current) overlay.current.hidden = true;
    if (scenery.current) scenery.current.replaceChildren();
    document.documentElement.classList.remove("category-in-flight");
    if (focus) surface.current[flight.to]?.focus(flight.room);
  }

  function land(flight: Journey) {
    if (current.current !== flight || !flight.covered || !flight.arrived || flight.frameRequest !== undefined) return;
    flight.frameRequest = requestAnimationFrame(() => {
      const destination = surface.current[flight.to];
      const view = frame.current;
      const image = projection.current;
      if (current.current !== flight || !destination || !view || !image) return;
      destination.align(flight.room);
      const shot = capture(destination.artwork(flight.room));
      const details = destination.details();
      keepStyles(flight, details);
      const arrival = flight.to !== "furniture"
        ? { opacity: 0, y: 26 }
        : { opacity: 0, x: -18 };

      flight.timeline = gsap.timeline({ defaults: { ease: "category-drawing" }, onComplete: () => release(flight, true) })
        .to(view, { ...box(shot.frame), duration: 0.68 }, 0)
        .to(image, { ...box(relativeTo(shot.image, shot.frame)), duration: 0.68 }, 0)
        .fromTo(details, arrival, { opacity: 1, x: 0, y: 0, duration: 0.52, stagger: 0.032, ease: "power3.out" }, 0.24);
    });
  }

  function showSceneCopy(from: Surface) {
    const layer = scenery.current;
    if (!layer) return;
    const snapshot = from.root.cloneNode(true) as HTMLElement;
    snapshot.inert = true;
    snapshot.removeAttribute("id");
    snapshot.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    snapshot.querySelectorAll("dialog[open]").forEach((dialog) => dialog.removeAttribute("open"));
    const bounds = from.root.getBoundingClientRect();
    snapshot.style.position = "absolute";
    snapshot.style.top = `${bounds.top}px`;
    snapshot.style.left = `${bounds.left}px`;
    snapshot.style.width = `${bounds.width}px`;
    layer.replaceChildren(snapshot);
    gsap.set(layer, { clearProps: "opacity,transform" });
  }

  function takeoff(flight: Journey, from: Surface, navigate?: () => void, pop = false) {
    const shell = overlay.current;
    const view = frame.current;
    const image = projection.current;
    if (!shell || !view || !image) {
      release(flight);
      navigate?.();
      return;
    }
    gsap.registerPlugin(CustomEase);
    CustomEase.create("category-drawing", drawingEase);

    document.documentElement.classList.add("category-in-flight");
    const shot = capture(from.artwork(flight.room));
    const full = shot.window;
    const zoom = imageCover(full, shot.ratio, 0.53, 0.5, 1.05);
    const useCopy = pop || !shot.visible;
    if (useCopy) showSceneCopy(from);

    image.src = shot.source;
    gsap.set(view, { ...box(shot.frame), opacity: shot.visible ? 1 : 0 });
    gsap.set(image, box(relativeTo(shot.image, shot.frame)));
    shell.hidden = false;

    const duration = matchMedia("(max-width: 820px)").matches ? 0.49 : 0.62;
    const departing = useCopy ? scenery.current : from.details();
    if (Array.isArray(departing)) keepStyles(flight, departing);
    flight.timeline = gsap.timeline({
      defaults: { ease: "category-drawing", duration },
      onComplete: () => {
        flight.covered = true;
        navigate?.();
        land(flight);
      },
    })
      .to(view, { ...box(full), opacity: 1 }, 0)
      .to(image, box(relativeTo(zoom, full)), 0);
    if (departing) {
      flight.timeline.to(departing, {
        opacity: 0, x: -14, duration: 0.37, ease: "power2.inOut",
        stagger: useCopy ? 0 : 0.014,
      }, 0.06);
    }

    flight.timeout = window.setTimeout(() => {
      release(flight);
      const target = withBase(flight.to === "furniture" ? furniturePath(flight.room) : roomPath(flight.room));
      if (navigate && `${location.pathname}${location.hash}` !== target) location.assign(target);
    }, 6000);
  }

  function preloadRoom(room: RoomSlug) {
    if (prefetched.current.has(room)) return;
    prefetched.current.add(room);
    router.prefetch(roomPath(room));
  }

  function openRoom(room: RoomSlug, prepare: () => Promise<void>) {
    if (current.current) return;
    const navigate = () => {
      const back = withBase(furniturePath(room));
      if (`${location.pathname}${location.hash}` !== back) history.replaceState(history.state, "", back);
      enteredFromHome.current = room;
      router.push(roomPath(room), { scroll: false });
    };
    const from = surface.current.furniture;
    if (!from || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from?.align(room);
      readyFocus.current = { to: room, room };
      navigate();
      return;
    }

    const flight: Journey = { to: room, room, covered: false, arrived: false };
    current.current = flight;
    void prepare().then(() => {
      if (current.current === flight) takeoff(flight, from, navigate);
    }, () => {
      if (current.current !== flight) return;
      release(flight);
      readyFocus.current = { to: room, room };
      navigate();
    });
  }

  function backToFurniture(room: RoomSlug, event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    if (current.current) return;
    const navigate = () => {
      if (enteredFromHome.current === room) router.back();
      else router.push(furniturePath(room), { scroll: false });
    };
    const from = surface.current[room];
    if (!from || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      readyFocus.current = { to: "furniture", room };
      navigate();
      return;
    }
    const flight: Journey = { to: "furniture", room, covered: false, arrived: false };
    current.current = flight;
    takeoff(flight, from, navigate);
  }

  function register(screen: Screen, endpoint: Surface) {
    surface.current[screen] = endpoint;
    const flight = current.current;
    const pending = readyFocus.current;
    let focusFrame: number | undefined;
    if (flight?.to === screen) {
      endpoint.align(flight.room);
      flight.arrived = true;
      land(flight);
    } else if (pending?.to === screen) {
      readyFocus.current = null;
      endpoint.align(pending.room);
      focusFrame = requestAnimationFrame(() => {
        endpoint.align(pending.room);
        endpoint.focus(pending.room);
      });
    }
    return () => {
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
      if (surface.current[screen] === endpoint) delete surface.current[screen];
    };
  }

  const [controls] = useState(() => ({ register, openRoom, preloadRoom, backToFurniture }));
  useEffect(() => {
    if (!handlers.current) {
      handlers.current = {
        pop: () => {
          const homeRoom = location.pathname === withBase("/") ? roomFromHash(location.hash) : undefined;
          const room = homeRoom ?? roomSlugs.find((slug) => withBase(roomPath(slug)) === `${location.pathname.replace(/\/$/, "")}/`);
          const to: Screen | undefined = homeRoom ? "furniture" : room;
          const running = current.current;
          if (running && running.to === to && running.room === room) return;
          if (running) release(running);
          if (!to || !room || surface.current[to]) return;
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            readyFocus.current = { to, room };
            return;
          }
          const from = surface.current[to === "furniture" ? room : "furniture"];
          if (!from) return;
          if (to !== "furniture") from.align(room);
          const flight: Journey = { to, room, covered: false, arrived: false };
          current.current = flight;
          takeoff(flight, from, undefined, true);
        },
        dispose: () => { if (current.current) release(current.current); },
      };
    }
    const active = handlers.current;
    window.addEventListener("popstate", active.pop, true);
    return () => {
      window.removeEventListener("popstate", active.pop, true);
      active.dispose();
    };
    // The persistent layout only uses DOM refs and the router from the initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <JourneyContext.Provider value={controls}>
      {children}
      <div className="category-flight" ref={overlay} hidden aria-hidden="true">
        <div className="flight-scenery" ref={scenery} />
        <div className="flight-frame" ref={frame}>
          <div className="flight-crop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={projection} alt="" />
          </div>
        </div>
      </div>
    </JourneyContext.Provider>
  );
}
