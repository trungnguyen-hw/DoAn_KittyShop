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

  return (
    <div id="kidty-theme" className={bodyClass}>
      <div dangerouslySetInnerHTML={{ __html: prelude }} />
      <div dangerouslySetInnerHTML={{ __html: header }} />
      {children}
      <div dangerouslySetInnerHTML={{ __html: postHtml }} />
    </div>
  );
}
