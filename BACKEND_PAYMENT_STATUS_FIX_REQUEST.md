# Yêu Cầu Backend: Fix Kiểm Tra Trạng Thái Thanh Toán

## Vấn Đề Hiện Tại

Frontend đang gặp các vấn đề sau khi kiểm tra trạng thái thanh toán:

1. **Lỗi 403 Forbidden** khi gọi `GET /api/payment-methods`
   - Endpoint này yêu cầu authentication nhưng frontend không thể truy cập
   - Hiện tại frontend phải bỏ qua lỗi và dùng `paymentMethodId = 1` mặc định

2. **Không nhận diện được trạng thái đã thanh toán sau khi reload trang**
   - Sau khi user thanh toán thành công và reload trang, hệ thống lại bắt thanh toán lại
   - Frontend phải dùng localStorage để cache trạng thái thanh toán (không mong muốn)

3. **Logic kiểm tra payment status không nhất quán**
   - Frontend phải kiểm tra cả order status và payment record
   - Có thể có trường hợp order status = "Completed" nhưng không có payment record

## Yêu Cầu Backend

### 1. Fix Endpoint `GET /api/payment-methods`

**Vấn đề:**
- Endpoint trả về `403 Forbidden` cho authenticated users
- Frontend cần truy cập để lấy danh sách payment methods khi thanh toán

**Yêu cầu:**
- Cho phép authenticated users truy cập endpoint này
- Hoặc tạo endpoint mới `GET /api/payment-methods/public` cho các payment methods công khai
- Hoặc trả về payment method mặc định (Wallet) trong response của các endpoint khác

**Endpoint hiện tại:**
```
GET /api/payment-methods
```

**Response mong muốn:**
```json
[
  {
    "paymentMethodId": 1,
    "methodName": "Wallet",
    "provider": "Internal",
    "isActive": true,
    "processingFee": 0
  },
  ...
]
```

### 2. Tạo Endpoint Kiểm Tra Trạng Thái Thanh Toán

**Vấn đề:**
- Frontend phải gọi nhiều endpoint để kiểm tra:
  1. `GET /api/orders/my` - Lấy tất cả orders
  2. Filter orders theo `packageId`
  3. `GET /api/payments/orders/{orderId}` - Kiểm tra payment của order
  4. Kiểm tra cả order status và payment status

**Yêu cầu:**
Tạo endpoint mới để kiểm tra trạng thái thanh toán của một package cụ thể:

```
GET /api/payments/check-package/{packageId}
```

**Response:**
```json
{
  "packageId": 123,
  "isPaid": true,
  "orderId": 456,
  "paymentId": 789,
  "paidAt": "2025-11-12T10:30:00Z",
  "amount": 1231231,
  "paymentMethod": "Wallet",
  "status": "Paid"
}
```

**Hoặc nếu chưa thanh toán:**
```json
{
  "packageId": 123,
  "isPaid": false
}
```

**Lưu ý:**
- Endpoint này chỉ trả về thông tin của user hiện tại (authenticated user)
- Nếu user chưa thanh toán package này, trả về `isPaid: false`
- Nếu user đã thanh toán, trả về đầy đủ thông tin payment
- Trả về `200 OK` trong cả hai trường hợp (không dùng 404)

### 3. Đảm Bảo Payment Record Được Tạo Khi Order Completed

**Vấn đề:**
- Khi order status được update thành "Completed", payment record có thể không được tạo tự động
- Frontend phải tạo payment record thủ công nhưng endpoint `POST /api/payments` không hỗ trợ

**Yêu cầu:**
- Khi order status được update thành "Completed" hoặc "Paid", backend tự động tạo payment record với:
  - `orderID`: ID của order
  - `userID`: ID của user
  - `amount`: Tổng tiền của order
  - `paymentMethod`: "Wallet" (hoặc method tương ứng)
  - `provider`: "Internal"
  - `status`: "Paid"
  - `createdAt`: Thời gian hiện tại

**Hoặc:**
- Tạo endpoint `POST /api/payments` để frontend có thể tạo payment record thủ công:
```
POST /api/payments
Content-Type: application/json

{
  "orderID": 456,
  "userID": 123,
  "amount": 1231231,
  "paymentMethod": "Wallet",
  "provider": "Internal",
  "status": "Paid"
}
```

### 4. Cải Thiện Endpoint `GET /api/orders/my`

**Yêu cầu:**
- Endpoint này nên bao gồm thông tin payment status trong response
- Hoặc có query parameter để filter orders đã thanh toán

**Ví dụ:**
```
GET /api/orders/my?status=Completed
GET /api/orders/my?paid=true
```

**Response với payment info:**
```json
[
  {
    "orderId": 456,
    "userId": 123,
    "packageID": 789,
    "totalAmount": 1231231,
    "orderDate": "2025-11-12T10:30:00Z",
    "status": "Completed",
    "items": [...],
    "payment": {
      "paymentId": 101,
      "status": "Paid",
      "paidAt": "2025-11-12T10:30:00Z"
    }
  },
  ...
]
```

## Database Schema Reference

Dựa trên schema hiện tại:

### Tables liên quan:
- **Orders**: `OrderId`, `UserId`, `PackageID`, `TotalAmount`, `Status`
- **Payments**: `PaymentID`, `OrderID`, `UserID`, `Amount`, `Status`, `PaymentMethod`, `Provider`
- **Transactions**: `TransactionID`, `OrderID`, `WalletID`, `Amount`, `Status`

## Test Cases

### Test Case 1: Kiểm tra package chưa thanh toán
```
GET /api/payments/check-package/123
Response: { "packageId": 123, "isPaid": false }
```

### Test Case 2: Kiểm tra package đã thanh toán
```
GET /api/payments/check-package/123
Response: {
  "packageId": 123,
  "isPaid": true,
  "orderId": 456,
  "paymentId": 789,
  "paidAt": "2025-11-12T10:30:00Z",
  "amount": 1231231,
  "status": "Paid"
}
```

### Test Case 3: Payment methods endpoint
```
GET /api/payment-methods
Response: 200 OK với danh sách payment methods (không phải 403)
```

### Test Case 4: Tự động tạo payment khi order completed
```
PATCH /api/orders/456/status?status=Completed
→ Backend tự động tạo payment record với status = "Paid"
```

## Ưu Tiên

1. **Cao**: Fix endpoint `GET /api/payment-methods` (403 error)
2. **Cao**: Tạo endpoint `GET /api/payments/check-package/{packageId}`
3. **Trung bình**: Đảm bảo payment record được tạo tự động khi order completed
4. **Thấp**: Cải thiện endpoint `GET /api/orders/my` với payment info

## Lợi Ích

- Frontend không cần dùng localStorage để cache payment status
- Giảm số lượng API calls (từ 2-3 calls xuống 1 call)
- Logic kiểm tra payment status nhất quán và đáng tin cậy
- Trải nghiệm người dùng tốt hơn (không bị bắt thanh toán lại sau reload)

## Liên Hệ

Nếu có câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ frontend team.

