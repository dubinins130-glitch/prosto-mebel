"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Motion() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = document.querySelector("[data-hero]");
      if (hero && window.scrollY < 80 && !window.location.hash) {
        const lines = hero.querySelectorAll("[data-line]");
        const photo = hero.querySelector("[data-hero-image]");
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(lines, { yPercent: 112, duration: 0.82, stagger: 0.095, clearProps: "transform" }, 0)
          .from(hero.querySelectorAll("[data-hero-meta]"), { y: 14, opacity: 0, duration: 0.65, clearProps: "transform,opacity" }, 0.24)
          .fromTo(photo, { clipPath: "inset(8% 0 100% 0)" }, {
            clipPath: "inset(0% 0 0% 0)", duration: 1.1, ease: "power4.inOut", clearProps: "clipPath",
          }, 0.04);
      }

      const viewportHeight = window.innerHeight;
      const belowFold = (element: Element) => element.getBoundingClientRect().top > viewportHeight;
      document.querySelectorAll("[data-heading]").forEach((heading) => {
        if (!belowFold(heading)) return;
        gsap.from(heading.querySelectorAll("[data-line]"), {
          yPercent: 105, duration: 0.74, stagger: 0.085, ease: "power3.out", clearProps: "transform",
          scrollTrigger: { trigger: heading, start: "top 94%", once: true },
        });
      });

      document.querySelectorAll("[data-picture]").forEach((frame) => {
        if (!belowFold(frame)) return;
        gsap.fromTo(frame, { clipPath: "inset(0% 0% 20% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", duration: 0.98, ease: "power3.inOut", clearProps: "clipPath",
          scrollTrigger: { trigger: frame, start: "top 96%", once: true },
        });
      });

      document.querySelectorAll("[data-rule]").forEach((rule) => {
        if (!belowFold(rule)) return;
        gsap.from(rule, {
          scaleX: 0, transformOrigin: "0% 50%", duration: 0.85, ease: "power3.inOut", clearProps: "transform,transformOrigin",
          scrollTrigger: { trigger: rule, start: "top 94%", once: true },
        });
      });
    });

    motion.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll('[data-picture="parallax"]').forEach((frame) => {
        gsap.fromTo(frame.querySelector("img"), { yPercent: -3 }, {
          yPercent: 3, ease: "none",
          scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.5 },
        });
      });
    });

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => motion.revert();
  }, []);

  return null;
}
