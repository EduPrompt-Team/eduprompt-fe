# Backend Fix Request: Prompt Instance PackageId Issue

## Vấn Đề Hiện Tại

Khi tạo Prompt Instance từ chat page, frontend gặp lỗi vì `packageId = 0` hoặc `null`, dẫn đến:
- **Error 400**: "An error occurred while saving the entity changes"
- Không thể lưu lịch sử chat vào Prompt Instance

## Nguyên Nhân

1. **Template không có packageId**: Một số StorageTemplate trong database có thể không có `packageId` hoặc `packageId = 0`
2. **Validation quá strict**: Backend có thể yêu cầu `packageId > 0` và không cho phép nullable
3. **Mismatch giữa StorageTemplate và Package**: Template có thể không liên kết với Package

## Yêu Cầu Backend

### 1. Cho phép packageId nullable hoặc có giá trị mặc định

**Option A: Cho phép nullable**
- Cho phép `packageId` là `null` trong PromptInstance entity
- Nếu `packageId = null`, có thể liên kết với `storageId` hoặc `templateId` thay thế

**Option B: Sử dụng storageId/templateId thay vì packageId**
- Thêm field `storageId` hoặc `templateId` vào PromptInstance
- Cho phép tạo instance với `storageId` thay vì `packageId`

**Option C: Tự động map packageId từ StorageTemplate**
- Khi tạo PromptInstance, nếu `packageId = 0`, tự động lấy `packageId` từ StorageTemplate tương ứng

### 2. Cải thiện error messages

**Hiện tại:**
```json
{
  "message": "An error occurred while saving the entity changes. See the inner exception for details."
}
```

**Yêu cầu:**
```json
{
  "message": "PackageId is required and must be greater than 0",
  "errors": {
    "packageId": ["PackageId cannot be null or zero"]
  }
}
```

### 3. Endpoint GET /api/prompt-instances/template/{templateId}

**Cần làm rõ:**
- `templateId` trong endpoint này có phải là `storageId` không?
- Nếu không, cần endpoint mới: `GET /api/prompt-instances/storage/{storageId}`

**Ví dụ:**
```
GET /api/prompt-instances/template/123
→ Trả về tất cả instances có templateId = 123 (hoặc storageId = 123?)
```

### 4. Validation Rules

**Yêu cầu:**
- Nếu `packageId` là required, cần validate rõ ràng
- Nếu `packageId` có thể nullable, cần document rõ khi nào có thể null
- Nếu có alternative (storageId/templateId), cần validate ít nhất một trong các field này

## Test Cases

### Test Case 1: Tạo instance với packageId hợp lệ
```json
POST /api/prompt-instances
{
  "userId": 1,
  "packageId": 123,
  "promptName": "Test Prompt",
  "inputJson": "...",
  "outputJson": null
}
```
**Expected:** 200 OK với instance mới

### Test Case 2: Tạo instance với packageId = 0
```json
POST /api/prompt-instances
{
  "userId": 1,
  "packageId": 0,
  "promptName": "Test Prompt",
  "inputJson": "...",
  "outputJson": null
}
```
**Expected:** 
- Option A: 200 OK (nếu cho phép nullable)
- Option B: 400 Bad Request với message rõ ràng

### Test Case 3: Tạo instance với packageId = null
```json
POST /api/prompt-instances
{
  "userId": 1,
  "packageId": null,
  "promptName": "Test Prompt",
  "inputJson": "...",
  "outputJson": null
}
```
**Expected:** Tương tự Test Case 2

### Test Case 4: Tạo instance với storageId thay vì packageId
```json
POST /api/prompt-instances
{
  "userId": 1,
  "storageId": 456,
  "promptName": "Test Prompt",
  "inputJson": "...",
  "outputJson": null
}
```
**Expected:** 200 OK (nếu hỗ trợ storageId)

## Frontend Code Reference

**File:** `src/components/Page/DynamicChatPage.tsx`
**Line:** 374-391

```typescript
const promptInstance = await promptInstanceService.create({
  userId: Number(currentUser.userId),
  packageId: packageId, // Có thể = 0 hoặc null
  promptName: `Chat ${formData.monHoc} lớp ${formData.lop} - ${formData.chuDe}`,
  inputJson: JSON.stringify({...}),
  outputJson: null
})
```

## Database Schema Reference

**PromptInstances Table:**
```sql
CREATE TABLE [dbo].[PromptInstances] (
  [InstanceId] INT IDENTITY(1,1) PRIMARY KEY,
  [UserId] INT NOT NULL,
  [PackageId] INT NULL, -- Có thể nullable?
  [PromptName] NVARCHAR(MAX) NOT NULL,
  [InputJson] NVARCHAR(MAX) NULL,
  [OutputJson] NVARCHAR(MAX) NULL,
  [ExecutedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  [ProcessingTimeMs] INT NULL,
  [Status] NVARCHAR(50) NULL,
  ...
);
```

## Ưu Tiên

1. **Cao**: Fix validation và error messages cho `packageId`
2. **Cao**: Cho phép nullable hoặc alternative field (storageId)
3. **Trung bình**: Làm rõ endpoint `/template/{templateId}` có phải là storageId không
4. **Thấp**: Cải thiện documentation

## Liên Hệ

Nếu có câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ frontend team.

