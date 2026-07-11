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

  // Handle mobile menu outside clicks and link closures
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const activeMenu = document.querySelector(".header-action_menu.show-action");
      if (activeMenu) {
        const menuDrawer = activeMenu.querySelector(".site-menu");
        const menuToggle = document.getElementById("site-menu-handle");
        
        // Close if clicked on overlay, outside of drawer, or clicked on any link inside the menu
        if (e.target.classList.contains("site-overlay") || 
            (menuDrawer && !menuDrawer.contains(e.target) && !menuToggle.contains(e.target)) ||
            e.target.closest(".site-menu.menu-mobile a")) {
          activeMenu.classList.remove("show-action");
          document.body.classList.remove("locked-scroll");
        }
      }
    };

    document.addEventListener("click", handleOutsideClick, true);
    return () => document.removeEventListener("click", handleOutsideClick, true);
  }, []);

  // Handle main product gallery image fade transition on src change
  useEffect(() => {
    const mainImgs = document.querySelectorAll(".product-image-feature");
    const observers = [];

    mainImgs.forEach(img => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "src") {
            img.style.opacity = "0.3";
            setTimeout(() => {
              img.style.opacity = "1";
            }, 100);
          }
        });
      });
      observer.observe(img, { attributes: true });
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [prelude, header, children, postHtml]);

  return (
    <div id="kidty-theme" className={`${bodyClass || ""} page-fade-in`}>
      <div dangerouslySetInnerHTML={{ __html: prelude }} />
      <div dangerouslySetInnerHTML={{ __html: header }} />
      {children}
      <div dangerouslySetInnerHTML={{ __html: postHtml }} />
    </div>
  );
}
