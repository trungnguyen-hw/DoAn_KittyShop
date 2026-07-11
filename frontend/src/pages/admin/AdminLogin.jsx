import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminAuthService } from "../../services/adminAuth.js";
import { request } from "../../services/api.js";
import "./admin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (adminAuthService.isAuthenticated()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const inputUsername = username.trim();
    const inputPassword = password.trim();

    if (!inputUsername || !inputPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    try {
      // 1. Health check
      try {
        await request("/health");
      } catch (healthErr) {
        console.error("Health check failed:", healthErr);
        const connErrorMsg = "Không kết nối được máy chủ. Vui lòng kiểm tra lại dịch vụ Backend.";
        setErrorMsg(connErrorMsg);
        if (window.showToast) {
          window.showToast(connErrorMsg, "error", "Lỗi kết nối");
        }
        return;
      }

      // 2. Perform login
      const data = await request("/auth/login", {
        method: "POST",
        body: { username: inputUsername, password: inputPassword }
      });

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        localStorage.setItem("adminAuth", "true");

        if (window.showToast) {
          window.showToast("Đăng nhập Admin thành công", "success", "Đăng nhập thành công");
        }
        const origin = location.state?.from?.pathname || "/admin/dashboard";
        navigate(origin, { replace: true });
      }
    } catch (err) {
      console.error("API login error:", err);
      let errMsg = "Lỗi xử lý đăng nhập tại Server";
      if (err.status === 401) {
        errMsg = "Sai tài khoản hoặc mật khẩu";
      } else {
        errMsg = err.message || errMsg;
      }
      setErrorMsg(errMsg);
      if (window.showToast) {
        window.showToast(errMsg, "error", "Đăng nhập thất bại");
      }
    }
  };

  return (
    <div className="page-fade-in" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff0f3 0%, #ffe3e8 100%)",
      fontFamily: "inherit",
      padding: "20px"
    }}>
      <div className="admin-modal-box" style={{
        maxWidth: "420px",
        boxShadow: "0 15px 35px rgba(255, 94, 141, 0.15)",
        border: "1px solid rgba(255, 94, 141, 0.2)",
        animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{
          padding: "30px 24px",
          textAlign: "center"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "var(--kidty-primary)",
            color: "white",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            marginBottom: "16px",
            boxShadow: "0 8px 16px rgba(255, 94, 141, 0.3)"
          }}>
            🔐
          </div>
          <h2 style={{
            fontSize: "1.45rem",
            fontWeight: "800",
            color: "var(--kidty-text-primary)",
            margin: "0 0 8px 0"
          }}>Đăng nhập Admin</h2>
          <p style={{
            fontSize: "0.85rem",
            color: "var(--kidty-text-secondary)",
            margin: "0 0 24px 0"
          }}>Vui lòng đăng nhập bằng tài khoản quản lý demo của bạn</p>

          <form onSubmit={handleLoginSubmit} style={{ textAlign: "left" }}>
            <div className="admin-form-group">
              <label>Tài khoản</label>
              <input 
                type="text" 
                className="admin-input"
                placeholder="Tên đăng nhập admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-form-group" style={{ marginBottom: "20px" }}>
              <label>Mật khẩu</label>
              <input 
                type="password" 
                className="admin-input"
                placeholder="Mật khẩu của bạn..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div style={{
                color: "var(--kidty-danger)",
                background: "var(--kidty-danger-light)",
                border: "1px solid rgba(255, 77, 109, 0.15)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="admin-btn"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
                fontSize: "0.95rem"
              }}
            >
              Đăng nhập ngay
            </button>
          </form>

          <div style={{ marginTop: "24px" }}>
            <a href="/" style={{
              fontSize: "0.85rem",
              color: "var(--kidty-text-secondary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              🏠 Quay lại cửa hàng
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
