// TODO: Replace with real API calls to backend in the future
export const orderService = {
  createOrder(orderData) {
    // Generate a mock order ID
    const orderId = "ORD-" + Math.floor(Math.random() * 900000 + 100000);
    const order = {
      id: orderId,
      ...orderData,
      createdAt: new Date().toISOString(),
    };
    
    // Save to orders history in localStorage
    try {
      const existing = localStorage.getItem("kidty-orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.push(order);
      localStorage.setItem("kidty-orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Error saving order to localStorage", e);
    }

    return order;
  }
};
