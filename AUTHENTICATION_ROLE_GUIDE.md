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

