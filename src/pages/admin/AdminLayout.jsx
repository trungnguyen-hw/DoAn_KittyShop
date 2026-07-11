import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { adminAuthService } from "../../services/adminAuth.js";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = adminAuthService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const handleLogout = () => {
    adminAuthService.logout();
    if (window.showToast) {
      window.showToast("Đã đăng xuất khỏi tài khoản admin", "success", "Đã đăng xuất");
    }
    navigate("/admin/login", { replace: true });
  };

  const username = adminAuthService.getLoggedUser();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Tổng quan", path: "/admin/dashboard", icon: "📊" },
    { name: "Quản lý sản phẩm", path: "/admin/products", icon: "👕" },
    { name: "Quản lý đơn hàng", path: "/admin/orders", icon: "📦" },
    { name: "Quản lý khách hàng", path: "/admin/customers", icon: "👥" },
    { name: "Danh mục sản phẩm", path: "/admin/categories", icon: "🏷️" },
    { name: "Mã giảm giá", path: "/admin/coupons", icon: "🎟️" },
    { name: "Thống kê doanh thu", path: "/admin/revenue", icon: "📈" },
    { name: "Cài đặt", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo-section">
          <div className="admin-logo-img">K</div>
          <span className="admin-logo-text">Kidty Admin</span>
        </div>
        <ul className="admin-menu-list">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <Link
                to={item.path}
                className={`admin-menu-item ${currentPath === item.path ? "active" : ""}`}
              >
                <span className="admin-menu-icon">{item.icon}</span>
                <span className="admin-menu-text">{item.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <a onClick={handleLogout} className="admin-menu-item text-danger">
              <span className="admin-menu-icon">🚪</span>
              <span className="admin-menu-text">Đăng xuất</span>
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Area */}
      <div className="admin-main-pane">
        {/* Topbar */}
        <header className="admin-topbar">
          <h2 className="admin-topbar-title">
            {menuItems.find((item) => item.path === currentPath)?.name || "Hệ thống quản lý"}
          </h2>
          <div className="admin-topbar-right">
            <div className="admin-profile-badge">
              <div className="admin-avatar-circle">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="admin-profile-name">{username}</span>
            </div>
            <button className="admin-topbar-logout-btn" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="admin-view-fadeup">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
