import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HOST = "kidty-shop.myharavan.com";

function toAppPath(pathname, search) {
  if (pathname === "/" || pathname === "") return `/${search}`;
  if (pathname === "/pages/ldp-kids-1") return `/pages/ldp-kids-1${search}`;
  if (pathname === "/collections/all") return `/collections/all${search}`;
  if (pathname === "/collections/san-pham") return `/collections/san-pham${search}`;
  if (pathname === "/blogs/news") return `/blogs/news${search}`;
  if (pathname.startsWith("/products/")) {
    return `${pathname}${search}`;
  }
  if (pathname === "/cart") return `/cart${search}`;
  if (pathname === "/checkout") return `/checkout${search}`;
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
      let url;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.host !== HOST && url.host !== window.location.host) return;
      const next = toAppPath(url.pathname, url.search);
      if (!next) return;
      e.preventDefault();
      navigate(next);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);
}

