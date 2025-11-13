# Yêu Cầu Fix Wishlist API - Liên Kết Với StorageTemplates

## Vấn Đề Hiện Tại

Hiện tại, bảng `Wishlists` đang liên kết với `PackageID` (bảng `Packages`), nhưng người dùng muốn yêu thích các **prompt templates cụ thể** (bảng `StorageTemplates`) thay vì các gói package.

### Schema Hiện Tại:
```sql
Wishlists:
- WishlistId (PK)
- UserId (FK -> Users)
- PackageID (FK -> Packages)  ❌ Đang liên kết với Packages
- AddedAt
- Notes
```

### Vấn Đề:
- Khi user click "Thêm vào yêu thích" trên một prompt template, frontend cần lưu `StorageID` (từ bảng `StorageTemplates`)
- Nhưng hiện tại chỉ có thể lưu `PackageID`, không phù hợp với use case
- Khi load wishlist, không thể lấy được thông tin template cụ thể mà user đã yêu thích

## Yêu Cầu Thay Đổi

### Option 1: Thêm Field Mới (Khuyến Nghị)
Thêm field `StorageID` vào bảng `Wishlists` để lưu cả hai loại:
- `PackageID`: Cho các gói package (giữ nguyên cho backward compatibility)
- `StorageID`: Cho các prompt templates cụ thể

```sql
ALTER TABLE [dbo].[Wishlists]
ADD [StorageID] [int] NULL;

ALTER TABLE [dbo].[Wishlists]
ADD CONSTRAINT [FK_Wishlists_StorageTemplates] 
FOREIGN KEY([StorageID])
REFERENCES [dbo].[StorageTemplates] ([StorageID])
ON DELETE CASCADE;
```

### Option 2: Thay Đổi Hoàn Toàn
Thay đổi `PackageID` thành `StorageID` và loại bỏ liên kết với Packages (cần migration data nếu có)

## API Endpoints Cần Thay Đổi

### 1. POST /api/Wishlists
**Request Body:**
```json
{
  "packageId": 0,        // Optional - cho backward compatibility
  "storageId": 123       // Required - ID của StorageTemplate
}
```

**Response:**
```json
{
  "wishlistId": 1,
  "userId": 10,
  "packageId": null,
  "storageId": 123,
  "addedAt": "2025-01-15T10:30:00Z",
  "notes": null
}
```

### 2. GET /api/Wishlists/my-wishlist
**Response:** Trả về danh sách wishlist items với thông tin StorageTemplate đầy đủ

```json
[
  {
    "wishlistId": 1,
    "userId": 10,
    "packageId": null,
    "storageId": 123,
    "addedAt": "2025-01-15T10:30:00Z",
    "notes": null,
    "storageTemplate": {
      "storageId": 123,
      "userId": 5,
      "packageId": 10,
      "templateName": "Toán Học Lớp 12 - Chương 1",
      "templateContent": "...",
      "grade": "12",
      "subject": "Toán",
      "chapter": "Chương 1",
      "isPublic": true,
      "createdAt": "2025-01-10T08:00:00Z"
    }
  }
]
```

### 3. GET /api/Wishlists/check/{StorageId}
Kiểm tra xem StorageTemplate đã có trong wishlist chưa

**Response:**
```json
{
  "storageId": 123,
  "isInWishlist": true,
  "wishlistId": 1
}
```

Hoặc đơn giản:
```json
true
```

### 4. DELETE /api/Wishlists/{id}
Giữ nguyên, nhưng có thể thêm endpoint mới:
- DELETE /api/Wishlists/by-storage/{storageId} - Xóa theo StorageID

## Business Logic

1. **Khi thêm vào wishlist:**
   - Nếu có `storageId` → lưu vào `StorageID`
   - Nếu có `packageId` (backward compatibility) → lưu vào `PackageID`
   - Validate: `storageId` phải tồn tại trong bảng `StorageTemplates`

2. **Khi load wishlist:**
   - Join với bảng `StorageTemplates` để lấy thông tin đầy đủ
   - Nếu `StorageID` không null → lấy thông tin từ `StorageTemplates`
   - Nếu `PackageID` không null (legacy data) → có thể lấy thông tin từ `Packages` hoặc bỏ qua

3. **Validation:**
   - Một user không thể thêm cùng một StorageTemplate vào wishlist 2 lần
   - Khi xóa StorageTemplate → tự động xóa khỏi wishlist (CASCADE)

## Migration Script (Nếu Cần)

Nếu có dữ liệu cũ trong wishlist dựa trên PackageID, có thể cần migration:

```sql
-- Tìm các StorageTemplates tương ứng với PackageID trong wishlist
UPDATE w
SET w.StorageID = (
    SELECT TOP 1 st.StorageID 
    FROM StorageTemplates st 
    WHERE st.PackageID = w.PackageID 
    AND st.IsPublic = 1
    ORDER BY st.CreatedAt DESC
)
FROM Wishlists w
WHERE w.StorageID IS NULL 
AND w.PackageID IS NOT NULL
AND EXISTS (
    SELECT 1 
    FROM StorageTemplates st 
    WHERE st.PackageID = w.PackageID
);
```

## Frontend Changes (Đã Sẵn Sàng)

Frontend đã được cập nhật để:
- Gửi `storageId` khi thêm vào wishlist
- Load và hiển thị thông tin từ StorageTemplates
- Xử lý cả hai trường hợp (storageId và packageId) cho backward compatibility

## Test Cases

1. ✅ Thêm StorageTemplate vào wishlist → thành công
2. ✅ Thêm cùng một StorageTemplate 2 lần → trả về lỗi "Đã tồn tại"
3. ✅ Load wishlist → trả về danh sách với thông tin StorageTemplate đầy đủ
4. ✅ Xóa StorageTemplate khỏi wishlist → thành công
5. ✅ Xóa StorageTemplate từ database → tự động xóa khỏi wishlist (CASCADE)
6. ✅ Check wishlist status → trả về đúng trạng thái

## Priority

**HIGH** - Tính năng này cần thiết để user có thể yêu thích các prompt templates cụ thể, không phải chỉ các gói package.

## Notes

- Nếu chọn Option 1 (thêm field mới), cần đảm bảo backward compatibility với dữ liệu cũ
- Có thể giữ cả hai fields (`PackageID` và `StorageID`) để hỗ trợ cả hai use cases
- Frontend sẽ ưu tiên sử dụng `StorageID` nếu có

