# Kidty Shop

Kidty Shop là ứng dụng full-stack dùng chung một GitHub repository nhưng triển khai thành hai Vercel Project độc lập.

## Cấu trúc

```text
.
├── frontend/   # React 19 + Vite 8
├── backend/    # Express 4 REST API + MySQL
├── .gitignore
└── README.md
```

Frontend gọi Backend duy nhất qua `VITE_API_URL`. Backend lưu sản phẩm, tài khoản Admin và đơn hàng trong MySQL; không dùng bộ nhớ hoặc file cục bộ để lưu dữ liệu production.

## Chạy cục bộ

Tạo `frontend/.env` và `backend/.env` từ hai file `.env.example`, sau đó:

```bash
cd backend
npm install
npm run start
```

Trong terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Schema MySQL nằm tại `backend/src/database/schema.sql`. Chỉ chạy `npm run seed:admin` khi đã chủ động cấu hình `ADMIN_USERNAME` và `ADMIN_PASSWORD`; Backend không tự seed khi khởi động.

## API

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`
- `GET /api/categories`
- `POST /api/orders`
- Các route quản trị dùng Bearer token JWT.

## Triển khai Vercel

Tạo hai Project từ cùng repository:

| Project | Root Directory | Build / Output |
| --- | --- | --- |
| Frontend | `frontend` | `npm run build` / `dist` |
| Backend | `backend` | cấu hình trong `backend/vercel.json` |

Biến Frontend:

```text
VITE_API_URL=https://<backend-domain>/api
```

Biến Backend:

```text
NODE_ENV
FRONTEND_URL
DATABASE_URL
JWT_SECRET
```

Có thể dùng `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` thay cho `DATABASE_URL`. Production bắt buộc dùng MySQL online; không dùng `localhost`. Nếu cần tạo Admin ban đầu, cấu hình tạm `ADMIN_USERNAME` và `ADMIN_PASSWORD`, chạy seed có chủ đích rồi loại bỏ hai biến này nếu không còn cần.
