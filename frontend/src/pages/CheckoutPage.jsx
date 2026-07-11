import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

import { request } from "../services/api.js";
import prelude from "../generated/checkout-prelude.html?raw";
import header from "../generated/checkout-header.html?raw";
import postHtml from "../generated/checkout-post.html?raw";
import scripts from "../generated/checkout-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";
import SuccessModal from "../components/kidty/SuccessModal.jsx";

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Retrieve cart directly from localStorage
    let currentCart = [];
    try {
      const savedCart = localStorage.getItem("kidty-cart");
      if (savedCart) {
        currentCart = JSON.parse(savedCart);
      }
    } catch (err) {
      console.error("Error reading kidty-cart from localStorage:", err);
    }

    const finalCartItems = currentCart.length > 0 ? currentCart : cartItems;

    if (finalCartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setSubmitting(true);

    // Format fields matching backend requirements
    const orderData = {
      customer_name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      payment_method: paymentMethod || "COD",
      note: note || "",
      items: finalCartItems.map(item => ({
        product_id: item.id || item.product_id,
        product_name: item.title || item.name,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        image: item.image || null,
        variant: item.variant || ""
      }))
    };

    let placedOrder;

    try {
      const result = await request("/orders", {
        method: "POST",
        body: orderData
      });

      placedOrder = {
        id: result.orderCode, // Display order code returned by backend
        order_code: result.orderCode,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod,
        note,
        totalPrice,
        createdAt: new Date().toISOString()
      };
      // Only clear the cart after the backend has persisted the order.
      localStorage.removeItem("kidty-cart");

      clearCart();
      window.dispatchEvent(new Event("storage"));

      setSuccessOrder(placedOrder);
    } catch (err) {
      console.error("API checkout error:", err);
      const errMsg = err.message || "Lỗi đặt hàng, vui lòng thử lại!";
      if (window.showToast) {
        window.showToast(errMsg, "error", "Đặt hàng thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KidtyDocument
      bodyClass="checkout"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="mainContent-theme main-checkout">
        <div className="layoutPage-cart" id="layout-cart">
          <div className="breadcrumb-shop">
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 pd5">
                  <ol className="breadcrumb breadcrumb-arrows">
                    <li>
                      <Link to="/">Trang chủ</Link>
                    </li>
                    <li>
                      <Link to="/cart">Giỏ hàng</Link>
                    </li>
                    <li className="active">
                      <span>Thanh toán</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div className="wrapper-cart-detail">
            <div className="container-fluid">
              <div className="heading-page">
                <div className="header-page">
                  <h1>Thanh toán đơn hàng</h1>
                </div>
              </div>
              <div className="row wrapbox-content-cart" style={{ padding: "20px 0" }}>
                <div className="col-md-8 col-sm-8 col-xs-12">
                  <div
                    className="cart-container"
                    style={{
                      background: "#fff",
                      padding: "25px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      marginBottom: "20px",
                    }}
                  >
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: "20px",
                        fontWeight: "bold",
                        fontSize: "1.6em",
                        borderBottom: "2px solid #eee",
                        paddingBottom: "10px",
                        color: "#333",
                      }}
                    >
                      Thông tin giao hàng
                    </h2>
                    <form id="checkout-form" onSubmit={handleSubmit}>
                      <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label htmlFor="billingName" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          id="billingName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            fontSize: "1em",
                          }}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label htmlFor="billingPhone" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          id="billingPhone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            fontSize: "1em",
                          }}
                          placeholder="0901234567"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label htmlFor="billingAddress" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                          Địa chỉ nhận hàng *
                        </label>
                        <input
                          type="text"
                          id="billingAddress"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            fontSize: "1em",
                          }}
                          placeholder="Số 123, Đường ABC, Phường X, Quận Y"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label htmlFor="paymentMethod" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                          Phương thức thanh toán *
                        </label>
                        <select
                          id="paymentMethod"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            background: "white",
                            boxSizing: "border-box",
                            fontSize: "1em",
                          }}
                        >
                          <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                          <option value="bank">Chuyển khoản ngân hàng</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label htmlFor="orderNote" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                          Ghi chú (Tùy chọn)
                        </label>
                        <textarea
                          id="orderNote"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            height: "90px",
                            boxSizing: "border-box",
                            fontSize: "1em",
                          }}
                          placeholder="Ghi chú về đơn hàng của bạn..."
                        ></textarea>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12">
                  <div
                    className="sidebox-order"
                    style={{
                      background: "#fff",
                      padding: "25px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="sidebox-order-inner">
                      <div
                        className="sidebox-order_title"
                        style={{
                          borderBottom: "1px solid #eee",
                          paddingBottom: "12px",
                          marginBottom: "15px",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "1.3em", fontWeight: "bold", color: "#333" }}>
                          TÓM TẮT ĐƠN HÀNG
                        </h3>
                      </div>
                      <div className="sidebox-order_total" style={{ padding: "10px 0" }}>
                        {cartItems.map((item) => (
                          <div
                            key={item.key}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.95em",
                              color: "#555",
                              margin: "10px 0",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ flex: 1, paddingRight: "10px" }}>
                              {item.title} {item.variant ? `(${item.variant})` : ""} x {item.quantity}
                            </span>
                            <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString("vi-VN")}₫</span>
                          </div>
                        ))}
                        <div style={{ borderTop: "1px solid #eee", margin: "15px 0" }}></div>
                        <p style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1em", color: "#666", margin: "8px 0" }}>
                          <span>Tạm tính:</span>
                          <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
                        </p>
                        <p style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1em", color: "#666", margin: "8px 0" }}>
                          <span>Giao hàng:</span>
                          <span style={{ color: "#27ae60", fontWeight: "bold" }}>Miễn phí</span>
                        </p>
                        <div style={{ borderTop: "1px solid #eee", marginTop: "15px", paddingTop: "15px" }}>
                          <p style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3em", fontWeight: "bold", margin: 0 }}>
                            <span>Tổng cộng:</span>
                            <span className="checkout-total-price" style={{ color: "#f53d2d" }}>
                              {totalPrice.toLocaleString("vi-VN")}₫
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="sidebox-order_action" style={{ marginTop: "25px" }}>
                        <button
                          type="submit"
                          form="checkout-form"
                          className={`button dark ${submitting ? "btn-loading" : ""}`}
                          disabled={submitting}
                          style={{
                            width: "100%",
                            padding: "14px",
                            fontSize: "1.1em",
                            fontWeight: "bold",
                            background: submitting ? "#999" : "#f53d2d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: submitting ? "not-allowed" : "pointer",
                            textTransform: "uppercase",
                            transition: "all 0.2s",
                          }}
                        >
                          {submitting ? (
                            <>
                              <span className="btn-spinner"></span> ĐANG XỬ LÝ...
                            </>
                          ) : (
                            "Đặt hàng ngay"
                          )}
                        </button>
                        <p style={{ textAlign: "center", marginTop: "15px", marginBottom: 0 }}>
                          <Link to="/cart" style={{ color: "#0066cc", textDecoration: "none" }}>
                            <i className="fa fa-reply" style={{ marginRight: "5px" }}></i> Quay lại giỏ hàng
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {successOrder && (
        <SuccessModal
          order={successOrder}
          onHome={() => navigate("/")}
          onContinue={() => navigate("/collections/all")}
        />
      )}
    </KidtyDocument>
  );
}
