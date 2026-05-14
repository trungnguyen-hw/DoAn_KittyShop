import { useEffect } from "react";
import { useCart } from "../../context/CartContext.jsx";

export function useKidtyCartBridge() {
  const { count, addToCart } = useCart();

  useEffect(() => {
    const el = document.querySelector(
      "#site-cart-handle .count, .header-action_cart .count",
    );
    if (el) el.textContent = String(count);
  }, [count]);

  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest("#add-to-cart")) {
        e.preventDefault();
        addToCart();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [addToCart]);
}
