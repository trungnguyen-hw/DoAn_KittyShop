import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import DamFm45Page from "./pages/DamFm45Page.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SanPhamPage from "./pages/SanPhamPage.jsx";
import TatCaSanPhamPage from "./pages/TatCaSanPhamPage.jsx";
import TinTucPage from "./pages/TinTucPage.jsx";
import TrangChuPage from "./pages/TrangChuPage.jsx";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TrangChuPage />} />
          <Route path="/pages/ldp-kids-1" element={<LandingPage />} />
          <Route path="/collections/san-pham" element={<SanPhamPage />} />
          <Route path="/collections/all" element={<TatCaSanPhamPage />} />
          <Route path="/blogs/news" element={<TinTucPage />} />
          <Route path="/products/dam-hoa-cong-chua-fm-45" element={<DamFm45Page />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
