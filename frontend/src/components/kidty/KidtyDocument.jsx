import { useEffect } from "react";
import { useKidtyCartBridge } from "./useKidtyCartBridge.js";
import { useKidtyLegacyScripts } from "./useKidtyLegacyScripts.js";
import { useKidtyScrollLockGuard } from "./useKidtyScrollLockGuard.js";
import { useKidtySpaNav } from "./useKidtySpaNav.js";

export function KidtyDocument({
  bodyClass,
  prelude,
  header,
  postHtml,
  scripts,
  children,
}) {
  useKidtyLegacyScripts(scripts);
  useKidtyScrollLockGuard();
  useKidtySpaNav();
  useKidtyCartBridge();

  useEffect(() => {
    document.body.className = bodyClass || "";
    document.body.removeAttribute("id");
  }, [bodyClass]);

  useEffect(() => {
    // Top-level containers and elements to reveal
    const selectors = [
      "#home-slider",
      ".wrapper-home-banner-top",
      ".section-collection",
      ".wrapper-home-information",
      "#home-gallery",
      "#home-brand",
      "footer",
      ".footer-layout",
      ".breadcrumb-shop",
      ".wrapper-cart-detail",
      ".layoutPage-cart",
      ".heading-page",
      ".wrapbox-content-cart",
      ".product-block",
      ".product-card"
    ];
    
    const elementsToReveal = [];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Only target elements that are not already active
        if (!el.classList.contains("reveal-active")) {
          el.classList.add("reveal-on-scroll");
          elementsToReveal.push(el);
        }
      });
    });

    // Stagger product grids
    const grids = document.querySelectorAll(".content-product-list, .row, .grid");
    grids.forEach(grid => {
      const cards = grid.querySelectorAll(".product-block, .product-card, .pro-loop");
      cards.forEach((card, index) => {
        card.style.transitionDelay = `${(index % 4) * 0.06}s`;
      });
    });

    // IntersectionObserver to reveal elements as they enter the viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
          // Stagger reveal on-scroll for children of grid containers if they are grid cards
          if (entry.target.matches(".product-block, .product-card, .pro-loop")) {
            entry.target.classList.add("reveal-active");
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -40px 0px"
    });

    elementsToReveal.forEach(el => observer.observe(el));

    return () => {
      elementsToReveal.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, [prelude, header, children, postHtml]);

  return (
    <div id="kidty-theme" className={bodyClass}>
      <div dangerouslySetInnerHTML={{ __html: prelude }} />
      <div dangerouslySetInnerHTML={{ __html: header }} />
      {children}
      <div dangerouslySetInnerHTML={{ __html: postHtml }} />
    </div>
  );
}
