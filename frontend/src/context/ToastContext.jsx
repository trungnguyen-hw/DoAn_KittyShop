/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getProductImage } from "../services/productService.js";
import "../toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", title = "", product = null) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Default titles based on type
    let defaultTitle = "Thông báo";
    if (type === "success") defaultTitle = "Đã thêm vào giỏ hàng";
    if (type === "error") defaultTitle = "Lỗi đơn hàng";
    if (type === "warning") defaultTitle = "Cảnh báo";

    const newToast = {
      id,
      message,
      type,
      title: title || defaultTitle,
      product: product || null,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3700);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose showToast globally for window.alert override
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.showToast = (msg, type, title, prod) => showToast(msg, type, title, prod);
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="kidty-toast-container">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  let icon = "🔔";

  if (toast.type === "success") {
    icon = "✓";
  } else if (toast.type === "error") {
    icon = "✕";
  } else if (toast.type === "warning") {
    icon = "⚠";
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 3400);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (path) => {
    if (window.reactNavigate) {
      window.reactNavigate(path);
    } else {
      window.location.href = path;
    }
    onClose();
  };

  const imageUrl = toast.product ? getProductImage(toast.product) : "";

  return (
    <div className={`kidty-toast-card ${toast.type} ${isExiting ? "exit" : "enter"}`}>
      <div className="kidty-toast-body">
        <div className="kidty-toast-icon">
          {icon}
        </div>
        <div className="kidty-toast-content">
          <h4 className="kidty-toast-title">
            {toast.title}
          </h4>
          <p className="kidty-toast-message">
            {toast.message}
          </p>
        </div>
        <button onClick={onClose} className="kidty-toast-close">
          &times;
        </button>
      </div>

      {toast.product && (
        <div className="kidty-toast-product">
          <img src={imageUrl} className="kidty-toast-product-img" alt="" />
          <div className="kidty-toast-product-info">
            <h5 className="kidty-toast-product-name">{toast.product.title}</h5>
            <p className="kidty-toast-product-qty">
              Số lượng: {toast.product.quantity} {toast.product.variant ? ` | Màu: ${toast.product.variant}` : ""}
            </p>
          </div>
        </div>
      )}

      {toast.product && (
        <div className="kidty-toast-actions">
          <button className="kidty-toast-btn secondary" onClick={() => handleAction("/cart")}>Xem giỏ hàng</button>
          <button className="kidty-toast-btn primary" onClick={() => handleAction("/checkout")}>Thanh toán</button>
        </div>
      )}
      <div className="kidty-toast-progress-bar"></div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
