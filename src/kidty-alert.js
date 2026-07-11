if (typeof window !== "undefined") {
  // Override window.alert to route messages to the custom React Toast notification system
  window.alert = function (message) {
    if (window.showToast) {
      let type = "success";
      let title = "Thông báo";
      const msgLower = message.toLowerCase();
      
      if (msgLower.includes("thành công") || msgLower.includes("cảm ơn")) {
        type = "success";
        title = "Thành công";
      } else if (
        msgLower.includes("trống") || 
        msgLower.includes("vui lòng") || 
        msgLower.includes("bắt buộc")
      ) {
        type = "warning";
        title = "Cảnh báo";
      } else if (msgLower.includes("lỗi") || msgLower.includes("thất bại") || msgLower.includes("không")) {
        type = "error";
        title = "Lỗi";
      }
      
      window.showToast(message, type, title);
    } else {
      console.warn("React Toast system not initialized yet. Message:", message);
    }
  };
}
