import { useEffect } from "react";

/**
 * Injects body-end scripts from the saved Haravan HTML (external + inline),
 * because HTML assigned via innerHTML does not execute script tags.
 */
export function useKidtyLegacyScripts(scripts) {
  useEffect(() => {
    if (!scripts?.length) return;
    const created = [];
    for (const s of scripts) {
      const el = document.createElement("script");
      el.dataset.kidtyLegacy = "1";
      if (s.kind === "external") {
        el.src = s.src;
        el.async = false;
      } else {
        el.textContent = s.code;
      }
      document.body.appendChild(el);
      created.push(el);
    }
    return () => {
      for (const el of created) {
        el.remove();
      }
    };
  }, [scripts]);
}
