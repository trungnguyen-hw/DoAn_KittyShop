// TODO: Replace with real API calls to backend in the future
export const cartService = {
  getCart() {
    try {
      const data = localStorage.getItem("kidty-cart");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
      return [];
    }
  },

  saveCart(items) {
    try {
      localStorage.setItem("kidty-cart", JSON.stringify(items));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  },

  addToCart(items, product) {
    const key = `${product.title}-${product.variant || "default"}`;
    const existingIndex = items.findIndex((item) => item.key === key);
    let newItems;
    if (existingIndex > -1) {
      newItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + product.quantity }
          : item
      );
    } else {
      newItems = [...items, { ...product, key }];
    }
    this.saveCart(newItems);
    return newItems;
  },

  updateQuantity(items, key, quantity) {
    const newItems = items
      .map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item));
    this.saveCart(newItems);
    return newItems;
  },

  removeFromCart(items, key) {
    const newItems = items.filter((item) => item.key !== key);
    this.saveCart(newItems);
    return newItems;
  },

  clearCart() {
    localStorage.removeItem("kidty-cart");
    return [];
  }
};
