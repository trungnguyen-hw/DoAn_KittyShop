// Product management service for Kidty Shop Admin Dashboard
// Seed initial products from current mock product list

const DEFAULT_PRODUCTS = [
  {
    id: "ao-vest-be-trai-fm-v5",
    title: "Áo vest bé trai FM V5",
    price: 450000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-10_master.jpg",
    description: "Áo vest sang trọng cho bé trai. Thích hợp đi tiệc, đi đám cưới, chất liệu cao cấp thoáng mát.",
    category: "Bé Trai",
    stock: 24
  },
  {
    id: "body-be-trai-hinh-sieu-nhan",
    title: "Body bé trai hình siêu nhân",
    price: 189000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-1_master.jpg",
    description: "Bộ body đáng yêu hình siêu nhân cho bé trai năng động, chất thun cotton co giãn tốt.",
    category: "Sơ Sinh",
    stock: 45
  },
  {
    id: "body-dai-cho-be",
    title: "Body dài cho bé dễ thương",
    price: 199000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-3_master.jpg",
    description: "Body dài giữ ấm cơ thể cho bé sơ sinh, họa tiết động vật ngộ nghĩnh.",
    category: "Sơ Sinh",
    stock: 30
  },
  {
    id: "body-dai-sieu-nhan-fm-d08",
    title: "Body dài siêu nhân FM D08",
    price: 210000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-5_61ec3f7b79554b52b47ecdbdd502dc2e_grande.jpg",
    description: "Bộ body dài hóa trang siêu nhân chất cotton mềm mịn, bảo vệ làn da nhạy cảm của bé.",
    category: "Sơ Sinh",
    stock: 18
  },
  {
    id: "body-hoat-hinh-cho-be",
    title: "Body hoạt hình cho bé năng động",
    price: 175000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-15_grande.jpg",
    description: "Bộ body ngắn in hình hoạt hình dễ thương cho bé thỏa sức vui chơi ngày hè.",
    category: "Sơ Sinh",
    stock: 52
  },
  {
    id: "body-tam-giac-tay-ngan",
    title: "Body tam giác tay ngắn mát mẻ",
    price: 150000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-7_master.jpg",
    description: "Body tam giác thoải mái, thích hợp mặc bỉm, vải cotton 100% thấm hút mồ hôi cực tốt.",
    category: "Sơ Sinh",
    stock: 60
  },
  {
    id: "dam-cong-chua-cho-be-gai-m003",
    title: "Đầm công chúa cho bé gái M003",
    price: 320000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-21_grande.jpg",
    description: "Đầm xòe công chúa bồng bềnh, đính hoa tinh tế cho bé gái tỏa sáng trong mọi bữa tiệc.",
    category: "Bé Gái",
    stock: 12
  },
  {
    id: "dam-cong-chua-cho-be-gai",
    title: "Đầm công chúa bé gái xinh xắn",
    price: 299000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-13_53ad16c019174224ac3b64fc0bf06691_grande.jpg",
    description: "Thiết kế đầm ren công chúa cao cấp, thướt tha, mềm mại và không gây ngứa cho da bé.",
    category: "Bé Gái",
    stock: 15
  },
  {
    id: "dam-hoa-cong-chua-fm-45",
    title: "Đầm Hoa Công Chúa FM-45",
    price: 389000,
    oldPrice: 550000,
    image: "/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1_files/pro-16_master.jpg",
    description: "Đầm Hoa Công Chúa FM-45 với thiết kế tinh xảo, họa tiết hoa nhí sang trọng và thắt nơ lưng cực kỳ điệu đà.",
    category: "Bé Gái",
    stock: 8
  },
  {
    id: "do-vest-cho-be-trai",
    title: "Đồ vest lịch lãm cho bé trai",
    price: 520000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-6_master.jpg",
    description: "Set đồ vest 3 chi tiết lịch lãm chuẩn soái ca nhí cho các bé trai diện Tết và sự kiện lớn.",
    category: "Bé Trai",
    stock: 10
  },
  {
    id: "set-ao-roi-quan-dm-a2",
    title: "Set áo rời quần DM A2",
    price: 270000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-9_master.jpg",
    description: "Set bộ rời năng động cho bé trai bé gái mặc ở nhà hoặc đi học, chất thun da cá bền màu.",
    category: "Unisex",
    stock: 35
  },
  {
    id: "set-ao-roi-quan-fm-f0045",
    title: "Set áo rời quần FM F0045",
    price: 285000,
    image: "/Sản Phẩm – Kidty Shop_files/pro-8_0d32e65e43ea4abeaf91e51b93043965_grande.jpg",
    description: "Bộ thun cotton rời họa tiết đáng yêu, đường may tỉ mỉ, mặc mát mẻ dễ chịu cả ngày.",
    category: "Unisex",
    stock: 22
  }
];

export const productService = {
  getProducts() {
    try {
      const data = localStorage.getItem("kidty-products");
      if (!data) {
        localStorage.setItem("kidty-products", JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate the first product to prevent rendering corrupted local data
        const first = parsed[0];
        if (!first || !first.title || !first.image || first.image.includes("undefined")) {
          localStorage.setItem("kidty-products", JSON.stringify(DEFAULT_PRODUCTS));
          return DEFAULT_PRODUCTS;
        }
        return parsed;
      }
      return DEFAULT_PRODUCTS;
    } catch (e) {
      console.error("Error loading products from localStorage", e);
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts(products) {
    try {
      localStorage.setItem("kidty-products", JSON.stringify(products));
    } catch (e) {
      console.error("Error saving products to localStorage", e);
    }
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },

  addProduct(productData) {
    const products = this.getProducts();
    // Generate an ID based on title if not provided
    const id = productData.id || productData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
      
    const newProduct = {
      ...productData,
      id: id || "prod-" + Math.floor(Math.random() * 100000),
      price: Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      image: productData.image || "/Sản Phẩm – Kidty Shop_files/pro-16_master.jpg"
    };

    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index > -1) {
      products[index] = {
        ...products[index],
        ...updatedData,
        price: updatedData.price !== undefined ? Number(updatedData.price) : products[index].price,
        stock: updatedData.stock !== undefined ? Number(updatedData.stock) : products[index].stock
      };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
    return true;
  }
};

export function getProductImage(product) {
  if (typeof product === "string") {
    const value = product.trim();
    if (!value || value.includes("?view=") || value.includes("/products/")) {
      return "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg";
    }
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:") ||
      value.startsWith("blob:")
    ) {
      return value;
    }
    return value.startsWith("/") ? value : `/${value}`;
  }

  const value =
    product?.image ||
    product?.image_url ||
    product?.thumbnail ||
    product?.img ||
    product?.images?.[0];

  if (!value || (typeof value === "string" && (value.includes("?view=") || value.includes("/products/")))) {
    // If the value itself is a webpage or invalid, try lookup by id if present
    if (product?.id) {
      const localProd = productService.getProductById(product.id);
      if (localProd && localProd.image && !localProd.image.includes("?view=") && !localProd.image.includes("/products/")) {
        return getProductImage(localProd.image);
      }
    }
    return "/Sản Phẩm – Kidty Shop_files/pro-12_master.jpg";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  return value.startsWith("/") ? value : `/${value}`;
}

