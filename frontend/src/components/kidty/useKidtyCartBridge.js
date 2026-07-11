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
      const btn = e.target.closest("#add-to-cart, #add-to-cartbottom");
      if (btn) {
        e.preventDefault();
        if (btn.classList.contains("btn-loading") || btn.classList.contains("btn-success-state")) {
          return;
        }

        const originalHtml = btn.innerHTML;
        
        // Add loading state
        btn.classList.add("btn-loading");
        btn.innerHTML = `<span class="btn-spinner"></span> Đang thêm...`;
        btn.style.pointerEvents = "none";
        
        // Trigger cart count update after a premium artificial delay (500ms)
        setTimeout(() => {
          addToCart();
          
          // Switch to success checkmark state
          btn.classList.remove("btn-loading");
          btn.classList.add("btn-success-state");
          btn.innerHTML = `✓ Đã thêm!`;
          
          // Revert button to original state after 1.5s
          setTimeout(() => {
            btn.classList.remove("btn-success-state");
            btn.innerHTML = originalHtml;
            btn.style.pointerEvents = "auto";
          }, 1500);
        }, 500);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [addToCart]);
}
