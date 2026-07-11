import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function resetBodyScrollArtifacts() {
  document.body.classList.remove("locked-scroll", "modal-open", "open_layer");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
}

function isProductZoomVisible() {
  const el = document.getElementById("divzoom");
  if (!el) return false;
  const st = window.getComputedStyle(el);
  return st.display !== "none" && st.visibility !== "hidden";
}

/** True when theme intentionally locked scroll (drawer, modal, or zoom layer). */
function scrollLockIsExpected() {
  const hasOpenHeaderPanel = Boolean(
    document.querySelector(".header-action.show-action"),
  );
  const hasOpenBs3Modal = Boolean(document.querySelector(".modal.fade.in"));
  const zoomWithLayer =
    document.body.classList.contains("open_layer") && isProductZoomVisible();
  return hasOpenHeaderPanel || hasOpenBs3Modal || zoomWithLayer;
}

function releaseIfStuck() {
  if (scrollLockIsExpected()) return;
  if (document.body.classList.contains("locked-scroll")) {
    document.body.classList.remove("locked-scroll");
  }
  if (document.body.classList.contains("modal-open")) {
    resetBodyScrollArtifacts();
  }
  if (document.body.classList.contains("open_layer") && !isProductZoomVisible()) {
    document.body.classList.remove("open_layer");
  }
}

/**
 * Haravan legacy jQuery leaves `locked-scroll` / `modal-open` on <body> or keeps a
 * full-viewport .site-overlay that captures wheel events. React route changes do
 * not clear those. This hook clears stuck locks and resets artifacts on unmount.
 */
export function useKidtyScrollLockGuard() {
  const { pathname } = useLocation();

  useEffect(() => {
    resetBodyScrollArtifacts();
    releaseIfStuck();
  }, [pathname]);

  useEffect(() => {
    releaseIfStuck();
    const t1 = window.setTimeout(releaseIfStuck, 400);
    const t2 = window.setTimeout(releaseIfStuck, 1200);

    const obs = new MutationObserver(() => {
      releaseIfStuck();
    });
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      obs.disconnect();
      resetBodyScrollArtifacts();
    };
  }, []);
}
