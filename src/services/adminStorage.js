// Service to manage Admin Categories, Coupons, and Settings in localStorage

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Đầm bé gái", status: "active", count: 15 },
  { id: "cat-2", name: "Set áo quần", status: "active", count: 28 },
  { id: "cat-3", name: "Áo bé trai", status: "active", count: 12 },
  { id: "cat-4", name: "Phụ kiện", status: "active", count: 8 },
  { id: "cat-5", name: "Sản phẩm khuyến mãi", status: "active", count: 5 }
];

const DEFAULT_COUPONS = [
  { id: "c-1", code: "KIDTY10", type: "percent", value: 10, startDate: "2026-07-01", endDate: "2026-12-31", status: "active" },
  { id: "c-2", code: "FREESHIP", type: "freeship", value: 100, startDate: "2026-07-01", endDate: "2026-12-31", status: "active" },
  { id: "c-3", code: "BABY20", type: "percent", value: 20, startDate: "2026-07-05", endDate: "2026-08-31", status: "active" }
];

const DEFAULT_SETTINGS = {
  shopName: "Kidty Shop",
  slogan: "Thời trang trẻ em cao cấp - Cùng bé khôn lớn",
  phone: "0901234567",
  email: "contact@kidtyshop.vn",
  address: "Số 123, Đường ABC, Phường X, Quận Y, TP. Hồ Chí Minh",
  primaryColor: "#ff5e8d", // Soft pink
  shippingFee: 30000,
  freeShippingThreshold: 500000,
  notificationEnabled: true
};

export const adminStorageService = {
  // Categories
  getCategories() {
    try {
      const data = localStorage.getItem("kidty-categories");
      if (!data) {
        localStorage.setItem("kidty-categories", JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(cats) {
    localStorage.setItem("kidty-categories", JSON.stringify(cats));
  },

  addCategory(name) {
    const cats = this.getCategories();
    const newCat = {
      id: "cat-" + Math.floor(Math.random() * 100000),
      name,
      status: "active",
      count: 0
    };
    cats.push(newCat);
    this.saveCategories(cats);
    return newCat;
  },

  updateCategory(id, name, status) {
    let cats = this.getCategories();
    cats = cats.map(c => c.id === id ? { ...c, name, status } : c);
    this.saveCategories(cats);
  },

  deleteCategory(id) {
    let cats = this.getCategories();
    cats = cats.filter(c => c.id !== id);
    this.saveCategories(cats);
  },

  // Coupons
  getCoupons() {
    try {
      const data = localStorage.getItem("kidty-coupons");
      if (!data) {
        localStorage.setItem("kidty-coupons", JSON.stringify(DEFAULT_COUPONS));
        return DEFAULT_COUPONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      return DEFAULT_COUPONS;
    }
  },

  saveCoupons(coupons) {
    localStorage.setItem("kidty-coupons", JSON.stringify(coupons));
  },

  addCoupon(coupon) {
    const coupons = this.getCoupons();
    const newCoupon = {
      ...coupon,
      id: "c-" + Math.floor(Math.random() * 100000),
      status: coupon.status || "active"
    };
    coupons.push(newCoupon);
    this.saveCoupons(coupons);
    return newCoupon;
  },

  updateCoupon(id, updated) {
    let coupons = this.getCoupons();
    coupons = coupons.map(c => c.id === id ? { ...c, ...updated } : c);
    this.saveCoupons(coupons);
  },

  deleteCoupon(id) {
    let coupons = this.getCoupons();
    coupons = coupons.filter(c => c.id !== id);
    this.saveCoupons(coupons);
  },

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem("kidty-settings");
      if (!data) {
        localStorage.setItem("kidty-settings", JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem("kidty-settings", JSON.stringify(settings));
  }
};
