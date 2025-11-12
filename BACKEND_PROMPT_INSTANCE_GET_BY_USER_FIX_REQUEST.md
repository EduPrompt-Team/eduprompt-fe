# Backend Fix Request: Prompt Instance Get By User - Missing Instances

## Vấn Đề Hiện Tại

Frontend gọi `GET /api/prompt-instances/user/{userId}` nhưng nhận được **0 instances**, mặc dù:
- Chat đã được lưu thành công vào Prompt Instance (có log: "Đã lưu lịch sử chat vào Prompt Instance: 7")
- Instance đã được tạo với `status: "Completed"` và có `outputJson`

## Nguyên Nhân Có Thể

1. **Endpoint không trả về instances đã completed**: Có thể endpoint chỉ trả về instances với status cụ thể
2. **Filter logic không đúng**: Có thể có filter nào đó loại bỏ instances đã completed
3. **PackageId matching issue**: Có thể instances được tạo với `packageId = null` và không match với template
4. **StorageId không được lưu**: Instances có thể không có `storageId` trong response

## Yêu Cầu Backend

### 1. Kiểm Tra Endpoint GET /api/prompt-instances/user/{UserId}

**Expected Behavior:**
- Trả về **TẤT CẢ** instances của user, bao gồm cả:
  - Instances với `status = "Completed"` và có `outputJson`
  - Instances với `status = "Queued"`, "Running", etc.
  - Instances với `packageId = null` (nếu được tạo từ StorageTemplate)

**Current Issue:**
- Frontend nhận được `[]` (empty array) mặc dù instances đã được tạo

**Test Case:**
```
GET /api/prompt-instances/user/1

Expected Response:
[
  {
    "instanceId": 7,
    "userId": 1,
    "packageId": 4,  // hoặc null
    "storageId": null,  // hoặc có giá trị nếu được tạo từ StorageTemplate
    "promptName": "Chat Vật lý lớp 10 - Chương 2 - ...",
    "inputJson": "...",
    "outputJson": "...",  // Có giá trị
    "status": "Completed",
    "executedAt": "2025-11-02T...",
    "processingTimeMs": 1234
  },
  // ... other instances
]
```

### 2. Kiểm Tra Endpoint GET /api/prompt-instances/storage/{storageId}

**Current Issue:**
- Endpoint trả về **404 Not Found**
- Frontend đã handle 404 gracefully nhưng cần endpoint này để load instances theo StorageTemplate

**Expected Behavior:**
- Trả về tất cả instances có `PackageId` matching với `StorageTemplate.PackageId` của `storageId` đó
- Hoặc trả về instances có `StorageId` matching (nếu backend lưu `StorageId` trong PromptInstance)

**Test Case:**
```
GET /api/prompt-instances/storage/11

Expected Response:
[
  {
    "instanceId": 7,
    "userId": 1,
    "packageId": 4,  // Matching với StorageTemplate.PackageId của storageId=11
    "promptName": "...",
    "outputJson": "...",
    "status": "Completed",
    ...
  }
]
```

### 3. Đảm Bảo StorageId được lưu trong PromptInstance (Nếu Cần)

**Option A: Lưu StorageId trong PromptInstance**
- Thêm field `StorageId` vào PromptInstance entity
- Khi tạo instance với `storageId` trong request, lưu vào database
- Response trả về `storageId` trong PromptInstanceDto

**Option B: Query theo PackageId từ StorageTemplate**
- Endpoint `/storage/{storageId}` query StorageTemplate để lấy `PackageId`
- Sau đó query PromptInstances có `PackageId` matching

## Test Cases

### Test Case 1: Get User Instances - Should Return All
```
GET /api/prompt-instances/user/1

Database:
- PromptInstance: InstanceId=7, UserId=1, PackageId=4, Status="Completed", OutputJson != null

Expected: 
- Response contains instance with InstanceId=7
- Status = "Completed"
- OutputJson có giá trị
```

### Test Case 2: Get Instances by StorageId
```
GET /api/prompt-instances/storage/11

Database:
- StorageTemplate: StorageId=11, PackageId=4
- PromptInstance: InstanceId=7, UserId=1, PackageId=4, Status="Completed"

Expected:
- Response contains instance with InstanceId=7 (vì PackageId matching)
```

### Test Case 3: Get Instances with Null PackageId
```
GET /api/prompt-instances/user/1

Database:
- PromptInstance: InstanceId=8, UserId=1, PackageId=null, Status="Completed"

Expected:
- Response contains instance with InstanceId=8
- PackageId = null (allowed)
```

## Frontend Code Reference

**File:** `src/components/ProfileUser/PromptStorage.tsx`
**Line:** 40-68

```typescript
async function loadInstances() {
  const userInstances = await promptInstanceService.getByUser(Number(currentUser.userId))
  // Filter chỉ lấy instances đã hoàn thành (có outputJson)
  const completedInstances = Array.isArray(userInstances) 
    ? userInstances.filter(inst => inst.outputJson != null)
    : []
  // Result: completedInstances.length = 0 (KHÔNG ĐÚNG - nên có ít nhất 1 instance)
}
```

**File:** `src/components/Page/DynamicChatPage.tsx`
**Line:** 438

```typescript
console.log('[DynamicChatPage] ✅ Đã lưu lịch sử chat vào Prompt Instance:', instanceId)
// Instance đã được tạo thành công với instanceId = 7
```

## Database Schema Reference

**PromptInstances Table:**
```sql
CREATE TABLE [dbo].[PromptInstances] (
  [InstanceId] INT IDENTITY(1,1) PRIMARY KEY,
  [UserId] INT NOT NULL,
  [PackageID] INT NULL,  -- Can be null
  [PromptName] NVARCHAR(MAX) NOT NULL,
  [InputJson] NVARCHAR(MAX) NULL,
  [OutputJson] NVARCHAR(MAX) NULL,  -- Should have value when completed
  [ExecutedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  [ProcessingTimeMs] INT NULL,
  [Status] NVARCHAR(50) NULL,  -- "Completed", "Queued", etc.
  ...
);
```

## Ưu Tiên

1. **Cao**: Fix endpoint `/api/prompt-instances/user/{userId}` để trả về tất cả instances (bao gồm completed)
2. **Cao**: Implement endpoint `/api/prompt-instances/storage/{storageId}` (hiện tại 404)
3. **Trung bình**: Đảm bảo `storageId` được lưu trong PromptInstance (nếu cần)
4. **Thấp**: Cải thiện documentation

## Verification Steps

1. Tạo một Prompt Instance từ chat page
2. Gọi `GET /api/prompt-instances/user/{userId}`
3. Verify response chứa instance vừa tạo
4. Verify instance có `outputJson != null` và `status = "Completed"`
5. Gọi `GET /api/prompt-instances/storage/{storageId}` với storageId của template
6. Verify response chứa instances matching với template

## Liên Hệ

Nếu có câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ frontend team.

