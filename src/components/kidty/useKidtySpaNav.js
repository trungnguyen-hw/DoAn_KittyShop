import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HOST = "kidty-shop.myharavan.com";

function toAppPath(pathname, search) {
  if (pathname === "/" || pathname === "") return `/${search}`;
  if (pathname === "/pages/ldp-kids-1") return `/pages/ldp-kids-1${search}`;
  if (pathname === "/collections/all") return `/collections/all${search}`;
  if (pathname === "/collections/san-pham") return `/collections/san-pham${search}`;
  if (pathname === "/blogs/news") return `/blogs/news${search}`;
  if (pathname === "/products/dam-hoa-cong-chua-fm-45") {
    return `/products/dam-hoa-cong-chua-fm-45${search}`;
  }
  return null;
}

export function useKidtySpaNav() {
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      let url;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.host !== HOST) return;
      const next = toAppPath(url.pathname, url.search);
      if (!next) return;
      e.preventDefault();
      navigate(next);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);
}
