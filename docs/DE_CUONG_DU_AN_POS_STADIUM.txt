# ĐỀ CƯƠNG CHI TIẾT DỰ ÁN
## HỆ THỐNG QUẢN LÝ BÁN HÀNG SÂN BÓNG ĐÁ (POS STADIUM)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mô tả
Hệ thống POS (Point of Sale) quản lý sân bóng đá, bao gồm:
- Quản lý đặt sân
- Bán hàng (đồ ăn, nước uống, quần áo, phụ kiện)
- Quản lý nhân viên
- Quản lý khách hàng

### 1.2 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│              React + TypeScript + Ant Design                     │
│                    (Lovable Cloud)                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/HTTPS (REST API)
                          │ Authorization: Bearer {token}
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                       Laravel 11                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Sanctum   │  │   Eloquent  │  │   Broadcasting+Pusher   │  │
│  │    Auth     │  │     ORM     │  │      (WebSocket)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │  Scheduler  │  │    Queue    │                               │
│  │ (Cron jobs) │  │ (Async SMS) │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                         MySQL                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, TypeScript, Ant Design, Tailwind CSS, React Router |
| Backend | Laravel 11, PHP 8.2+ |
| Authentication | Laravel Sanctum (Token-based) |
| Database | MySQL 8.0 |
| Realtime | Laravel Broadcasting + Pusher |
| Queue | Laravel Queue (Redis/Database) |
| Scheduler | Laravel Scheduler |

---

## 2. PHÂN QUYỀN HỆ THỐNG

### 2.1 Các vai trò (Roles)

| Role | Mô tả | Prefix Route |
|------|-------|--------------|
| `customer` | Khách hàng | `/` |
| `staff` | Nhân viên | `/staff` |
| `admin` | Quản trị viên | `/admin` |

### 2.2 Quyền hạn chi tiết

#### Customer (Khách hàng)
- Xem danh sách sân bóng
- Đặt sân
- Xem/mua sản phẩm
- Quản lý giỏ hàng
- Thanh toán
- Xem lịch sử đặt sân/mua hàng
- Quản lý thông tin cá nhân

#### Staff (Nhân viên)
- Xem booking đã được admin duyệt
- Xác nhận khách đến
- Quản lý sân (đang chơi/hoàn thành)
- Tạo đơn hàng tại quầy
- Chấm công (check-in/check-out)
- Xem thông tin cá nhân & lương

#### Admin (Quản trị viên)
- Toàn quyền quản lý hệ thống
- CRUD sân bóng
- CRUD sản phẩm
- Quản lý nhân viên
- Duyệt/từ chối booking
- Quản lý ca làm việc
- Xem báo cáo doanh thu
- Quản lý khách hàng

---

## 3. THIẾT KẾ DATABASE

### 3.1 Sơ đồ quan hệ (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   profiles   │       │    roles     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ user_id (FK) │       │ id (PK)      │
│ email        │       │ first_name   │       │ name         │
│ password     │       │ last_name    │       │ guard_name   │
│ role_id (FK) │───────│ phone        │       └──────────────┘
│ created_at   │       │ avatar       │              ▲
│ updated_at   │       │ address      │              │
└──────────────┘       └──────────────┘              │
       │                                             │
       │ ┌───────────────────────────────────────────┘
       │ │
       ▼ ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    fields    │       │   bookings   │       │   products   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ field_id(FK) │       │ id (PK)      │
│ name         │       │ user_id (FK) │       │ name         │
│ price        │       │ date         │       │ category     │
│ size         │       │ start_time   │       │ price        │
│ surface      │       │ end_time     │       │ stock        │
│ description  │       │ status       │       │ image        │
│ image        │       │ total_amount │       │ description  │
│ features     │       │ approved_by  │       └──────────────┘
│ location     │       │ approved_at  │              │
│ available    │       └──────────────┘              │
└──────────────┘                                     │
                                                     ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    orders    │       │ order_items  │       │   payments   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ order_id(FK) │       │ id (PK)      │
│ user_id (FK) │       │ product_id   │       │ order_id(FK) │
│ staff_id(FK) │       │ quantity     │       │ booking_id   │
│ total_amount │       │ price        │       │ amount       │
│ status       │       └──────────────┘       │ method       │
│ created_at   │                              │ status       │
└──────────────┘                              └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    shifts    │       │ attendances  │       │shift_assigns │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ user_id (FK) │       │ shift_id(FK) │
│ start_time   │       │ check_in     │       │ user_id (FK) │
│ end_time     │       │ check_out    │       │ date         │
│ description  │       │ date         │       └──────────────┘
└──────────────┘       │ status       │
                       └──────────────┘
```

### 3.2 Chi tiết các bảng

#### users
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### profiles
```sql
CREATE TABLE profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    address TEXT,
    date_of_birth DATE,
    -- Thông tin riêng cho staff
    position VARCHAR(100) NULL,
    department VARCHAR(100) NULL,
    join_date DATE NULL,
    salary DECIMAL(12,2) NULL,
    status ENUM('active', 'inactive', 'off') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### fields (Sân bóng)
```sql
CREATE TABLE fields (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size VARCHAR(50) NOT NULL, -- '5 người', '7 người', '11 người'
    surface VARCHAR(100), -- 'Cỏ nhân tạo', 'Cỏ tự nhiên'
    description TEXT,
    image VARCHAR(255),
    features JSON, -- ['Đèn chiếu sáng', 'Phòng thay đồ', ...]
    location VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### bookings (Đặt sân)
```sql
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    field_id BIGINT UNSIGNED NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL, -- Số giờ
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'playing', 'completed', 'cancelled') DEFAULT 'pending',
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    notes TEXT,
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    confirmed_by BIGINT UNSIGNED NULL, -- Staff xác nhận khách đến
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (field_id) REFERENCES fields(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id)
);
```

#### products (Sản phẩm)
```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('food', 'drink', 'apparel', 'accessories') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    stock INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'cái',
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### orders (Đơn hàng)
```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL, -- NULL nếu khách vãng lai
    staff_id BIGINT UNSIGNED NULL, -- Nhân viên tạo đơn
    customer_name VARCHAR(255),
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
    order_type ENUM('online', 'counter') DEFAULT 'online', -- Online hoặc tại quầy
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (staff_id) REFERENCES users(id)
);
```

#### order_items (Chi tiết đơn hàng)
```sql
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- Lưu tên tại thời điểm mua
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Giá tại thời điểm mua
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### payments (Thanh toán)
```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NULL,
    booking_id BIGINT UNSIGNED NULL,
    amount DECIMAL(12,2) NOT NULL,
    method ENUM('cash', 'transfer', 'momo', 'vnpay', 'card') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

#### shifts (Ca làm việc)
```sql
CREATE TABLE shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Ca sáng', 'Ca chiều', 'Ca tối'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### shift_assignments (Phân ca)
```sql
CREATE TABLE shift_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    status ENUM('scheduled', 'completed', 'absent') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_shift_user_date (shift_id, user_id, date)
);
```

#### attendances (Chấm công)
```sql
CREATE TABLE attendances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    check_in TIMESTAMP NULL,
    check_out TIMESTAMP NULL,
    status ENUM('present', 'late', 'absent', 'leave') DEFAULT 'present',
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_date (user_id, date)
);
```

---

## 4. API ENDPOINTS

### 4.1 Authentication APIs

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản | No |
| POST | `/api/auth/login` | Đăng nhập | No |
| POST | `/api/auth/logout` | Đăng xuất | Yes |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | Yes |
| PUT | `/api/auth/profile` | Cập nhật profile | Yes |
| POST | `/api/auth/change-password` | Đổi mật khẩu | Yes |

#### Request/Response Examples

**POST /api/auth/register**
```json
// Request
{
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "phone": "0901234567"
}

// Response 201
{
    "success": true,
    "message": "Đăng ký thành công",
    "data": {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "role": "customer"
        },
        "token": "1|abc123xyz..."
    }
}
```

**POST /api/auth/login**
```json
// Request
{
    "email": "user@example.com",
    "password": "password123"
}

// Response 200
{
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "role": "customer",
            "profile": {
                "first_name": "Nguyễn",
                "last_name": "Văn A",
                "phone": "0901234567",
                "avatar": null
            }
        },
        "token": "2|def456xyz..."
    }
}
```

### 4.2 Fields APIs (Sân bóng)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/fields` | Danh sách sân | No | All |
| GET | `/api/fields/{id}` | Chi tiết sân | No | All |
| POST | `/api/fields` | Tạo sân mới | Yes | Admin |
| PUT | `/api/fields/{id}` | Cập nhật sân | Yes | Admin |
| DELETE | `/api/fields/{id}` | Xóa sân | Yes | Admin |
| GET | `/api/fields/{id}/slots` | Lấy slot trống | No | All |

**GET /api/fields**
```json
// Response 200
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Sân 5A",
            "price": 200000,
            "size": "5 người",
            "surface": "Cỏ nhân tạo",
            "description": "Sân bóng mini chất lượng cao",
            "image": "https://...",
            "features": ["Đèn chiếu sáng", "Phòng thay đồ"],
            "location": "Tầng 1, Khu A",
            "rating": 4.5,
            "reviews_count": 120,
            "available": true
        }
    ],
    "meta": {
        "current_page": 1,
        "total": 10,
        "per_page": 10
    }
}
```

### 4.3 Bookings APIs (Đặt sân)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/bookings` | Danh sách booking | Yes | All |
| GET | `/api/bookings/{id}` | Chi tiết booking | Yes | All |
| POST | `/api/bookings` | Tạo booking mới | Yes | Customer |
| PUT | `/api/bookings/{id}` | Cập nhật booking | Yes | Admin |
| DELETE | `/api/bookings/{id}` | Hủy booking | Yes | Customer/Admin |
| POST | `/api/bookings/{id}/approve` | Duyệt booking | Yes | Admin |
| POST | `/api/bookings/{id}/reject` | Từ chối booking | Yes | Admin |
| POST | `/api/bookings/{id}/confirm` | Xác nhận khách đến | Yes | Staff |
| POST | `/api/bookings/{id}/complete` | Hoàn thành | Yes | Staff |

**POST /api/bookings**
```json
// Request
{
    "field_id": 1,
    "booking_date": "2024-01-20",
    "start_time": "14:00",
    "end_time": "16:00",
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0901234567",
    "notes": "Cần 2 quả bóng"
}

// Response 201
{
    "success": true,
    "message": "Đặt sân thành công, vui lòng chờ duyệt",
    "data": {
        "id": 1,
        "field": { "id": 1, "name": "Sân 5A" },
        "booking_date": "2024-01-20",
        "start_time": "14:00",
        "end_time": "16:00",
        "duration": 2,
        "total_amount": 400000,
        "status": "pending"
    }
}
```

### 4.4 Products APIs (Sản phẩm)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/products` | Danh sách sản phẩm | No | All |
| GET | `/api/products/{id}` | Chi tiết sản phẩm | No | All |
| POST | `/api/products` | Tạo sản phẩm | Yes | Admin |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm | Yes | Admin |
| DELETE | `/api/products/{id}` | Xóa sản phẩm | Yes | Admin |

**GET /api/products?category=drink**
```json
// Response 200
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Nước suối Aquafina",
            "category": "drink",
            "price": 10000,
            "image": "https://...",
            "description": "Nước suối tinh khiết 500ml",
            "stock": 100,
            "unit": "chai"
        }
    ]
}
```

### 4.5 Orders APIs (Đơn hàng)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/orders` | Danh sách đơn hàng | Yes | All |
| GET | `/api/orders/{id}` | Chi tiết đơn hàng | Yes | All |
| POST | `/api/orders` | Tạo đơn hàng | Yes | Customer/Staff |
| PUT | `/api/orders/{id}/status` | Cập nhật trạng thái | Yes | Staff/Admin |
| DELETE | `/api/orders/{id}` | Hủy đơn hàng | Yes | All |

**POST /api/orders**
```json
// Request
{
    "items": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 3, "quantity": 1 }
    ],
    "customer_name": "Nguyễn Văn A", // Optional
    "notes": "Ít đá"
}

// Response 201
{
    "success": true,
    "message": "Đặt hàng thành công",
    "data": {
        "id": 1,
        "items": [
            {
                "product_id": 1,
                "product_name": "Nước suối Aquafina",
                "quantity": 2,
                "price": 10000,
                "subtotal": 20000
            }
        ],
        "total_amount": 45000,
        "status": "pending"
    }
}
```

### 4.6 Staff APIs

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/staff` | Danh sách nhân viên | Yes | Admin |
| GET | `/api/staff/{id}` | Chi tiết nhân viên | Yes | Admin |
| POST | `/api/staff` | Thêm nhân viên | Yes | Admin |
| PUT | `/api/staff/{id}` | Cập nhật nhân viên | Yes | Admin |
| DELETE | `/api/staff/{id}` | Xóa nhân viên | Yes | Admin |
| GET | `/api/staff/me/stats` | Thống kê cá nhân | Yes | Staff |

### 4.7 Attendance APIs (Chấm công)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/attendances` | Danh sách chấm công | Yes | Admin |
| POST | `/api/attendances/check-in` | Check in | Yes | Staff |
| POST | `/api/attendances/check-out` | Check out | Yes | Staff |
| GET | `/api/attendances/my` | Lịch sử chấm công cá nhân | Yes | Staff |

### 4.8 Shifts APIs (Ca làm việc)

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/shifts` | Danh sách ca | Yes | Admin/Staff |
| POST | `/api/shifts` | Tạo ca mới | Yes | Admin |
| PUT | `/api/shifts/{id}` | Cập nhật ca | Yes | Admin |
| DELETE | `/api/shifts/{id}` | Xóa ca | Yes | Admin |
| POST | `/api/shifts/assign` | Phân ca cho nhân viên | Yes | Admin |
| GET | `/api/shifts/my` | Ca làm việc của tôi | Yes | Staff |

### 4.9 Dashboard/Stats APIs

| Method | Endpoint | Mô tả | Auth | Role |
|--------|----------|-------|------|------|
| GET | `/api/admin/dashboard` | Dashboard admin | Yes | Admin |
| GET | `/api/admin/revenue` | Báo cáo doanh thu | Yes | Admin |
| GET | `/api/staff/dashboard` | Dashboard staff | Yes | Staff |

---

## 5. AUTHENTICATION FLOW

### 5.1 Laravel Sanctum Setup

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
    'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1'
)),

// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173', 'https://your-frontend.lovable.app'],
'supports_credentials' => true,
```

### 5.2 Frontend Integration

```typescript
// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5.3 Auth Context

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

---

## 6. REALTIME (WebSocket)

### 6.1 Pusher Configuration

```php
// .env (Laravel)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-secret
PUSHER_APP_CLUSTER=ap1
```

### 6.2 Events

```php
// app/Events/BookingStatusChanged.php
class BookingStatusChanged implements ShouldBroadcast
{
    public function broadcastOn()
    {
        return new Channel('bookings');
    }
}

// app/Events/OrderStatusChanged.php
class OrderStatusChanged implements ShouldBroadcast
{
    public function broadcastOn()
    {
        return new PrivateChannel('orders.' . $this->order->id);
    }
}
```

### 6.3 Frontend Listener

```typescript
// Using Laravel Echo
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true
});

// Listen for booking updates
echo.channel('bookings')
  .listen('BookingStatusChanged', (e) => {
    console.log('Booking updated:', e.booking);
  });
```

---

## 7. WORKFLOW CHÍNH

### 7.1 Booking Workflow

```
Customer                    Admin                      Staff
    │                         │                          │
    │ 1. Đặt sân              │                          │
    │ ────────────────────►   │                          │
    │    (status: pending)    │                          │
    │                         │                          │
    │                         │ 2. Duyệt/Từ chối        │
    │                         │ ◄─────────────────────   │
    │ ◄──────────────────────►│    (approved/rejected)  │
    │    (Notify)             │                          │
    │                         │                          │
    │                         │ 3. Booking approved      │
    │                         │ ─────────────────────►   │
    │                         │                          │
    │ 4. Khách đến            │                          │
    │ ──────────────────────────────────────────────►   │
    │                         │                          │
    │                         │    5. Xác nhận           │
    │                         │ ◄─────────────────────   │
    │                         │    (status: playing)     │
    │                         │                          │
    │                         │    6. Hoàn thành         │
    │                         │ ◄─────────────────────   │
    │                         │    (status: completed)   │
```

### 7.2 Order Workflow (Counter)

```
Customer at Counter              Staff
        │                          │
        │ 1. Yêu cầu mua hàng     │
        │ ────────────────────►   │
        │                          │
        │    2. Tạo đơn hàng      │
        │ ◄────────────────────   │
        │    (status: pending)    │
        │                          │
        │    3. Chuẩn bị          │
        │ ◄────────────────────   │
        │    (status: preparing)  │
        │                          │
        │    4. Giao hàng         │
        │ ◄────────────────────   │
        │    (status: completed)  │
        │                          │
        │ 5. Thanh toán           │
        │ ────────────────────►   │
```

---

## 8. ENVIRONMENT VARIABLES

### 8.1 Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_PUSHER_APP_KEY=your-pusher-key
VITE_PUSHER_APP_CLUSTER=ap1
```

### 8.2 Backend (.env)

```env
APP_NAME="POS Stadium"
APP_ENV=local
APP_KEY=base64:xxx
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_stadium
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=pusher
CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file

PUSHER_APP_ID=xxx
PUSHER_APP_KEY=xxx
PUSHER_APP_SECRET=xxx
PUSHER_APP_CLUSTER=ap1

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

---

## 9. FOLDER STRUCTURE

### 9.1 Laravel Backend

```
laravel-pos-stadium/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── FieldController.php
│   │   │   │   ├── BookingController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── StaffController.php
│   │   │   │   ├── ShiftController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   └── DashboardController.php
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php
│   │   │   └── ...
│   │   └── Requests/
│   │       ├── LoginRequest.php
│   │       ├── RegisterRequest.php
│   │       ├── BookingRequest.php
│   │       └── ...
│   ├── Models/
│   │   ├── User.php
│   │   ├── Profile.php
│   │   ├── Field.php
│   │   ├── Booking.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Payment.php
│   │   ├── Shift.php
│   │   ├── ShiftAssignment.php
│   │   └── Attendance.php
│   ├── Events/
│   │   ├── BookingStatusChanged.php
│   │   └── OrderStatusChanged.php
│   ├── Jobs/
│   │   └── SendSmsNotification.php
│   └── Services/
│       ├── BookingService.php
│       └── OrderService.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   └── channels.php
└── ...
```

### 9.2 React Frontend

```
src/
├── components/
│   ├── admin/          # Admin components
│   ├── staff/          # Staff components
│   ├── customer/       # Customer components
│   └── ui/             # Shared UI components
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useBookings.ts
│   └── useProducts.ts
├── layouts/
│   ├── AdminLayout.tsx
│   ├── StaffLayout.tsx
│   └── CustomerLayout.tsx
├── lib/
│   ├── api.ts          # Axios instance
│   └── utils.ts
├── pages/
│   ├── admin/
│   ├── staff/
│   ├── customer/
│   └── auth/
├── services/
│   ├── authService.ts
│   ├── bookingService.ts
│   ├── productService.ts
│   └── orderService.ts
└── types/
    ├── field.ts
    ├── product.ts
    ├── staff.ts
    └── index.ts
```

---

## 10. DEPLOYMENT

### 10.1 Frontend (Lovable Cloud)
- Tự động deploy khi push code
- URL: `https://your-app.lovable.app`

### 10.2 Backend (Laravel)
- Server: VPS/Cloud (DigitalOcean, AWS, etc.)
- Web Server: Nginx + PHP-FPM
- SSL: Let's Encrypt
- Database: MySQL 8.0

### 10.3 CORS Configuration

```php
// Laravel config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'https://your-app.lovable.app'
    ],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

---

## 11. CHECKLIST TRIỂN KHAI

### Backend (Laravel)
- [ ] Tạo project Laravel 11
- [ ] Cấu hình database MySQL
- [ ] Cài đặt Laravel Sanctum
- [ ] Tạo migrations cho tất cả tables
- [ ] Tạo Models với relationships
- [ ] Tạo Controllers cho từng resource
- [ ] Implement authentication (login/register/logout)
- [ ] Tạo middleware CheckRole
- [ ] Implement CRUD cho Fields
- [ ] Implement Bookings với workflow
- [ ] Implement Products
- [ ] Implement Orders
- [ ] Implement Staff management
- [ ] Implement Attendance
- [ ] Implement Shifts
- [ ] Cấu hình Pusher/Broadcasting
- [ ] Tạo Events cho realtime
- [ ] Viết API documentation
- [ ] Testing

### Frontend (React)
- [ ] Cấu hình axios với token
- [ ] Tạo AuthContext
- [ ] Kết nối Login/Register với API
- [ ] Kết nối Fields page với API
- [ ] Kết nối Booking page với API
- [ ] Kết nối Products page với API
- [ ] Kết nối Cart/Checkout với API
- [ ] Kết nối Admin Dashboard với API
- [ ] Kết nối Staff Dashboard với API
- [ ] Implement realtime với Pusher
- [ ] Testing

---

## 12. LIÊN HỆ & HỖ TRỢ

Tài liệu này được tạo tự động từ hệ thống Lovable.
Ngày tạo: 03/12/2024

---

*Hết tài liệu*
