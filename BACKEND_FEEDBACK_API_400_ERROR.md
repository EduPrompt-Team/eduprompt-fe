# Backend Fix Required - Feedback API 400 Error

## 🚨 VẤN ĐỀ

Frontend đang gặp lỗi **400 Bad Request** khi gọi `POST /api/feedbacks` để tạo feedback/review cho StorageTemplate.

**Error Details:**
- **Endpoint:** `POST /api/feedbacks`
- **Status:** `400 Bad Request`
- **Context:** User đang cố gắng tạo đánh giá (review) cho một StorageTemplate

---

## 📋 REQUEST BODY ĐƯỢC GỬI TỪ FRONTEND

```json
{
  "postId": 5,        // Là storageId của StorageTemplate (mapped từ storageId)
  "comment": "ádasdasdasd",  // Nội dung đánh giá
  "rating": 4        // Rating từ 1-5
}
```

**Lưu ý:** Frontend đang map `storageId` của StorageTemplate thành `postId` vì Feedback API dùng `postId`.

---

## ❓ CÁC NGUYÊN NHÂN CÓ THỂ GÂY 400 ERROR

### 1. **Validation Errors - Fields Required/Missing**

Backend có thể expect các fields sau mà frontend chưa gửi:
- `userId` - Có thể backend cần userId trong request body (hoặc lấy từ token)
- `packageId` - Có thể cần packageId liên quan đến StorageTemplate

**Fix:** Backend nên:
- ✅ Lấy `userId` từ JWT token/claims (không cần trong request body)
- ✅ Validate `postId`, `comment`, `rating` có đầy đủ không
- ✅ Validate `rating` từ 1-5

---

### 2. **Foreign Key Constraint - postId không tồn tại trong Posts**

**Vấn đề:** Frontend đang gửi `postId = storageId` (ví dụ: `postId: 5` là storageId của StorageTemplate). Backend có thể đang kiểm tra `postId` phải tồn tại trong `Posts` table, nhưng StorageTemplate không phải là Post.

**Giải pháp có 2 hướng:**

#### Option A: Backend hỗ trợ storageId làm postId (RECOMMENDED)
Backend nên:
- ✅ Cho phép `postId` có thể là `storageId` (nếu không tìm thấy trong Posts, tìm trong StorageTemplates)
- ✅ Hoặc validate `postId` có thể là Post hoặc StorageTemplate

**Code suggestion (C#):**
```csharp
// Trong FeedbackService hoặc Controller
var postExists = await _postRepository.ExistsAsync(request.PostId);
var storageExists = await _storageTemplateRepository.ExistsAsync(request.PostId);

if (!postExists && !storageExists)
{
    throw new BadRequestException($"Post or StorageTemplate with ID {request.PostId} not found");
}
```

#### Option B: Frontend tạo Post trước khi tạo Feedback
Frontend cần:
- Tạo một Post entity cho mỗi StorageTemplate
- Sử dụng `postId` thực sự thay vì `storageId`

**⚠️ Không recommend vì phức tạp và không cần thiết**

---

### 3. **Duplicate Check - User đã review rồi**

Backend có thể đang kiểm tra duplicate (1 user chỉ được review 1 lần cho 1 post).

**Fix:** Backend nên:
- ✅ Nếu user đã review, trả về feedback hiện tại hoặc cho phép update
- ✅ Hoặc trả về error message rõ ràng: "User đã đánh giá cho post này rồi"

---

### 4. **Field Name Mismatch - comment vs content**

Backend có thể expect `content` thay vì `comment`.

**Fix:** Backend nên:
- ✅ Accept cả `comment` và `content` (mapping trong DTO)
- ✅ Hoặc document rõ ràng field name nào backend expect

**DTO Suggestion:**
```csharp
public class CreateFeedbackDto
{
    public int PostId { get; set; }
    public string? Comment { get; set; }  // hoặc Content
    public int Rating { get; set; }
}
```

---

## ✅ CHECKLIST CHO BACKEND TEAM

### 1. **Kiểm tra Validation Rules**
- [ ] `postId` có required không? Có validate tồn tại không?
- [ ] `comment` có required không? Có min/max length không?
- [ ] `rating` có validate từ 1-5 không?
- [ ] `userId` có được lấy từ token không? (không cần trong request body)

### 2. **Kiểm tra Foreign Key Constraints**
- [ ] `postId` có phải tồn tại trong Posts table không?
- [ ] Có cho phép `postId` là `storageId` (từ StorageTemplates) không?
- [ ] Database có foreign key constraint gây vấn đề không?

### 3. **Kiểm tra Business Logic**
- [ ] Có duplicate check không? (1 user chỉ được review 1 lần)
- [ ] Nếu duplicate, có cho phép update không?
- [ ] Error message có rõ ràng không? (400 với message chi tiết)

### 4. **Kiểm tra DTO Mapping**
- [ ] DTO có nhận `comment` hay `content`?
- [ ] Có mapping đúng từ request body vào entity không?

---

## 🧪 TEST CASE CHO BACKEND

### Test 1: Tạo Feedback với storageId làm postId
```http
POST /api/feedbacks
Content-Type: application/json
Authorization: Bearer {token}

{
  "postId": 5,  // Là storageId, không phải postId thực sự
  "comment": "Test review",
  "rating": 4
}
```

**Expected:** ✅ 201 Created hoặc ✅ 200 OK

**If 400:** Kiểm tra error message để biết lý do cụ thể

---

### Test 2: Validate required fields
```http
POST /api/feedbacks
{
  "postId": 5,
  "rating": 4
  // Thiếu comment
}
```

**Expected:** ✅ 400 với message "Comment is required"

---

### Test 3: Validate rating range
```http
POST /api/feedbacks
{
  "postId": 5,
  "comment": "Test",
  "rating": 6  // > 5
}
```

**Expected:** ✅ 400 với message "Rating must be between 1 and 5"

---

## 📝 ERROR RESPONSE FORMAT MONG ĐỢI

Backend nên trả về error message chi tiết để frontend hiển thị cho user:

```json
{
  "statusCode": 400,
  "message": "PostId không tồn tại" hoặc "User đã đánh giá cho post này rồi" hoặc "Comment is required",
  "timestamp": "2025-11-02T14:59:42.538Z",
  "path": "/api/feedbacks"
}
```

---

## 🎯 RECOMMENDED FIX

**Tốt nhất là Option A:** Backend hỗ trợ cả Post và StorageTemplate cho `postId`:

```csharp
// Trong CreateFeedbackAsync
var userId = GetUserIdFromToken(); // Lấy từ JWT

// Validate postId có thể là Post hoặc StorageTemplate
var post = await _postRepository.GetByIdAsync(request.PostId);
var storageTemplate = await _storageTemplateRepository.GetByIdAsync(request.PostId);

if (post == null && storageTemplate == null)
{
    throw new BadRequestException($"Không tìm thấy Post hoặc StorageTemplate với ID {request.PostId}");
}

// Tạo feedback
var feedback = new Feedback
{
    PostId = request.PostId,
    UserId = userId,
    Comment = request.Comment,
    Rating = request.Rating,
    CreatedDate = DateTime.UtcNow
};

// Check duplicate (optional - có thể cho phép multiple reviews)
var existing = await _feedbackRepository.GetByPostIdAndUserIdAsync(request.PostId, userId);
if (existing != null)
{
    // Option: Update existing
    existing.Comment = request.Comment;
    existing.Rating = request.Rating;
    return await _feedbackRepository.UpdateAsync(existing);
    
    // Hoặc: Throw error
    // throw new BadRequestException("Bạn đã đánh giá cho item này rồi");
}

return await _feedbackRepository.CreateAsync(feedback);
```

---

## ⚠️ LƯU Ý

- Frontend đang map `storageId` → `postId` vì Feedback API dùng `postId`
- Backend cần quyết định: cho phép `storageId` làm `postId` hay yêu cầu frontend tạo Post trước
- Error message phải rõ ràng để frontend hiển thị cho user

---

## 🔍 DEBUGGING

Backend team nên:
1. Check console log của frontend để xem request body chính xác
2. Check backend logs để xem validation nào fail
3. Test trực tiếp với Postman với exact same request body
4. Kiểm tra database constraints và foreign keys

