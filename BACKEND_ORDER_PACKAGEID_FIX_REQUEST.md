# Yêu Cầu Backend: Sửa Order Response và Payment Check Endpoint

## Vấn Đề Hiện Tại

1. **Endpoint `/api/payments/check-package/{packageId}` trả về `isPaid: false`** mặc dù user đã mua gói
2. **Order response không có `packageId` field** trong:
   - `GET /api/orders/my` - Danh sách orders của user
   - `GET /api/orders/{orderId}` - Chi tiết order

## Yêu Cầu Sửa

### 1. Sửa Endpoint `GET /api/payments/check-package/{packageId}`

**Vấn đề:** Endpoint trả về `isPaid: false` mặc dù user đã mua gói.

**Yêu cầu:**
- Kiểm tra tất cả orders của user có status `Completed` hoặc `Paid`
- Với mỗi order, kiểm tra xem có chứa `packageId` này không (trong order hoặc order items)
- Nếu có payment với status `Paid` hoặc `Completed` cho order đó, trả về `isPaid: true`

**Response khi đã thanh toán:**
```json
{
  "packageId": 4,
  "isPaid": true,
  "orderId": 17,
  "paymentId": 123,
  "paidAt": "2025-11-12T14:50:49Z",
  "amount": 123812,
  "paymentMethod": "Wallet",
  "status": "Paid"
}
```

**Response khi chưa thanh toán:**
```json
{
  "packageId": 4,
  "isPaid": false
}
```

### 2. Thêm `packageId` vào Order Response

**Vấn đề:** Order response không có `packageId`, frontend không thể kiểm tra user đã mua package nào.

**Yêu cầu:**

#### 2.1. `GET /api/orders/my`
Thêm `packageId` vào mỗi order trong response:
```json
[
  {
    "orderId": 17,
    "userId": 1,
    "packageId": 4,  // ⭐ THÊM FIELD NÀY
    "totalAmount": 123812,
    "status": "Completed",
    "items": [
      {
        "packageId": 4,  // ⭐ HOẶC TRONG ITEMS
        "quantity": 1,
        "unitPrice": 123812
      }
    ]
  }
]
```

#### 2.2. `GET /api/orders/{orderId}`
Thêm `packageId` vào order detail response:
```json
{
  "orderId": 17,
  "userId": 1,
  "packageId": 4,  // ⭐ THÊM FIELD NÀY
  "totalAmount": 123812,
  "status": "Completed",
  "items": [
    {
      "packageId": 4,  // ⭐ HOẶC TRONG ITEMS
      "quantity": 1,
      "unitPrice": 123812
    }
  ]
}
```

**Lưu ý:**
- Nếu order có nhiều items với packageId khác nhau, có thể:
  - Trả về `packageId` của item đầu tiên
  - Hoặc trả về array `packageIds: [4, 5, 6]`
  - Hoặc chỉ trả về trong `items` array

### 3. Cải Thiện Order Service/Repository

**Yêu cầu:**
- Khi query orders, include `PackageID` từ bảng `Orders` (nếu có)
- Hoặc include `PackageID` từ `OrderItems` (nếu order có items)
- Map `PackageID` vào response DTO

## Test Cases

1. **Test `/api/payments/check-package/4`:**
   - User đã mua package 4 → Trả về `isPaid: true`
   - User chưa mua package 4 → Trả về `isPaid: false`

2. **Test `GET /api/orders/my`:**
   - Response phải có `packageId` trong mỗi order
   - Hoặc `packageId` trong `items` array

3. **Test `GET /api/orders/{orderId}`:**
   - Response phải có `packageId` trong order detail
   - Hoặc `packageId` trong `items` array

## Ưu Tiên

1. **Cao:** Sửa endpoint `/api/payments/check-package/{packageId}` để trả về đúng `isPaid`
2. **Cao:** Thêm `packageId` vào order response (`GET /api/orders/my` và `GET /api/orders/{orderId}`)

## Lý Do

Frontend hiện tại phải:
1. Gọi `GET /api/orders/my` để lấy tất cả orders
2. Gọi `GET /api/orders/{orderId}` cho từng order để tìm `packageId`
3. Gọi `GET /api/payments/orders/{orderId}` để kiểm tra payment

Điều này rất không hiệu quả và chậm. Nếu backend trả về `packageId` trong order response và sửa endpoint check-package, frontend chỉ cần 1 API call.

