# Services Documentation

Thư mục này chứa tất cả các service files để call API từ backend.

## 📁 Cấu trúc Services

### 🔐 Authentication Services
- **authService.ts** - Đăng nhập, đăng ký, refresh token
- **userService.ts** - Quản lý user

### 💬 Communication Services
- **conversationService.ts** - Quản lý cuộc hội thoại
- **messageService.ts** - Quản lý tin nhắn

### 📦 Package Services
- **packageService.ts** - Quản lý gói
- **packageCategoryService.ts** - Danh mục gói
- **cartService.ts** - Giỏ hàng
- **orderService.ts** - Đơn hàng

### 💰 Payment Services
- **walletService.ts** - Ví tiền
- **paymentMethodService.ts** - Phương thức thanh toán
- **transactionService.ts** - Giao dịch

### 📝 Content Services
- **postService.ts** - Bài đăng
- **feedbackService.ts** - Phản hồi
- **categoryService.ts** - Danh mục

### 🤖 AI Services
- **promptInstanceService.ts** - Prompt instances
- **AIHistoryService.ts** - Lịch sử AI
- **aiService.ts** - Integration với n8n AI

### ⭐ Favorite Services
- **wishlistService.ts** - Danh sách yêu thích
- **storageTemplateService.ts** - Template đã lưu

### 🛠️ Admin Services
- **roleService.ts** - Quản lý quyền

## 🚀 Cách sử dụng

### Import service cần thiết:
```typescript
import { authService, packageService, cartService } from '@/services'
```

### Ví dụ sử dụng:

#### 1. Authentication
```typescript
import { authService } from '@/services'

// Đăng nhập
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Đăng ký
await authService.register({
  email: 'newuser@example.com',
  password: 'password123',
  fullName: 'New User'
})

// Lấy user hiện tại
const currentUser = await authService.getCurrentUser()

// Đăng xuất
await authService.logout()
```

#### 2. Package Service
```typescript
import { packageService } from '@/services'

// Lấy tất cả packages
const packages = await packageService.getAllPackages()

// Lấy package theo ID
const package = await packageService.getPackageById(1)

// Tìm kiếm packages
const results = await packageService.searchPackages('math')
```

#### 3. Cart Service
```typescript
import { cartService } from '@/services'

// Lấy giỏ hàng
const cart = await cartService.getCart()

// Thêm sản phẩm
await cartService.addItem({
  packageId: 1,
  quantity: 2
})

// Cập nhật số lượng
await cartService.updateItem(cartDetailId, 3)

// Xóa sản phẩm
await cartService.removeItem(cartDetailId)

// Xóa toàn bộ giỏ hàng
await cartService.clearCart()
```

#### 4. Order Service
```typescript
import { orderService } from '@/services'

// Tạo đơn hàng từ giỏ hàng
const order = await orderService.createOrderFromCart({
  notes: 'Giao hàng nhanh'
})

// Lấy đơn hàng của tôi
const myOrders = await orderService.getMyOrders()

// Hủy đơn hàng
await orderService.cancelOrder(orderId)
```

#### 5. Wallet Service
```typescript
import { walletService } from '@/services'

// Nạp tiền vào ví
await walletService.addFunds({
  userId: 1,
  amount: 100000
})

// Trừ tiền
await walletService.deductFunds({
  userId: 1,
  amount: 50000
})

// Lấy số dư
const balance = await walletService.getWalletBalance(userId)
```

#### 6. Message & Conversation Service
```typescript
import { conversationService, messageService } from '@/services'

// Tạo cuộc hội thoại
const conversation = await conversationService.createConversation({
  title: 'Chat với AI'
})

// Gửi tin nhắn
const message = await messageService.sendMessage({
  conversationId: conversation.conversationId,
  content: 'Xin chào!',
  isUserMessage: true
})

// Lấy tin nhắn
const messages = await messageService.getMessagesByConversationId(conversationId)
```

## 🔧 Configuration

Tất cả services sử dụng axios instance từ `src/lib/api.ts`:
- Base URL: `http://localhost:5217`
- Automatic JWT token injection
- Token refresh handling
- Error handling

## 📋 Tổng kết Services

| Service | File | Purpose |
|---------|------|---------|
| authService | authService.ts | Authentication & authorization |
| userService | userService.ts | User management |
| conversationService | conversationService.ts | Conversation management |
| messageService | messageService.ts | Message handling |
| packageService | packageService.ts | Package CRUD |
| packageCategoryService | packageCategoryService.ts | Category management |
| cartService | cartService.ts | Shopping cart |
| orderService | orderService.ts | Order processing |
| walletService | walletService.ts | Wallet operations |
| paymentMethodService | paymentMethodService.ts | Payment methods |
| transactionService | transactionService.ts | Transactions |
| postService | postService.ts | Posts & content |
| feedbackService | feedbackService.ts | User feedback |
| categoryService | categoryService.ts | Categories |
| promptInstanceService | promptInstanceService.ts | Prompt instances |
| AIHistoryService | AIHistoryService.ts | AI history |
| wishlistService | wishlistService.ts | Wishlist |
| storageTemplateService | storageTemplateService.ts | Saved templates |
| roleService | roleService.ts | Role management |
| aiService | aiService.ts | AI integration (n8n) |

## ✅ TypeScript Support

Tất cả services đều có TypeScript types và interfaces riêng. Import types:
```typescript
import type { LoginRequest, User, Package, Cart } from '@/services'
```

