# 🚨 CRITICAL: Backend Must Fix Order PackageId Issue

**Date:** 2025-11-02  
**Priority:** 🔴 **CRITICAL - BLOCKING USER FEATURE**

---

## 🚨 Current Issue

Frontend không thể xác định user đã mua package vì:

1. **Endpoint `/api/payments/check-package/{packageId}` trả về:**
   ```json
   {
     "packageId": 4,
     "isPaid": false,
     "orderId": null,
     "paymentId": null,
     "status": null
   }
   ```

2. **Orders có status "Completed" nhưng:**
   ```json
   {
     "orderId": 2,
     "status": "Completed",
     "packageId": null,  // ❌ NULL
     "items": [],       // ❌ EMPTY
     "payments": []     // ❌ EMPTY
   }
   ```

3. **Kết quả:** User đã mua package nhưng frontend không thể verify → Nút "Mở Chat" bị disable

---

## ✅ Required Backend Fixes

### 1. **Fix `/api/payments/check-package/{packageId}` Endpoint**

**File:** `Eduprompt.BLL/Services/PaymentService.cs`

**Current Issue:** Endpoint không tìm thấy order/payment cho package

**Required Logic:**
```csharp
public async Task<PackagePaymentStatusDto> CheckPackagePaymentAsync(int packageId, int userId)
{
    // 1. Lấy tất cả orders Completed/Paid của user
    var allOrders = await _orderRepository.GetByUserIdAsync(userId);
    var completedOrders = allOrders
        .Where(o => o.Status == "Completed" || o.Status == "Paid")
        .ToList();
    
    // 2. Tìm order có PackageId matching
    var orderWithPackage = completedOrders
        .FirstOrDefault(o => o.PackageId == packageId);
    
    // 3. Nếu không tìm thấy trong PackageId, check trong OrderItems
    if (orderWithPackage == null)
    {
        foreach (var order in completedOrders)
        {
            // Include OrderItems
            var orderWithItems = await _orderRepository.GetByIdWithItemsAsync(order.OrderId);
            if (orderWithItems?.OrderItems != null)
            {
                var hasPackage = orderWithItems.OrderItems
                    .Any(item => item.PackageId == packageId);
                if (hasPackage)
                {
                    orderWithPackage = orderWithItems;
                    break;
                }
            }
        }
    }
    
    // 4. Nếu tìm thấy order, check payment
    if (orderWithPackage != null)
    {
        var payments = await _paymentRepository.GetByOrderIdAsync(orderWithPackage.OrderId);
        var paidPayment = payments
            .FirstOrDefault(p => p.Status == "Paid" || p.Status == "Completed");
        
        if (paidPayment != null || orderWithPackage.Status == "Completed")
        {
            return new PackagePaymentStatusDto
            {
                PackageId = packageId,
                IsPaid = true,
                OrderId = orderWithPackage.OrderId,
                PaymentId = paidPayment?.PaymentId,
                PaidAt = paidPayment?.CreatedAt ?? orderWithPackage.OrderDate,
                Amount = paidPayment?.Amount ?? orderWithPackage.TotalAmount,
                PaymentMethod = paidPayment?.PaymentMethod,
                Status = paidPayment?.Status ?? orderWithPackage.Status
            };
        }
    }
    
    // 5. Nếu không tìm thấy, trả về isPaid: false
    return new PackagePaymentStatusDto
    {
        PackageId = packageId,
        IsPaid = false
    };
}
```

---

### 2. **Fix Order Creation/Update to Save PackageId**

**File:** `Eduprompt.BLL/Services/OrderService.cs`

**Issue:** Khi tạo order từ package, `PackageId` không được lưu vào order

**Required Fix:**
```csharp
// Khi tạo order từ package
public async Task<Order> CreateOrderFromPackageAsync(int userId, int packageId, decimal amount)
{
    var order = new Order
    {
        UserId = userId,
        PackageId = packageId,  // ✅ PHẢI LƯU PACKAGEID
        TotalAmount = amount,
        Status = "Pending",
        OrderDate = DateTime.UtcNow
    };
    
    await _orderRepository.AddAsync(order);
    return order;
}

// Khi update order status thành Completed
public async Task UpdateOrderStatusAsync(int orderId, string status)
{
    var order = await _orderRepository.GetByIdAsync(orderId);
    if (order != null)
    {
        order.Status = status;
        // ✅ Đảm bảo PackageId vẫn được giữ lại
        await _orderRepository.UpdateAsync(order);
    }
}
```

---

### 3. **Fix Order Response to Include PackageId**

**File:** `Eduprompt.BLL/Services/OrderService.cs` - `MapToServiceDto()`

**Current Issue:** Order response không có `packageId` hoặc `packageId: null`

**Required Fix:**
```csharp
private static OrderServiceDto MapToServiceDto(Order order)
{
    return new OrderServiceDto
    {
        OrderId = order.OrderId,
        UserId = order.UserId,
        PackageId = order.PackageId,  // ✅ PHẢI MAP PACKAGEID
        TotalAmount = order.TotalAmount,
        Status = order.Status,
        OrderDate = order.OrderDate,
        // ... other fields
    };
}
```

---

### 4. **Fix OrderItems to Include PackageId (If Using Cart)**

**File:** `Eduprompt.BLL/Services/OrderService.cs`

**If orders can contain multiple packages (from cart):**

```csharp
// Khi tạo order items từ cart
public async Task CreateOrderItemsFromCartAsync(int orderId, List<CartItem> cartItems)
{
    foreach (var cartItem in cartItems)
    {
        var orderItem = new OrderItem
        {
            OrderId = orderId,
            PackageId = cartItem.PackageId,  // ✅ PHẢI LƯU PACKAGEID
            Quantity = cartItem.Quantity,
            Price = cartItem.Price,
            SubTotal = cartItem.Quantity * cartItem.Price
        };
        
        await _orderItemRepository.AddAsync(orderItem);
    }
}
```

---

## 📋 Test Cases

### Test Case 1: Check Package Payment - Order có PackageId
```
GET /api/payments/check-package/4
User: userId = 1

Database:
- Order: OrderId=2, UserId=1, PackageID=4, Status="Completed"
- Payment: PaymentID=1, OrderID=2, Status="Paid"

Expected Response:
{
  "packageId": 4,
  "isPaid": true,
  "orderId": 2,
  "paymentId": 1,
  "paidAt": "2025-11-02T17:45:04Z",
  "amount": 2000,
  "paymentMethod": "VNPay",
  "status": "Paid"
}
```

### Test Case 2: Check Package Payment - Order từ Cart
```
GET /api/payments/check-package/4
User: userId = 1

Database:
- Order: OrderId=3, UserId=1, PackageID=null, Status="Completed"
- OrderItem: OrderDetailId=1, OrderId=3, PackageId=4
- Payment: PaymentID=2, OrderID=3, Status="Paid"

Expected Response:
{
  "packageId": 4,
  "isPaid": true,
  "orderId": 3,
  "paymentId": 2,
  ...
}
```

### Test Case 3: Get Orders - Phải có PackageId
```
GET /api/orders/my
User: userId = 1

Expected Response:
[
  {
    "orderId": 2,
    "packageId": 4,  // ✅ PHẢI CÓ
    "status": "Completed",
    ...
  }
]
```

---

## ⚠️ Current Workaround

Frontend đã implement fallback logic để check orders trực tiếp, nhưng vẫn không tìm thấy `packageId` vì backend chưa lưu.

**Frontend sẽ:**
1. Gọi `/api/payments/check-package/{packageId}` → Trả về `isPaid: false`
2. Fallback: Check orders trực tiếp → Không tìm thấy `packageId` trong orders
3. Kết quả: `isPaid: false` → Nút "Mở Chat" bị disable

**Sau khi backend fix:**
- Endpoint sẽ trả về `isPaid: true` khi user đã mua
- Frontend sẽ enable nút "Mở Chat" tự động

---

## 🎯 Priority

**🔴 CRITICAL** - User không thể sử dụng tính năng "Mở Chat" mặc dù đã mua package.

**Required Actions:**
1. ✅ Fix endpoint `/api/payments/check-package/{packageId}` để tìm order/payment đúng
2. ✅ Fix order creation để lưu `PackageId`
3. ✅ Fix order response để include `PackageId`
4. ✅ Test với orders hiện tại (có thể cần update data migration)

---

## 📝 Notes

- Orders hiện tại có `status: "Completed"` nhưng `packageId: null` → Có thể cần data migration để update `packageId` cho orders cũ
- Nếu orders được tạo từ cart, cần check `OrderItems` table thay vì `Orders.PackageId`
- Đảm bảo khi payment thành công, order status được update thành "Completed" và `PackageId` được giữ lại

