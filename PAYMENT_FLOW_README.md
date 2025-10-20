# EduPrompt Payment Flow - Hướng dẫn sử dụng

## Tổng quan
Dự án EduPrompt đã được tích hợp đầy đủ luồng thanh toán từ shopping cart đến payment confirmation. Luồng này được thiết kế để test API và phục vụ cho dự án chính sau này.

## Luồng thanh toán hoàn chỉnh

### 1. Shopping Cart (`/cart`)
- **Chức năng**: Xem giỏ hàng, thêm/xóa/sửa sản phẩm
- **API endpoints**: 
  - `GET /api/cart` - Lấy giỏ hàng
  - `POST /api/cart/items` - Thêm sản phẩm
  - `PUT /api/cart/items/{id}` - Cập nhật số lượng
  - `DELETE /api/cart/items/{id}` - Xóa sản phẩm
  - `DELETE /api/cart` - Xóa toàn bộ giỏ hàng

### 2. Checkout (`/checkout`)
- **Chức năng**: Xem lại đơn hàng và chọn phương thức thanh toán
- **API endpoints**:
  - `GET /api/cart` - Lấy giỏ hàng để review
  - `GET /api/paymentmethod` - Lấy danh sách phương thức thanh toán
  - `GET /api/wallet/user/{userId}` - Lấy thông tin ví
  - `POST /api/order/create-from-cart` - Tạo đơn hàng từ giỏ hàng

### 3. Payment (`/payment`)
- **Chức năng**: Xử lý thanh toán với các phương thức khác nhau
- **API endpoints**:
  - `POST /api/transaction` - Tạo giao dịch
  - `PUT /api/transaction/{id}` - Cập nhật trạng thái giao dịch
  - `POST /api/wallet/deduct-funds` - Trừ tiền từ ví (nếu dùng ví)

### 4. Order Confirmation (`/order-confirmation`)
- **Chức năng**: Hiển thị kết quả đặt hàng thành công
- **Dữ liệu**: Order details và transaction details

### 5. Order History (`/order-history`)
- **Chức năng**: Xem lịch sử đơn hàng và quản lý đơn hàng
- **API endpoints**:
  - `GET /api/order/my` - Lấy đơn hàng của user
  - `POST /api/order/{id}/cancel` - Hủy đơn hàng

### 6. Wallet (`/wallet`)
- **Chức năng**: Quản lý ví và giao dịch
- **API endpoints**:
  - `GET /api/wallet/user/{userId}` - Lấy thông tin ví
  - `POST /api/wallet` - Tạo ví mới
  - `POST /api/wallet/add-funds` - Nạp tiền vào ví
  - `POST /api/wallet/deduct-funds` - Trừ tiền từ ví
  - `GET /api/transaction/wallet/{walletId}` - Lấy lịch sử giao dịch

## Cách test luồng thanh toán

### Bước 1: Thêm sản phẩm vào giỏ hàng
1. Truy cập trang chủ (`/home`)
2. Scroll xuống phần "Featured Packages"
3. Click "Add to Cart" trên bất kỳ package nào
4. Sản phẩm sẽ được thêm vào giỏ hàng

### Bước 2: Xem và quản lý giỏ hàng
1. Click vào icon giỏ hàng 🛒 trên header hoặc truy cập `/cart`
2. Xem danh sách sản phẩm trong giỏ hàng
3. Có thể thay đổi số lượng hoặc xóa sản phẩm
4. Click "Proceed to Checkout" để tiếp tục

### Bước 3: Checkout
1. Trang checkout sẽ hiển thị tóm tắt đơn hàng
2. Chọn phương thức thanh toán
3. Thêm ghi chú đơn hàng (tùy chọn)
4. Click "Proceed to Payment"

### Bước 4: Thanh toán
1. Trang payment hiển thị chi tiết đơn hàng và phương thức thanh toán
2. Click "Pay $XX.XX" để xử lý thanh toán
3. Hệ thống sẽ tạo transaction và cập nhật trạng thái
4. Sau khi thành công, sẽ redirect đến trang confirmation

### Bước 5: Xác nhận đơn hàng
1. Trang confirmation hiển thị thông tin đơn hàng và giao dịch
2. Có thể download receipt (mock)
3. Có thể track order hoặc tiếp tục shopping

### Bước 6: Quản lý đơn hàng và ví
1. Truy cập `/order-history` để xem lịch sử đơn hàng
2. Truy cập `/wallet` để quản lý ví và giao dịch
3. Có thể nạp tiền vào ví để test thanh toán bằng ví

## Mock Data
Hệ thống có sẵn mock data để test khi API chưa sẵn sàng:
- Mock packages với giá và mô tả
- Mock payment methods
- Mock wallet với số dư
- Mock orders và transactions

## API Integration
Tất cả các API calls đều được tích hợp với:
- Authentication headers
- Error handling
- Loading states
- Success/error notifications

## Responsive Design
Tất cả các trang đều được thiết kế responsive và tương thích với:
- Desktop
- Tablet
- Mobile

## Lưu ý quan trọng
1. **Authentication**: Cần đăng nhập để sử dụng các chức năng thanh toán
2. **API Base URL**: Đảm bảo `VITE_API_BASE_URL` được cấu hình đúng
3. **Mock Data**: Có thể sử dụng mock data khi API chưa sẵn sàng
4. **Error Handling**: Tất cả các API calls đều có error handling
5. **State Management**: Sử dụng React state và localStorage/sessionStorage

## Cấu trúc file
```
src/
├── components/
│   ├── Page/
│   │   ├── ShoppingCartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── PaymentPage.tsx
│   │   ├── OrderConfirmationPage.tsx
│   │   ├── OrderHistoryPage.tsx
│   │   └── WalletPage.tsx
│   ├── Shopping/
│   │   └── ShoppingSection.tsx
│   └── Layout/
│       └── CartIcon.tsx
├── lib/
│   └── api.ts (updated with payment APIs)
└── router/
    └── ProtectRouter.tsx (updated with new routes)
```

Luồng thanh toán này đã được thiết kế kỹ càng và sẵn sàng để test API cũng như phục vụ cho dự án chính sau này.
