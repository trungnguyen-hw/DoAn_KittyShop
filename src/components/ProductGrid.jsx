import ProductCard from "./ProductCard.jsx";

function ProductGrid({ products }) {
  const validProducts = (products || []).filter((product) => {
    return (
      product &&
      (product.name || product.title) &&
      (product.image || product.img || product.thumbnail) &&
      Number(product.price) > 0
    );
  });

  return (
    <div className="products-grid">
      {validProducts.map((product) => (
        <ProductCard key={product.id || product.slug} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
