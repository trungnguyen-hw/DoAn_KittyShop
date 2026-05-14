import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* eslint-disable react-refresh/only-export-components -- hook colocated with provider for this demo store */

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const addToCart = useCallback(() => {
    setCount((c) => c + 1);
  }, []);
  const value = useMemo(() => ({ count, addToCart }), [count, addToCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
