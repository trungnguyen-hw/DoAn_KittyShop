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

    const cartHandles = document.querySelectorAll("#site-cart-handle, .header-action_cart");
    cartHandles.forEach(handle => {
      handle.classList.remove("cart-pulse");
      // Trigger reflow to restart animation
      void handle.offsetWidth; 
      handle.classList.add("cart-pulse");
      const onEnd = () => {
        handle.classList.remove("cart-pulse");
        handle.removeEventListener("animationend", onEnd);
      };
      handle.addEventListener("animationend", onEnd);
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
