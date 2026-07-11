import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HOST = "kidty-shop.myharavan.com";

function toAppPath(pathname, search) {
  let cleanPath = pathname;
  if (cleanPath.endsWith("/") && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (cleanPath === "/" || cleanPath === "") return `/${search}`;
  if (cleanPath === "/pages/ldp-kids-1") return `/pages/ldp-kids-1${search}`;
  if (cleanPath === "/collections/all") return `/collections/all${search}`;
  if (cleanPath === "/collections/san-pham") return `/collections/san-pham${search}`;
  if (cleanPath === "/blogs/news") return `/blogs/news${search}`;
  if (cleanPath.startsWith("/products/")) {
    return `${cleanPath}${search}`;
  }
  if (cleanPath === "/cart") return `/cart${search}`;
  if (cleanPath === "/checkout") return `/checkout${search}`;
  return null;
}

export function useKidtySpaNav() {
  const navigate = useNavigate();

  useEffect(() => {
    window.reactNavigate = (path) => {
      navigate(path);
    };
    return () => {
      delete window.reactNavigate;
    };
  }, [navigate]);

  useEffect(() => {
    const onClick = (e) => {
      const adminLink = e.target.closest(".header-admin-link");
      if (adminLink) {
        e.preventDefault();
        const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true" || localStorage.getItem("adminToken");
        if (isAdminLoggedIn) {
          navigate("/admin/dashboard");
        } else {
          navigate("/admin/login");
        }
        return;
      }

      const a = e.target.closest("a[href]");
      if (!a) return;

      const hrefAttr = a.getAttribute("href");
      if (hrefAttr && hrefAttr.startsWith("#")) return;

      let url;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.host !== HOST && url.host !== window.location.host) return;

      if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      const next = toAppPath(url.pathname, url.search);
      if (!next) return;
      e.preventDefault();
      navigate(next);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);
}

