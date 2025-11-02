# Backend Requirements - Reviews API

## 🚨 VẤN ĐỀ

Frontend đang gặp **404 errors** khi gọi các Reviews API endpoints. Backend cần implement các endpoints sau:

---

## ✅ REQUIRED ENDPOINTS

### 1. **POST /api/reviews** - Create Review
**Request Body:**
```json
{
  "storageId": 5,
  "rating": 5,
  "comment": "Template này rất hay!"
}
```

**Response:**
```json
{
  "reviewId": 1,
  "storageId": 5,
  "userId": 1,
  "rating": 5,
  "comment": "Template này rất hay!",
  "createdAt": "2025-11-02T14:59:42.538Z",
  "updatedAt": null,
  "user": {
    "userId": 1,
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com"
  }
}
```

---

### 2. **GET /api/reviews/storage/{storageId}** - Get Reviews by Storage Template ID
**Response:**
```json
[
  {
    "reviewId": 1,
    "storageId": 5,
    "userId": 1,
    "rating": 5,
    "comment": "Template này rất hay!",
    "createdAt": "2025-11-02T14:59:42.538Z",
    "updatedAt": null,
    "user": {
      "userId": 1,
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com"
    }
  }
]
```

**Note:** Nếu chưa có reviews, trả về `[]` (empty array) thay vì 404.

---

### 3. **GET /api/reviews/storage/{storageId}/rating** - Get Average Rating
**Response:**
```json
4.5
```

**Note:** Nếu chưa có reviews, trả về `0` thay vì 404.

---

### 4. **GET /api/reviews/storage/{storageId}/count** - Get Review Count
**Response:**
```json
10
```

**Note:** Nếu chưa có reviews, trả về `0` thay vì 404.

---

### 5. **GET /api/reviews/user/{userId}/storage/{storageId}** - Get User's Review for Storage
**Response:**
```json
{
  "reviewId": 1,
  "storageId": 5,
  "userId": 1,
  "rating": 5,
  "comment": "Template này rất hay!",
  "createdAt": "2025-11-02T14:59:42.538Z",
  "updatedAt": null
}
```

**Note:** Nếu user chưa review, trả về `404` (frontend sẽ handle).

---

### 6. **PUT /api/reviews/{id}** - Update Review
**Request Body:**
```json
{
  "rating": 4,
  "comment": "Đã sửa lại đánh giá"
}
```

**Response:** Updated Review object

---

### 7. **DELETE /api/reviews/{id}** - Delete Review
**Response:** `204 No Content` hoặc `200 OK`

---

### 8. **GET /api/reviews** - Get All Reviews (Admin Only)
**Response:** Array of all reviews

---

## 📋 DATABASE SCHEMA (Suggestion)

```sql
CREATE TABLE Reviews (
    reviewId INT PRIMARY KEY IDENTITY(1,1),
    storageId INT NOT NULL,
    userId INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    createdAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updatedAt DATETIME2 NULL,
    FOREIGN KEY (storageId) REFERENCES StorageTemplates(storageId),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    UNIQUE (userId, storageId) -- One review per user per template
);
```

---

## ✅ VALIDATION RULES

1. **rating**: Phải từ 1-5
2. **comment**: Optional, nhưng nếu có thì không được rỗng
3. **storageId**: Phải tồn tại trong StorageTemplates
4. **userId**: Phải tồn tại trong Users
5. **One review per user per template**: Mỗi user chỉ được review 1 lần cho 1 template (hoặc cho phép update)

---

## 🔍 ERROR HANDLING

- **400 Bad Request**: Validation errors
- **401 Unauthorized**: User chưa đăng nhập
- **403 Forbidden**: User không có quyền (ví dụ: sửa/xóa review của user khác)
- **404 Not Found**: 
  - Review không tồn tại (cho GET/PUT/DELETE specific review)
  - User chưa review (cho GET user's review)
  - **NHƯNG KHÔNG nên 404 cho:**
    - GET `/api/reviews/storage/{storageId}` → trả về `[]`
    - GET `/api/reviews/storage/{storageId}/rating` → trả về `0`
    - GET `/api/reviews/storage/{storageId}/count` → trả về `0`

---

## 🧪 TEST CASES

1. **Tạo review mới:**
   ```bash
   POST /api/reviews
   {
     "storageId": 5,
     "rating": 5,
     "comment": "Test review"
   }
   ```

2. **Lấy reviews của storage template:**
   ```bash
   GET /api/reviews/storage/5
   ```

3. **Lấy average rating:**
   ```bash
   GET /api/reviews/storage/5/rating
   ```

4. **Lấy review count:**
   ```bash
   GET /api/reviews/storage/5/count
   ```

5. **Lấy user's review:**
   ```bash
   GET /api/reviews/user/1/storage/5
   ```

6. **Update review:**
   ```bash
   PUT /api/reviews/1
   {
     "rating": 4,
     "comment": "Updated comment"
   }
   ```

7. **Delete review:**
   ```bash
   DELETE /api/reviews/1
   ```

---

## ⚠️ CURRENT ERRORS

Frontend đang gặp các lỗi sau:
- `404` cho `/api/reviews/storage/5`
- `404` cho `/api/reviews/storage/5/rating`
- `404` cho `/api/reviews/storage/5/count`
- `404` cho `/api/reviews/user/1/storage/5`
- `404` cho `/api/reviews` (admin)

---

## 📝 NOTES

- Frontend đã handle 404 gracefully cho các endpoint `rating`, `count`, và `getUserReviewForStorage`
- Frontend cần backend trả về `[]` hoặc `0` thay vì `404` cho các trường hợp "chưa có data"
- Reviews phải có quan hệ với StorageTemplate (thông qua `storageId`)
- Reviews phải có quan hệ với User (thông qua `userId`)
- Response cần include thông tin `user` (fullName, email) để hiển thị trong UI

---

## 🎯 PRIORITY

**HIGH** - Users không thể tạo reviews hiện tại do tất cả API endpoints đều trả về 404.

