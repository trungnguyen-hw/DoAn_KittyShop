import fetch from "node:fetch";

async function runTests() {
  console.log("=== THỬ NGHIỆM ĐĂNG NHẬP API ADMIN ===");
  console.log("Yêu cầu: Backend đang chạy ở cổng 5000 (npm run dev)\n");

  // 1. Thử nghiệm ĐÚNG tài khoản (trungngo1903 / Trunglove123)
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "trungngo1903", password: "Trunglove123" })
    });
    const data = await res.json();
    console.log("➡️ [Test 1] ĐĂNG NHẬP ĐÚNG:");
    console.log("   - HTTP Status:", res.status);
    console.log("   - Phản hồi JSON:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("➡️ [Test 1] Thất bại: Không kết nối được đến server ở port 5000.");
  }

  // 2. Thử nghiệm SAI mật khẩu
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "trungngo1903", password: "sai_mat_khau_999" })
    });
    const data = await res.json();
    console.log("\n➡️ [Test 2] ĐĂNG NHẬP SAI:");
    console.log("   - HTTP Status:", res.status);
    console.log("   - Phản hồi JSON:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("\n➡️ [Test 2] Thất bại: Không kết nối được đến server ở port 5000.");
  }
}

runTests();
