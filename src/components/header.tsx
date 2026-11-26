"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { company, navigation } from "@/content/site";
import { Arrow, Brand } from "./primitives";

export function Header() {
  const menu = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const closing = useRef(false);

  useEffect(() => () => { animation.current?.kill(); }, []);

  function openMenu() {
    const dialog = menu.current;
    const content = panel.current;
    if (!dialog || !content || dialog.open) return;

    closing.current = false;
    dialog.showModal();
    toggle.current?.setAttribute("aria-expanded", "true");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = content.querySelectorAll("[data-menu-row]");
    animation.current = gsap.timeline()
      .fromTo(content, { yPercent: -10, clipPath: "inset(0 0 100% 0)" }, {
        yPercent: 0, clipPath: "inset(0 0 0% 0)", duration: 0.68, ease: "power4.inOut",
      })
      .fromTo(rows, { y: 22, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.04, duration: 0.36, ease: "power3.out", clearProps: "transform,opacity",
      }, 0.26);
  }

  function closeMenu(href?: string) {
    const dialog = menu.current;
    const content = panel.current;
    if (!dialog?.open || !content || closing.current) return;
    closing.current = true;
    animation.current?.kill();

    function finish() {
      dialog?.close();
      if (content) gsap.set([content, ...content.querySelectorAll("[data-menu-row]")], { clearProps: "all" });
      toggle.current?.setAttribute("aria-expanded", "false");
      if (!href) {
        toggle.current?.focus({ preventScroll: true });
        return;
      }
      if (location.hash !== href) history.pushState(null, "", href);
      const destination = document.getElementById(href.slice(1));
      destination?.scrollIntoView();
      destination?.querySelector<HTMLElement>("h1, h2")?.focus({ preventScroll: true });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    animation.current = gsap.timeline({ onComplete: finish })
      .to(content, { clipPath: "inset(0 0 100% 0)", yPercent: -7, duration: 0.38, ease: "power3.inOut" });
  }

  return (
    <>
      <a className="skip-link" href="#top">К содержанию</a>
      <header className="site-header">
        <div className="shell header-inner">
          <Brand />
          <nav className="header-nav" aria-label="Разделы сайта">
            {navigation.slice(1, 4).map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <button ref={toggle} className="menu-toggle" type="button" aria-expanded="false" aria-haspopup="dialog" aria-controls="site-menu" onClick={openMenu}>
            <span>Меню</span><span className="menu-rails" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>
      <dialog
        id="site-menu"
        className="menu-dialog"
        aria-labelledby="menu-title"
        ref={menu}
        onCancel={(event) => { event.preventDefault(); closeMenu(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}
      >
        <div className="menu-panel" ref={panel}>
          <div className="shell">
            <div className="menu-panel-head">
              <a href="#top" className="menu-brand" id="menu-title" onClick={(event) => { event.preventDefault(); closeMenu("#top"); }}>{company.name}</a>
              <button type="button" className="menu-toggle" autoFocus onClick={() => closeMenu()}>
                <span>Закрыть</span><span className="menu-rails menu-rails-close" aria-hidden="true"><i /><i /></span>
              </button>
            </div>
            <div className="menu-layout">
              <nav className="overlay-nav" aria-label="Основное меню">
                {navigation.map(({ href, label }) => (
                  <a key={href} href={href} data-menu-row onClick={(event) => { event.preventDefault(); closeMenu(href); }}>
                    {label}<Arrow />
                  </a>
                ))}
              </nav>
              <div className="menu-address" data-menu-row>
                <span>{company.contactLocation}</span>
                {company.phoneHref && <a href={company.phoneHref}>{company.phone}</a>}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
