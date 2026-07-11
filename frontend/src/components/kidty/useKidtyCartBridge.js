import { useEffect } from "react";
import { useCart } from "../../context/CartContext.jsx";

export function useKidtyCartBridge() {
  const { count, addToCart } = useCart();

  useEffect(() => {
    const elements = document.querySelectorAll(
      "#site-cart-handle .count, .header-action_cart .count"
    );
    elements.forEach(el => {
      el.textContent = String(count);
    });
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
