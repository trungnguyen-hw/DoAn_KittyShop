
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import prelude from "../generated/cart-prelude.html?raw";
import header from "../generated/cart-header.html?raw";
import postHtml from "../generated/cart-post.html?raw";
import scripts from "../generated/cart-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

export default function CartPage() {
  const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    navigate("/checkout");
  };

  return (
    <KidtyDocument
      bodyClass="cart"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="mainContent-theme main-cart">
        <div className="layoutPage-cart" id="layout-cart">
          <div className="breadcrumb-shop">
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 pd5">
                  <ol className="breadcrumb breadcrumb-arrows">
                    <li>
                      <Link to="/">Trang chủ</Link>
                    </li>
                    <li className="active">
                      <span>Giỏ hàng ({cartItems.length})</span>
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
                  <h1>Giỏ hàng của bạn</h1>
                  <p className="count-cart">
                    Có <span>{cartItems.length} sản phẩm</span> trong giỏ hàng
                  </p>
                </div>
              </div>
              <div className="row wrapbox-content-cart">
                <div className="col-md-8 col-sm-8 col-xs-12 contentCart-detail">
                  <div className="cart-container">
                    {cartItems.length === 0 ? (
                      <div className="expanded-message">
                        <p className="cart-empty">Giỏ hàng của bạn đang trống</p>
                      </div>
                    ) : (
                      <form id="cartformpage">
                        <table className="table-cart">
                          <tbody>
                            {cartItems.map((item) => (
                              <tr key={item.key} className="line-item-container" data-variant-id={item.key}>
                                <td className="image">
                                  <img src={item.image} alt={item.title} />
                                </td>
                                <td className="item">
                                  <h3>
                                    {/* Link to product detail page locally */}
                                    <Link to={`/products/${item.id}`}>{item.title}</Link>
                                  </h3>
                                  {item.variant && <p className="variant">{item.variant}</p>}
                                  <p className="price">
                                    <span className="pri">{item.price.toLocaleString("vi-VN")}₫</span>
                                  </p>
                                  <div className="quantity-area clearfix">
                                    <input
                                      type="button"
                                      value="-"
                                      className="qty-btn"
                                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                    />
                                    <input
                                      type="text"
                                      value={item.quantity}
                                      className="quantity-selector"
                                      readOnly
                                    />
                                    <input
                                      type="button"
                                      value="+"
                                      className="qty-btn"
                                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                    />
                                  </div>
                                </td>
                                <td className="remove">
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      removeFromCart(item.key);
                                    }}
                                    className="cart-remove"
                                  >
                                    <i className="fa fa-trash-o"></i> Xóa
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </form>
                    )}
                  </div>
                </div>
                <div className="col-md-4 col-sm-4 col-xs-12 sidebarCart-sticky">
                  <div className="sidebox-order">
                    <div className="sidebox-order-inner">
                      <div className="sidebox-order_title">
                        <h3>Thông tin đơn hàng</h3>
                      </div>
                      <div className="sidebox-order_total">
                        <p>
                          Tổng tiền:
                          <span className="total-price">{totalPrice.toLocaleString("vi-VN")}₫</span>
                        </p>
                      </div>
                      <div className="sidebox-order_text">
                        <p>
                          Phí vận chuyển sẽ được tính ở trang thanh toán.
                          <br />
                          Bạn cũng có thể nhập mã giảm giá ở trang thanh toán.
                        </p>
                      </div>
                      <div className="sidebox-order_action">
                        <a href="#" className="button dark btncart-checkout" onClick={handleCheckoutClick}>
                          THANH TOÁN
                        </a>
                        <p className="link-continue text-center">
                          <Link to="/collections/all">
                            <i className="fa fa-reply"></i> Tiếp tục mua hàng
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
    </KidtyDocument>
  );
}
