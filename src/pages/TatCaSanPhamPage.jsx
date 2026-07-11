import React, { useLayoutEffect, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import after from "../generated/tat-ca-main-after.html?raw";
import before from "../generated/tat-ca-main-before.html?raw";
import header from "../generated/tat-ca-header.html?raw";
import postHtml from "../generated/tat-ca-post.html?raw";
import prelude from "../generated/tat-ca-prelude.html?raw";
import scripts from "../generated/tat-ca-scripts.json";
import { TatCaPagination } from "../components/TatCaPagination.jsx";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";
import { productService } from "../services/productService.js";
import ProductCard from "../components/ProductCard.jsx";

// Combine HTML layout. The product-list-host is placed inside the open .row.filter-here div, which is later closed by after.
const fullHtml = before + '<div id="product-list-host"></div>' + after;

// Memoize the main HTML container to prevent React from re-writing dangerouslySetInnerHTML and destroying Portal hosts
const StaticMain = React.memo(({ html }) => {
  return (
    <main
      className="mainContent-theme "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

const getImageUrl = (image) => {
  if (!image) return "/Sản Phẩm – Kidty Shop_files/pro-3_grande.jpg";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return "/" + image;
};

const normalizeProduct = (product) => {
  if (!product) product = {};
  
  // Extract and clean name/title
  const name = product.name || product.title || "Sản phẩm Kidty";
  
  // Extract and clean price
  let price = Number(product.price);
  if (isNaN(price) || price <= 0) {
    price = 450000; // Fallback to standard vest price if corrupted
  }
  
  let oldPrice = Number(product.old_price || product.oldPrice);
  if (isNaN(oldPrice)) {
    oldPrice = 0;
  }

  // Extract and clean image
  let rawImage = product.image || product.img || product.thumbnail || "";
  if (!rawImage || rawImage === "undefined" || rawImage.includes("placeholder")) {
    rawImage = "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg";
  }
  const image = getImageUrl(rawImage);

  return {
    id: product.id || "ao-vest-be-trai-fm-v5",
    name: name,
    title: name,
    slug: product.slug || product.id || "ao-vest-be-trai-fm-v5",
    price: price,
    oldPrice: oldPrice,
    image: image,
    description: product.description || "",
    discount: product.discount || null,
    stock: product.stock || 0,
  };
};

export default function TatCaSanPhamPage() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(() =>
    productService.getProducts().map(normalizeProduct)
  );
  const [listHost, setListHost] = useState(null);
  const [pagiHost, setPagiHost] = useState(null);

  // Fetch products from backend or fallback to local products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/products");
        const data = await res.json();
        const apiProducts = Array.isArray(data)
          ? data
          : data.data || data.products || [];
        
        if (apiProducts.length > 0) {
          const normalized = apiProducts.map(normalizeProduct);
          setProducts(normalized);
          console.log("products.length from API after normalization:", normalized.length);
        } else {
          const localData = productService.getProducts().map(normalizeProduct);
          setProducts(localData);
          console.log("API returned empty, fallback to local products, count:", localData.length);
        }
      } catch (err) {
        const localData = productService.getProducts().map(normalizeProduct);
        console.warn("API products failed, fallback to local products, count:", localData.length, err);
        setProducts(localData);
      }
    }
    loadProducts();
  }, []);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setListHost(document.getElementById("product-list-host"));
    setPagiHost(document.getElementById("pagination"));
  }, []);

  const validProducts = (products || []).filter((product) => {
    return (
      product &&
      (product.name || product.title) &&
      (product.image || product.img || product.thumbnail) &&
      Number(product.price) > 0
    );
  });

  const PRODUCTS_PER_PAGE = 8;
  const displayedProducts = validProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  const totalPages = Math.ceil(validProducts.length / PRODUCTS_PER_PAGE) || 1;

  return (
    <KidtyDocument
      bodyClass="collection"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <StaticMain html={fullHtml} />
      {listHost && createPortal(
        validProducts.length > 0 ? (
          <div className="products-grid">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center no-product" style={{ padding: "40px 15px", width: "100%" }}>
            <p style={{ fontSize: "16px", color: "#666" }}>Không có sản phẩm để hiển thị</p>
          </div>
        ),
        listHost
      )}
      {pagiHost && validProducts.length > 0 && createPortal(
        <TatCaPagination page={page} onChangePage={setPage} totalPages={totalPages} />,
        pagiHost
      )}
    </KidtyDocument>
  );
}
