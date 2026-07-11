import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import DamFm45Page from "./pages/DamFm45Page.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SanPhamPage from "./pages/SanPhamPage.jsx";
import TatCaSanPhamPage from "./pages/TatCaSanPhamPage.jsx";
import TinTucPage from "./pages/TinTucPage.jsx";
import TrangChuPage from "./pages/TrangChuPage.jsx";

// Import missing pages
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboardView from "./pages/admin/AdminDashboardView.jsx";
import AdminProductsView from "./pages/admin/AdminProductsView.jsx";
import AdminOrdersView from "./pages/admin/AdminOrdersView.jsx";
import AdminCustomersView from "./pages/admin/AdminCustomersView.jsx";
import AdminCategoriesView from "./pages/admin/AdminCategoriesView.jsx";
import AdminCouponsView from "./pages/admin/AdminCouponsView.jsx";
import AdminRevenueView from "./pages/admin/AdminRevenueView.jsx";
import AdminSettingsView from "./pages/admin/AdminSettingsView.jsx";

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TrangChuPage />} />
            <Route path="/pages/ldp-kids-1" element={<LandingPage />} />
            <Route path="/collections/san-pham" element={<SanPhamPage />} />
            <Route path="/collections/all" element={<TatCaSanPhamPage />} />
            <Route path="/blogs/news" element={<TinTucPage />} />
            <Route path="/products/dam-hoa-cong-chua-fm-45" element={<DamFm45Page />} />
            <Route path="/products/:slug" element={<DamFm45Page />} />
            
            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Admin Portal */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardView />} />
              <Route path="products" element={<AdminProductsView />} />
              <Route path="orders" element={<AdminOrdersView />} />
              <Route path="customers" element={<AdminCustomersView />} />
              <Route path="categories" element={<AdminCategoriesView />} />
              <Route path="coupons" element={<AdminCouponsView />} />
              <Route path="revenue" element={<AdminRevenueView />} />
              <Route path="settings" element={<AdminSettingsView />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  );
}

