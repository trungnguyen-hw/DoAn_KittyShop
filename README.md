# Kidty Shop - Hệ Thống Cửa Hàng Thời Trang Trẻ Em Fullstack

Dự án website bán hàng thời trang trẻ em cao cấp Kidty Shop gồm hai phần chính: Giao diện người dùng (Frontend SPA React + Vite) và Máy chủ dịch vụ (Backend REST API Express + MySQL).

---

## 1. Công Nghệ Sử Dụng (Tech Stack)
* **Frontend:** React 19, React Router DOM 7, Vite 8, CSS thuần (Vanilla CSS)
* **Backend:** Node.js, Express, JSON Web Token (JWT), bcryptjs, CORS
* **Cơ sở dữ liệu (Database):** MySQL / MariaDB

---

## 2. Hướng Dẫn Cài Đặt (Installation)

### Khởi tạo Cơ sở dữ liệu:
1. Mở phần mềm XAMPP Control Panel và kích hoạt dịch vụ **MySQL**.
2. Truy cập `http://localhost/phpmyadmin/` và tạo mới một cơ sở dữ liệu có tên là `kidty_shop`.
3. Nhập (Import) tệp tin cơ sở dữ liệu `kidty_shop.sql` ở thư mục gốc vào cơ sở dữ liệu vừa tạo.

### Cài đặt dependencies cho dự án:
Mở Terminal tại thư mục gốc và chạy:
```bash
# Cài đặt thư viện cho Frontend
npm install

# Di chuyển vào thư mục backend và cài đặt thư viện
cd backend
npm install
```

---

## 3. Cấu Hình Biến Môi Trường (Environment Variables)

### Cấu hình Backend (`backend/.env`):
Tạo tệp `.env` trong thư mục `backend/` dựa trên `.env.example`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=kidty_shop
JWT_SECRET=your_jwt_secret_key_here
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

### Cấu hình Frontend (`.env`):
Tạo tệp `.env` tại thư mục gốc của dự án dựa trên `.env.example`:
```env
VITE_API_URL=http://127.0.0.1:5000/api
```

---

## 4. Cách Chạy Dự Án Cục Bộ (Running Locally)

### Khởi chạy Backend Server:
Mở một tab Terminal mới tại thư mục `backend/` và chạy:
```bash
npm run dev
```
*Server sẽ chạy ở cổng `5000` (Địa chỉ: `http://localhost:5000`). Hệ thống sẽ tự động thực hiện tiến trình seed tài khoản quản trị khi kết nối thành công.*

### Khởi chạy Frontend:
Mở một tab Terminal khác tại thư mục gốc và chạy:
```bash
npm run dev
```
*Frontend sẽ chạy dưới máy chủ phát triển Vite ở địa chỉ: `http://localhost:5173` (hoặc cổng tiếp theo nếu bị trùng).*

---

## 5. Lệnh Build Biên Dịch (Production Build)

Để biên dịch Frontend dự án sang tệp tin tĩnh (nằm trong thư mục `dist/`):
```bash
npm run build
```

Để chạy thử bản dựng tĩnh trên local:
```bash
npm run preview
```

---

## 6. Hướng Dẫn Triển Khai (Deployment Guide)

### Triển khai Frontend lên Vercel:
1. Đẩy toàn bộ mã nguồn của bạn lên GitHub repository cá nhân.
2. Đăng nhập vào Vercel, chọn **Add New Project** và nhập Repository của bạn.
3. Cấu hình cài đặt dự án:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (Thư mục gốc)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** Thêm biến `VITE_API_URL` trỏ về địa chỉ API Backend thực tế của bạn (ví dụ: `https://api.yourdomain.com/api`).
4. Nhấn **Deploy**. Tệp cấu hình `vercel.json` sẽ tự động đảm nhận việc chuyển hướng mọi request con SPA về `index.html` để tránh lỗi F5 404.

### Triển khai Backend và Database:
- **Backend (Express):** Có thể triển khai lên các dịch vụ như **Render**, **Railway**, hoặc **Heroku**. Cần thiết lập biến môi trường tương tự như tệp `.env`.
- **Database (MySQL):** Khuyên dùng dịch vụ MySQL đám mây từ **Aiven**, **Railway**, hoặc **Render** để kết nối ổn định thay vì localhost.
