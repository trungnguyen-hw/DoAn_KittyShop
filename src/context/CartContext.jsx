import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { cartService } from "../services/cartService.js";
import { useToast } from "./ToastContext.jsx";

/* eslint-disable react-refresh/only-export-components -- hook colocated with provider for this demo store */

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => cartService.getCart());
  const { showToast } = useToast();

  const count = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
  }, [cartItems]);

  const syncCart = useCallback(() => {
    setCartItems(cartService.getCart());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, [syncCart]);

  const addToCart = useCallback((product = null) => {
    let prod = product;
    if (!prod) {
      try {
        const titleEl = document.querySelector(".product-title h1, h1");
        const priceEl = document.querySelector(".product-price span, .price-now, .pro-price");
        const imgEl = document.querySelector("#product-featured-image, .product-image-feature, img");
        
        const title = titleEl ? titleEl.textContent.trim() : "Đầm Hoa Công Chúa FM-45";
        let price = 389000;
        if (priceEl) {
          const cleanPrice = priceEl.textContent.replace(/[^0-9]/g, "");
          if (cleanPrice) price = Number(cleanPrice);
        }
        
        let image = "/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1_files/pro-16_master.jpg";
        if (imgEl) {
          const src = imgEl.getAttribute("src");
          if (src) image = src;
        }

        const qtyEl = document.querySelector("#quantity, .quantity-selector");
        const quantity = qtyEl ? Math.max(1, Number(qtyEl.value) || 1) : 1;

        const sizeEl = document.querySelector(".swatch-element.size input:checked, select[name='size']");
        const colorEl = document.querySelector(".swatch-element.color input:checked, select[name='color']");
        
        let sizeVal = sizeEl ? (sizeEl.value || sizeEl.textContent).trim() : "";
        let colorVal = colorEl ? (colorEl.value || colorEl.textContent).trim() : "";
        let variantStr = [colorVal, sizeVal].filter(Boolean).join(" / ");

        let id = "dam-hoa-cong-chua-fm-45";
        const path = window.location.pathname;
        if (path.includes("/products/")) {
          id = path.split("/").pop();
        }

        prod = {
          id,
          title,
          price,
          image,
          quantity,
          variant: variantStr || "Hồng / 100"
        };
      } catch (err) {
        console.error("Error parsing product from DOM:", err);
        prod = {
          id: "dam-hoa-cong-chua-fm-45",
          title: "Đầm Hoa Công Chúa FM-45",
          price: 389000,
          image: "/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1_files/pro-16_master.jpg",
          quantity: 1,
          variant: "Hồng / 100"
        };
      }
    }

    setCartItems((prev) => {
      const updated = cartService.addToCart(prev, prod);
      window.dispatchEvent(new Event("storage"));
      
      showToast(
        `Đã thêm ${prod.quantity} x ${prod.title} vào giỏ hàng`,
        "success",
        "Thêm giỏ hàng thành công",
        prod
      );

      return updated;
    });
  }, [showToast]);

  const updateQuantity = useCallback((key, quantity) => {
    setCartItems((prev) => {
      const updated = cartService.updateQuantity(prev, key, quantity);
      window.dispatchEvent(new Event("storage"));
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCartItems((prev) => {
      const updated = cartService.removeFromCart(prev, key);
      window.dispatchEvent(new Event("storage"));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    cartService.clearCart();
    window.dispatchEvent(new Event("storage"));
  }, []);

  const value = useMemo(() => ({
    count,
    cartItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  }), [count, cartItems, totalPrice, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

