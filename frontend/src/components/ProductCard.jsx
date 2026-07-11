/* eslint-disable react-refresh/only-export-components */

export const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("vi-VN") + "";
};

export default function ProductCard({ product }) {
  if (
    !product ||
    !(product.name || product.title) ||
    !(product.image || product.img || product.thumbnail)
  ) {
    return null;
  }

  const localUrl = `/products/${product.slug || product.id || "dam-hoa-cong-chua-fm-45"}`;

  let discountPercent = null;
  const price = Number(product.price);
  const oldPrice = Number(product.oldPrice || product.old_price || 0);

  if (oldPrice && oldPrice > price) {
    discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  const getImageUrl = (img) => {
    if (!img) return "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg";
    if (img.startsWith("http") || img.startsWith("https") || img.startsWith("/")) return img;
    return "/" + img;
  };

  const title = product.title || product.name;
  const image = getImageUrl(product.image || product.img || product.thumbnail);

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        {discountPercent && (
          <div className="product-sale" style={{ position: "absolute", top: "10px", left: "10px", background: "#f94c43", color: "#fff", padding: "3px 8px", fontSize: "12px", fontWeight: "bold", borderRadius: "3px", zIndex: 2 }}>
            <span>-{discountPercent}%</span>
          </div>
        )}
        <a href={localUrl} title={title} style={{ width: "100%", height: "100%", display: "block" }}>
          <img className="product-image" alt={title} src={image} />
        </a>
      </div>
      <div className="product-info">
        <h3 className="product-title">
          <a href={localUrl} title={title}>{title}</a>
        </h3>
        <div className="product-price-row" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span className="product-price">{formatPrice(price)}</span>
          {oldPrice > price && (
            <span className="product-old-price">{formatPrice(oldPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
