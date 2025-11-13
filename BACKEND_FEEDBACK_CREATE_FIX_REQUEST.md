# Yêu Cầu Backend: Sửa Lỗi Tạo Feedback

## Vấn Đề Hiện Tại

Khi tạo feedback mới qua `POST /api/feedbacks`, backend trả về lỗi:
```
{
  "message": "Feedback with ID 61 could not be loaded.",
  "statusCode": 400
}
```

**Nguyên nhân:** Backend đang cố load một Feedback record cũ (ID 61) không tồn tại trong quá trình tạo feedback mới.

## Yêu Cầu Sửa

### 1. Sửa Logic Tạo Feedback (`POST /api/feedbacks`)

**File cần sửa:** `FeedbackController.cs` và `FeedbackService.cs`

**Vấn đề:**
- Backend đang cố load Feedback cũ (có thể do migration logic hoặc validation logic)
- Sử dụng `.First()` thay vì `.FirstOrDefault()` → throw exception khi không tìm thấy
- Logic validation đang kiểm tra Feedback cũ không tồn tại

**Yêu cầu:**
1. **Không load Feedback cũ khi tạo mới:**
   - Khi tạo feedback mới, chỉ cần validate:
     - `StorageId` hoặc `PostId` có tồn tại không
     - `UserId` có hợp lệ không
     - `Rating` trong khoảng 1-5
     - `Comment` không quá 5000 ký tự (nếu có)
   - **KHÔNG** cố load Feedback cũ để kiểm tra

2. **Sử dụng `.FirstOrDefault()` thay vì `.First()`:**
   ```csharp
   // ❌ SAI - throw exception nếu không tìm thấy
   var storage = _context.StorageTemplates.First(s => s.StorageID == request.StorageId);
   
   // ✅ ĐÚNG - return null nếu không tìm thấy
   var storage = _context.StorageTemplates.FirstOrDefault(s => s.StorageID == request.StorageId);
   if (storage == null)
   {
       return NotFound($"StorageTemplate with ID {request.StorageId} not found");
   }
   ```

3. **Validate đầy đủ trước khi tạo:**
   ```csharp
   // Validate StorageTemplate
   if (request.StorageId.HasValue)
   {
       var storage = await _context.StorageTemplates
           .FirstOrDefaultAsync(s => s.StorageID == request.StorageId.Value);
       if (storage == null)
       {
           return BadRequest($"StorageTemplate with ID {request.StorageId.Value} not found");
       }
   }
   
   // Validate Post (nếu có)
   if (request.PostId.HasValue)
   {
       var post = await _context.Posts
           .FirstOrDefaultAsync(p => p.PostID == request.PostId.Value);
       if (post == null)
       {
           return BadRequest($"Post with ID {request.PostId.Value} not found");
       }
   }
   
   // Validate Package (nếu có)
   if (request.PackageId.HasValue)
   {
       var package = await _context.Packages
           .FirstOrDefaultAsync(p => p.PackageID == request.PackageId.Value);
       if (package == null)
       {
           return BadRequest($"Package with ID {request.PackageId.Value} not found");
       }
   }
   
   // Validate User
   var user = await _context.Users
       .FirstOrDefaultAsync(u => u.UserId == userId);
   if (user == null)
   {
       return Unauthorized("User not found");
   }
   
   // Validate Rating
   if (request.Rating < 1 || request.Rating > 5)
   {
       return BadRequest("Rating must be between 1 and 5");
   }
   
   // Validate Comment length
   if (!string.IsNullOrEmpty(request.Comment) && request.Comment.Length > 5000)
   {
       return BadRequest("Comment cannot exceed 5000 characters");
   }
   ```

4. **Tạo Feedback mới:**
   ```csharp
   var feedback = new Feedback
   {
       StorageId = request.StorageId,
       PostId = request.PostId,
       PackageId = request.PackageId,
       UserID = userId,
       Rating = request.Rating,
       Comment = request.Comment,
       CreatedDate = DateTime.UtcNow,
       IsVerified = false,
       Status = "Active"
   };
   
   _context.Feedbacks.Add(feedback);
   await _context.SaveChangesAsync();
   
   return Ok(feedback);
   ```

### 2. Kiểm Tra Duplicate Feedback (Optional)

**Nếu muốn tránh user tạo nhiều feedback cho cùng một StorageId:**

```csharp
// Kiểm tra xem user đã có feedback cho StorageId này chưa
if (request.StorageId.HasValue)
{
    var existingFeedback = await _context.Feedbacks
        .FirstOrDefaultAsync(f => 
            f.StorageId == request.StorageId.Value && 
            f.UserID == userId);
    
    if (existingFeedback != null)
    {
        // Option 1: Update feedback cũ
        existingFeedback.Rating = request.Rating;
        existingFeedback.Comment = request.Comment;
        existingFeedback.CreatedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(existingFeedback);
        
        // Option 2: Trả về lỗi
        // return BadRequest("You have already submitted feedback for this template");
    }
}
```

**Lưu ý:** Nếu chọn Option 1 (update), cần đảm bảo logic này không cố load Feedback cũ bằng ID không tồn tại.

### 3. Error Messages Rõ Ràng

**Yêu cầu:**
- Trả về error message cụ thể:
  - `"StorageTemplate with ID {id} not found"` (404 hoặc 400)
  - `"Post with ID {id} not found"` (404 hoặc 400)
  - `"Package with ID {id} not found"` (404 hoặc 400)
  - `"User not found"` (401)
  - `"Rating must be between 1 and 5"` (400)
  - `"Comment cannot exceed 5000 characters"` (400)

- **KHÔNG** trả về:
  - `"Feedback with ID {id} could not be loaded"` khi tạo feedback mới
  - `"Sequence contains no elements"`

## Test Cases

1. **Tạo feedback với StorageId hợp lệ:**
   - Request: `{ storageId: 6, rating: 5, comment: "Tốt" }`
   - Expected: `200 OK` với feedback mới

2. **Tạo feedback với StorageId không tồn tại:**
   - Request: `{ storageId: 999, rating: 5, comment: "Test" }`
   - Expected: `400 Bad Request` với message `"StorageTemplate with ID 999 not found"`

3. **Tạo feedback với PackageId không tồn tại:**
   - Request: `{ storageId: 6, packageId: 999, rating: 5, comment: "Test" }`
   - Expected: `400 Bad Request` với message `"Package with ID 999 not found"`

4. **Tạo feedback với Rating không hợp lệ:**
   - Request: `{ storageId: 6, rating: 6, comment: "Test" }`
   - Expected: `400 Bad Request` với message `"Rating must be between 1 and 5"`

5. **Tạo feedback với Comment quá dài:**
   - Request: `{ storageId: 6, rating: 5, comment: "A".repeat(5001) }`
   - Expected: `400 Bad Request` với message `"Comment cannot exceed 5000 characters"`

## Ưu Tiên

**Cao:** Sửa logic tạo feedback để không cố load Feedback cũ không tồn tại

## Lý Do

Frontend đang gặp lỗi khi user cố tạo feedback mới. Lỗi "Feedback with ID 61 could not be loaded" cho thấy backend đang có logic sai khi tạo feedback mới, có thể do:
- Migration logic cố load Feedback cũ
- Validation logic kiểm tra Feedback cũ
- Sử dụng `.First()` thay vì `.FirstOrDefault()`

