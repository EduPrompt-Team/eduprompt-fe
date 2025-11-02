# Backend Verification Checklist - Storage Templates API

## 🔍 Các điểm cần verify với Backend Team

### 1. **POST /api/storage-templates** - Create Template

#### Request Body Format:
```json
{
  "packageId": 1,
  "templateName": "Gia tốc",
  "templateContent": "{\"grade\":\"10\",\"subject\":\"Vật lý\",\"chapter\":\"Chương 1\",\"content\":\"...\",\"route\":\"...\"}",
  "grade": "10",
  "subject": "Vật lý",
  "chapter": "Chương 1",
  "isPublic": true
}
```

#### ✅ Cần verify:
- [ ] **Validation**: `packageId` phải tồn tại trong database?
- [ ] **Duplicate Check**: Có kiểm tra "1 template per package" không?
- [ ] **Error Response**: Khi template đã tồn tại, trả về error message nào?
  - Expected: `"message": "Template already in storage"` (đã đúng ✅)
- [ ] **Grade Format**: Backend expect `grade` là string `"10"` hay number `10`?
- [ ] **Subject Format**: Backend có case-sensitive không? (ví dụ: "Vật lý" vs "Vật Lý")
- [ ] **isPublic Default**: Nếu không gửi `isPublic`, giá trị mặc định là gì?

---

### 2. **PATCH /api/storage-templates/{id}** - Update Template

#### Request Body Format:
```json
{
  "templateName": "Gia tốc mới",
  "templateContent": "...",
  "grade": "10",
  "subject": "Vật lý",
  "chapter": "Chương 1",
  "isPublic": true
}
```

#### ✅ Cần verify:
- [ ] **Authorization**: Admin có thể update template của user khác không?
- [ ] **Partial Update**: Có cho phép update từng field riêng lẻ không?
- [ ] **Validation**: Có validate các fields khi update không?
- [ ] **Response**: Response có trả về updated template không?

---

### 3. **GET /api/storage-templates/public** - Get Public Templates

#### Query Parameters:
```
?packageId=1&grade=10&subject=Vật lý&chapter=Chương 1
```

#### ✅ Cần verify:
- [ ] **Filter Logic**: 
  - `packageId` có filter chính xác không?
  - `grade` filter có case-sensitive không? (string "10" vs number 10)
  - `subject` filter có exact match hay partial match?
  - `chapter` filter có exact match không?
- [ ] **Empty Result**: Khi không có template, trả về `[]` hay `null`?
- [ ] **Response Format**: Response là array `[{...}]` hay object `{data: [...]}`?

---

### 4. **GET /api/storage-templates/my-storage** - Get User's Templates

#### ✅ Cần verify:
- [ ] **Authorization**: Có lấy đúng templates của user đang login không?
- [ ] **Include Public**: Có include cả public templates của user không?
- [ ] **Empty Result**: User chưa có template, trả về `[]` hay error?

---

### 5. **GET /api/storage-templates/check/{packageId}** - Check Template Exists

#### ✅ Cần verify:
- [ ] **Return Type**: Trả về `boolean` hay object?
- [ ] **Logic**: Check template của current user hay check globally?
- [ ] **Response Format**: 
  - `true/false`?
  - `{exists: true}`?
  - `{data: true}`?

---

### 6. **General Issues to Check**

#### ⚠️ Critical:
1. **404 Errors**:
   - `/api/AIHistory` - Endpoint này có tồn tại không?
   - Có thể do frontend gọi endpoint không đúng?

2. **400 Errors với `/api/storage-templates`**:
   - Validation errors có trả về format đúng không?
   - Error message có rõ ràng không?

3. **CORS**: Có cấu hình CORS cho frontend URL không?

#### 🔧 Recommended:
1. **Error Response Format**: Thống nhất format error response:
   ```json
   {
     "statusCode": 400,
     "message": "Template already in storage",
     "timestamp": "2025-11-02T19:01:59.2932542Z",
     "path": "/api/storage-templates"
   }
   ```
   Hoặc validation errors:
   ```json
   {
     "errors": {
       "packageId": ["PackageId is required"],
       "templateName": ["TemplateName must be at least 3 characters"]
     }
   }
   ```

2. **Swagger/API Documentation**: Có Swagger docs để frontend team verify không?

3. **Test Endpoints**: Backend có test endpoints để verify không?

---

## 🧪 Test Scenarios

### Scenario 1: Create First Template
```
POST /api/storage-templates
Body: {packageId: 1, templateName: "Test 1", ...}
Expected: 201 Created → Template created successfully
```

### Scenario 2: Create Second Template (Same Package)
```
POST /api/storage-templates
Body: {packageId: 1, templateName: "Test 2", ...} // Same packageId
Expected: 400 Bad Request → "Template already in storage"
```

### Scenario 3: Update Existing Template
```
PATCH /api/storage-templates/{storageId}
Body: {templateName: "Test 2 Updated", ...}
Expected: 200 OK → Template updated
```

### Scenario 4: Get Public Templates by Grade/Subject
```
GET /api/storage-templates/public?grade=10&subject=Vật lý&chapter=Chương 1
Expected: 200 OK → Array of matching templates
```

---

## 📝 Notes

- Frontend hiện tại đã handle error "Template already in storage" và tự động suggest update
- Frontend check existing templates trước khi tạo để prevent error
- Nếu backend có thay đổi validation logic, cần notify frontend team

---

## ✅ Status

- [x] Error handling "Template already in storage" - ✅ Implemented
- [x] Auto-suggest update when duplicate - ✅ Implemented  
- [x] Preventive check before creating - ✅ Implemented
- [ ] Backend verification - ⏳ Pending

---

## 🔗 Related Files

- Frontend Service: `src/services/storageTemplateService.ts`
- Admin Component: `src/components/Admin/DashboardAdmin.tsx`
- Error Response Format: `.NET Standard` (statusCode, message, timestamp, path)

