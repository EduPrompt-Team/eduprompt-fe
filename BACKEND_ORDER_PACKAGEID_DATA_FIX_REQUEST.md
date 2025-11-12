# Yêu Cầu Backend: Kiểm Tra và Sửa Dữ Liệu Order PackageId

## Vấn Đề Hiện Tại

Từ log frontend, tôi thấy:
- Order có `status: "Completed"` nhưng `packageId: null`
- Order có `items: []` (rỗng)
- Order có `payments: []` (rỗng)
- Template đang tìm `packageId: 4` nhưng không tìm thấy trong bất kỳ order nào

**Ví dụ từ log:**
```json
{
  "orderId": 2,
  "userId": 1,
  "status": "Completed",
  "packageId": null,  // ⚠️ NULL
  "items": [],        // ⚠️ RỖNG
  "payments": []      // ⚠️ RỖNG
}
```

## Yêu Cầu Kiểm Tra

### 1. Kiểm Tra Database

**Câu hỏi cần trả lời:**
1. Order có `OrderId = 2` trong database có `PackageID` không?
2. Nếu có, tại sao API không trả về?
3. Nếu không có, order này có phải là order mua package không?
4. Có order nào khác có `PackageID = 4` và `Status = 'Completed'` cho `UserId = 1` không?

**SQL Query để kiểm tra:**
```sql
-- Kiểm tra order 2
SELECT 
    OrderId,
    UserId,
    PackageID,
    TotalAmount,
    Status,
    OrderDate
FROM Orders
WHERE OrderId = 2;

-- Kiểm tra tất cả orders của user 1 có packageId 4
SELECT 
    OrderId,
    UserId,
    PackageID,
    TotalAmount,
    Status,
    OrderDate
FROM Orders
WHERE UserId = 1 
  AND PackageID = 4
  AND Status IN ('Completed', 'Paid');

-- Kiểm tra tất cả orders Completed/Paid của user 1
SELECT 
    OrderId,
    UserId,
    PackageID,
    TotalAmount,
    Status,
    OrderDate
FROM Orders
WHERE UserId = 1 
  AND Status IN ('Completed', 'Paid');

-- Kiểm tra OrderItems (nếu có)
SELECT 
    OrderDetailId,
    OrderId,
    PackageID,
    Quantity,
    UnitPrice
FROM OrderItems  -- Hoặc tên table tương ứng
WHERE OrderId IN (
    SELECT OrderId 
    FROM Orders 
    WHERE UserId = 1 AND Status IN ('Completed', 'Paid')
);
```

### 2. Kiểm Tra API Response

**Yêu cầu:**
- Kiểm tra `GET /api/orders/my` có trả về `packageId` không?
- Kiểm tra `GET /api/orders/2` có trả về `packageId` không?
- Nếu database có `PackageID` nhưng API không trả về → Cần sửa mapping trong DTO

### 3. Sửa Dữ Liệu (Nếu Cần)

**Nếu order này thực sự là order mua package nhưng thiếu `PackageID`:**

1. **Xác định packageId từ context:**
   - Kiểm tra user đã mua package nào?
   - Kiểm tra template nào user đang xem?
   - Kiểm tra lịch sử giao dịch

2. **Update database:**
   ```sql
   -- Ví dụ: Update order 2 với packageId 4
   UPDATE Orders
   SET PackageID = 4
   WHERE OrderId = 2 
     AND PackageID IS NULL;
   ```

3. **Hoặc tạo order mới:**
   - Nếu order này không phải là order mua package
   - Tạo order mới với `PackageID = 4` và `Status = 'Completed'`

## Yêu Cầu Sửa Backend

### 1. Đảm Bảo PackageID Được Lưu Khi Tạo Order

**Khi tạo order mua package, đảm bảo:**
- `PackageID` được set trong `Orders` table
- Hoặc `PackageID` được set trong `OrderItems` table (nếu order có nhiều items)

**Code cần kiểm tra:**
```csharp
// Khi tạo order
var order = new Order
{
    UserId = userId,
    PackageID = packageId,  // ✅ Đảm bảo set PackageID
    TotalAmount = package.Price,
    Status = "Pending",
    OrderDate = DateTime.UtcNow
};
```

### 2. Đảm Bảo PackageID Được Trả Về Trong API

**File cần sửa:**
- `OrderServiceDto` - Thêm `PackageId` property
- `MapToServiceDto()` - Map `PackageId` từ entity

**Xem chi tiết trong:** `BACKEND_ORDER_PACKAGEID_FIX_REQUEST.md`

### 3. Đảm Bảo Endpoint Check-Package Hoạt Động

**Endpoint:** `GET /api/payments/check-package/{packageId}`

**Yêu cầu:**
- Kiểm tra tất cả orders `Completed/Paid` của user
- Tìm order có `PackageID = packageId`
- Hoặc tìm trong `OrderItems` nếu order có nhiều packages
- Trả về `isPaid: true` nếu tìm thấy

**Xem chi tiết trong:** `BACKEND_ORDER_PACKAGEID_FIX_REQUEST.md`

## Test Cases

### Test Case 1: Kiểm tra order có packageId trong database
```
Query: SELECT * FROM Orders WHERE OrderId = 2
Expected: PackageID không null (nếu là order mua package)
```

### Test Case 2: Kiểm tra API trả về packageId
```
GET /api/orders/2
Expected: Response có "packageId": 4 (hoặc giá trị tương ứng)
```

### Test Case 3: Kiểm tra endpoint check-package
```
GET /api/payments/check-package/4
Expected: { "packageId": 4, "isPaid": true } (nếu user đã mua)
```

## Ưu Tiên

1. **Cao:** Kiểm tra database xem order có `PackageID` không
2. **Cao:** Sửa API để trả về `packageId` trong order response
3. **Cao:** Sửa endpoint `/api/payments/check-package/{packageId}` để hoạt động đúng
4. **Trung bình:** Sửa dữ liệu nếu order thiếu `PackageID`

## Lý Do

Frontend không thể xác định user đã mua package hay chưa vì:
- Order response không có `packageId`
- Endpoint check-package không hoạt động đúng
- Có thể dữ liệu trong database không đầy đủ

## Liên Hệ

Nếu cần thêm thông tin hoặc có câu hỏi, vui lòng liên hệ frontend team.

