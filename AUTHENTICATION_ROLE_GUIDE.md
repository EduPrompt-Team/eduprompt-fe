# 🔐 Hướng Dẫn Phân Biệt User vs Admin trong Eduprompt

## 📊 Cấu Trúc Database

### Bảng `Users`:
```sql
CREATE TABLE [dbo].[Users](
    [UserId] [int] PRIMARY KEY,
    [RoleId] [int] NULL,              -- Foreign Key → Roles.RoleId
    [FullName] [nvarchar](255),
    [Email] [nvarchar](255),
    [Status] [nvarchar](50) NULL,     -- Active, Inactive, Banned, Suspended
    ...
)
```

### Bảng `Roles`:
```sql
CREATE TABLE [dbo].[Roles](
    [RoleId] [int] PRIMARY KEY,
    [RoleName] [nvarchar](50),       -- 'Admin', 'User', 'Moderator', etc.
    [Status] [nvarchar](50) NULL,     -- Active, Inactive
)
```

## 🔍 Cách Phân Biệt

### 1. **Check theo RoleName** (Khuyên dùng):
```typescript
import { checkIsAdmin } from '@/utils/auth'
import { getCurrentUser } from '@/lib/api'

const user = getCurrentUser()
const isAdmin = checkIsAdmin(user) // true/false
```

### 2. **Check theo RoleId**:
```typescript
// Nếu RoleId = 1 → Admin (thường admin là role đầu tiên)
// Nếu RoleId = 2 → User (thường user là role thứ hai)
const isAdmin = user.roleId === 1
```

### 3. **Check trực tiếp RoleName**:
```typescript
const isAdmin = user.roleName === 'Admin'
```

## 🛠️ Sử Dụng trong Code

### **1. Protect Admin Routes:**
```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, checkIsAdmin } from '@/utils/auth'

function AdminDashboard() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  useEffect(() => {
    if (!checkIsAdmin(user)) {
      navigate('/home') // Redirect if not admin
    }
  }, [navigate, user])

  return <div>Admin Dashboard</div>
}
```

### **2. Conditional Rendering:**
```typescript
import { checkIsAdmin } from '@/utils/auth'
import { getCurrentUser } from '@/lib/api'

function Navigation() {
  const user = getCurrentUser()
  const isAdmin = checkIsAdmin(user)

  return (
    <nav>
      {isAdmin && (
        <Link to="/admin/dashboard">Admin Dashboard</Link>
      )}
    </nav>
  )
}
```

### **3. API Calls với Admin Check:**
```typescript
import { checkIsAdmin } from '@/utils/auth'
import { userService } from '@/services'
import { getCurrentUser } from '@/lib/api'

async function handleGetAllUsers() {
  const user = getCurrentUser()
  if (!checkIsAdmin(user)) {
    alert('Bạn không có quyền truy cập!')
    return
  }
  
  try {
    const users = await userService.getAllUsers()
    console.log(users)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## 📝 Các Role Mặc Định

Theo database schema, dự án thường có các role sau:

1. **Admin** - `RoleId = 1`
   - Full access to all features
   - Can manage users, orders, transactions
   - Can access admin dashboard

2. **User** - `RoleId = 2` (thường là default)
   - Standard user access
   - Can browse, purchase, use AI features
   - Cannot access admin features

3. **Moderator** - `RoleId = 3` (optional)
   - Can moderate content, feedback
   - Cannot manage system settings

## 🚀 Files Tạo Mới

1. **`src/types/role.ts`**
   - Enum `UserRole` với constants: Admin, User, Moderator
   - Helper functions: `isAdmin()`, `hasRole()`, `getUserRole()`

2. **`src/utils/auth.ts`**
   - `checkIsAdmin(user)` - Check if user is admin
   - `hasRole(user, role)` - Check if user has specific role
   - `getUserRole(user)` - Get role name from user

3. **Updated `src/types/dto/user.ts`**
   - Added `roleName?: string | null` field to UserDto

## ✅ Best Practices

### ✅ DO:
```typescript
// 1. Luôn check role trước khi call admin API
const user = getCurrentUser()
if (checkIsAdmin(user)) {
  await userService.getAllUsers()
}

// 2. Protect routes với useEffect
useEffect(() => {
  if (!checkIsAdmin(user)) {
    navigate('/unauthorized')
  }
}, [])

// 3. Conditional rendering
{checkIsAdmin(user) && <AdminPanel />}
```

### ❌ DON'T:
```typescript
// 1. Don't hardcode role checks
❌ if (user.roleId === 1) // Bad - hardcoded

// 2. Don't expose admin features without check
❌ <Link to="/admin">Admin</Link> // Bad - should check role

// 3. Don't assume user has role
❌ const admins = users.filter(u => u.roleId === 1) // Bad - use roleName
```

## 🧪 Testing

### Test Admin Access:
```typescript
// Mock user with admin role
const mockAdmin = {
  userId: 1,
  roleName: 'Admin',
  roleId: 1
}

console.log(checkIsAdmin(mockAdmin)) // true

// Mock regular user
const mockUser = {
  userId: 2,
  roleName: 'User',
  roleId: 2
}

console.log(checkIsAdmin(mockUser)) // false
```

## 📌 Tóm Tắt

- **Admin** → `roleName === 'Admin'` hoặc `roleId === 1`
- **User** → `roleName === 'User'` hoặc `roleId === 2`
- **Check role**: Dùng `checkIsAdmin(user)` từ `@/utils/auth`
- **Protect routes**: Check trong `useEffect` và redirect nếu không phải admin
- **Conditional rendering**: Show/hide admin features dựa trên role



---

# 📚 API Endpoints Guide – EduPrompt

Tài liệu này tổng hợp TẤT CẢ endpoint REST frontend đang dùng, nhóm theo tính năng. Dùng để test nhanh trên Swagger/Postman.

Lưu ý
- Base URL (dev): `https://localhost:7199`
- Paths là tương đối; Axios `api` đã set baseURL.
- Một số hệ thống BE dùng cả `/api/Auth` và `/api/auth`.

## 🔐 Auth
| Method | Path | Mô tả |
|---:|---|---|
| POST | `/api/auth/login` | Đăng nhập → trả `accessToken`, `refreshToken`, `user` |
| POST | `/api/auth/refresh` | Refresh token (nếu có) |
| POST | `/api/auth/logout` | Đăng xuất (nếu có) |
| GET | `/api/auth/me` | Lấy hồ sơ user hiện tại |
| GET | `/api/Auth/me` | Biến thể viết hoa (nếu BE dùng) |

## 👤 Users
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/Users` | (Admin) Danh sách users |
| GET | `/api/Users/{id}` | Chi tiết user |

## 💼 Wallets & 💳 Payments
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/wallets/user/{userId}` | Lấy ví theo user |
| POST | `/api/wallets` | Tạo/kích hoạt ví |
| GET | `/api/wallets/{walletId}` | Lấy ví theo id |
| POST | `/api/payments/wallets/{walletId}/topup` | Tạo giao dịch nạp ví (VNPay/…) |

## 🗂️ Storage Templates
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/storage-templates/public` | Public templates (filter: `grade`, `subject`, `chapter`) |
| GET | `/api/storage-templates/my-storage` | Template của user hiện tại |
| GET | `/api/storage-templates/{id}` | Chi tiết template |
| POST | `/api/storage-templates` | (Admin) Tạo template |
| PUT | `/api/storage-templates/{id}` | Sửa template |
| DELETE | `/api/storage-templates/{id}` | Xoá template |

Ví dụ filter public:
```
GET /api/storage-templates/public?grade=12&subject=To%C3%A1n&chapter=Ch%C6%B0%C6%A1ng+1
```

## ⭐ Feedbacks / Reviews
### Storage‑based (chính thức)
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/feedbacks/storage/{storageId}` | Danh sách feedback theo storageId |
| GET | `/api/feedbacks/storage/{storageId}/count` | Số lượng feedback |
| GET | `/api/feedbacks/storage/{storageId}/rating` | Điểm trung bình |

### Legacy (một số BE map `postId == storageId`)
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/feedbacks/post/{postId}` | Danh sách feedback theo postId |
| GET | `/api/feedbacks/post/{postId}/count` | Số lượng feedback theo postId |
| GET | `/api/feedbacks/post/{postId}/rating` | Điểm trung bình theo postId |

### Theo User
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/feedbacks/user/{userId}` | Feedback do user tạo |

### CRUD Feedback
| Method | Path | Body mẫu |
|---:|---|---|
| POST | `/api/feedbacks` | `{ "storageId": 10, "comment": "...", "rating": 5, "packageId": 7 }` |
| GET | `/api/feedbacks/{id}` | Chi tiết feedback |
| PUT | `/api/feedbacks/{id}` | Cập nhật feedback |
| DELETE | `/api/feedbacks/{id}` | Xoá feedback |

## 📦 Packages & 🏷️ Categories
### Packages
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/packages` | Danh sách gói |
| GET | `/api/packages/{id}` | Chi tiết gói |
| POST | `/api/packages` | (Admin) Tạo gói |
| PUT | `/api/packages/{id}` | (Admin) Sửa gói |
| DELETE | `/api/packages/{id}` | (Admin) Xoá gói |

### Categories
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/package-categories` | Danh sách phân loại |
| GET | `/api/package-categories/{id}` | Chi tiết phân loại |
| POST | `/api/package-categories` | Tạo phân loại |
| PUT | `/api/package-categories/{id}` | Sửa phân loại |
| DELETE | `/api/package-categories/{id}` | Xoá phân loại |

## 🛒 Cart & 🧾 Orders
> Tùy BE triển khai, một số route có/không.

### Cart
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/carts` | Lấy cart |
| POST | `/api/carts` | Tạo cart / thêm item |
| GET | `/api/carts/items` | Lấy items trong cart |

### Orders
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/orders` | Danh sách orders |
| GET | `/api/orders/{orderId}` | Chi tiết order |
| GET | `/api/orders/user/{userId}` | Orders theo user |
| POST | `/api/orders` | Tạo order |
| PUT | `/api/orders/{orderId}` | Cập nhật order |
| DELETE | `/api/orders/{orderId}` | Xoá order |

## 🤖 AI History
| Method | Path | Mô tả |
|---:|---|---|
| GET | `/api/AIHistory` | Danh sách (admin) |
| GET | `/api/AIHistory/{id}` | Chi tiết |
| GET | `/api/AIHistory/user/{userId}` | Lịch sử theo user |

## ⚡ Quick Examples
```bash
# Auth
POST /api/auth/login
GET  /api/auth/me

# Nạp ví
POST /api/payments/wallets/1/topup

# Public templates Toán 12 Chương 1
GET /api/storage-templates/public?grade=12&subject=To%C3%A1n&chapter=Ch%C6%B0%C6%A1ng+1

# Feedbacks storage=10
GET /api/feedbacks/storage/10
GET /api/feedbacks/storage/10/count
GET /api/feedbacks/storage/10/rating
```
