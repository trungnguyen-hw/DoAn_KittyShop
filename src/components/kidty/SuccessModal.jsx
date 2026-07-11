import "../../success-modal.css";

export default function SuccessModal({ order, onHome, onContinue }) {
  return (
    <div className="kidty-modal-overlay">
      <div className="kidty-modal-card">
        <div className="kidty-modal-check-container">
          ✓
        </div>
        <h2 className="kidty-modal-title">Đặt hàng thành công!</h2>
        <div className="kidty-modal-order-tag">
          Mã đơn hàng: {order.id}
        </div>
        <p className="kidty-modal-text">
          Cảm ơn bạn đã mua hàng tại Kidty Shop.<br />
          Đơn hàng của bạn đang được chuẩn bị và sẽ sớm được giao đến bạn.
        </p>
        <div className="kidty-modal-actions">
          <button className="kidty-modal-btn primary" onClick={onHome}>
            Về trang chủ
          </button>
          <button className="kidty-modal-btn secondary" onClick={onContinue}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
