# Backend Verification: Prompt Instance Get By User - Still Returning Empty

## Vấn Đề

Frontend đã lưu instance thành công (instanceId = 8) nhưng `GET /api/prompt-instances/user/{userId}` vẫn trả về **empty array `[]`**.

## Logs Từ Frontend

```
[DynamicChatPage] ✅ Đã lưu lịch sử chat vào Prompt Instance: 8
[DynamicChatPage] Instance details: {
  instanceId: 8,
  userId: 1,
  packageId: 4,
  storageId: 11,
  hasOutputJson: true,
  status: "Completed"
}

[PromptStorage] Loading instances for userId: 1
[PromptStorage] Raw API response: {
  isArray: true,
  length: 0,
  rawData: []
}
[PromptStorage] Loaded instances: 0 completed out of 0 total
```

## Yêu Cầu Kiểm Tra

### 1. **Verify Endpoint Implementation**

**File:** `Eduprompt.BLL/Services/PromptInstanceService.cs`

**Kiểm tra method `GetByUserIdAsync`:**

```csharp
public async Task<IEnumerable<PromptInstanceDto>> GetByUserIdAsync(int UserId)
{
    // ✅ PHẢI gọi repository, KHÔNG được return empty
    var instances = await _promptInstanceRepository.GetByUserIdAsync(UserId);
    return instances.Select(MapToDto);
}
```

**❌ KHÔNG ĐƯỢC:**
```csharp
return Task.FromResult(Enumerable.Empty<PromptInstanceDto>()); // ❌ SAI!
```

### 2. **Verify Repository Implementation**

**File:** `Eduprompt.DAL/Repositories/PromptInstanceRepository.cs`

**Kiểm tra method `GetByUserIdAsync`:**

```csharp
public async Task<IEnumerable<PromptInstance>> GetByUserIdAsync(int UserId)
{
    return await _context.PromptInstances
        .Include(p => p.PromptInstanceDetails)
        .Include(p => p.Package)
        .Where(p => p.UserId == UserId)  // ✅ Filter theo UserId
        .OrderByDescending(p => p.ExecutedAt)
        .ToListAsync();
}
```

**Kiểm tra:**
- ✅ Query có filter `UserId` đúng không?
- ✅ Có include các navigation properties không?
- ✅ Có order by `ExecutedAt` descending không?

### 3. **Verify Database Data**

**Kiểm tra trong database:**

```sql
-- Kiểm tra instance có tồn tại không
SELECT * FROM PromptInstances WHERE InstanceId = 8;

-- Kiểm tra instances của user
SELECT * FROM PromptInstances WHERE UserId = 1;

-- Kiểm tra outputJson có giá trị không
SELECT 
    InstanceId,
    UserId,
    PackageID,
    PromptName,
    LEN(OutputJson) as OutputJsonLength,
    Status,
    ExecutedAt
FROM PromptInstances 
WHERE UserId = 1
ORDER BY ExecutedAt DESC;
```

**Expected:**
- InstanceId = 8 phải có trong database
- UserId = 1 phải match
- OutputJson phải có giá trị (không null)
- Status = "Completed"

### 4. **Verify Controller Endpoint**

**File:** `Eduprompt.API/Controllers/PromptInstanceController.cs`

**Kiểm tra endpoint:**

```csharp
[HttpGet("user/{userId}")]
public async Task<IActionResult> GetByUserId(int userId)
{
    try
    {
        var instances = await _promptInstanceService.GetByUserIdAsync(userId);
        return Ok(instances);  // ✅ Phải return instances
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
```

**Kiểm tra:**
- ✅ Route có đúng không? `/api/prompt-instances/user/{userId}`
- ✅ Parameter name có đúng không? `userId` (không phải `UserId`)
- ✅ Có gọi service method đúng không?

### 5. **Verify MapToDto Method**

**File:** `Eduprompt.BLL/Services/PromptInstanceService.cs`

**Kiểm tra method `MapToDto`:**

```csharp
private static PromptInstanceDto MapToDto(PromptInstance instance)
{
    return new PromptInstanceDto
    {
        InstanceId = instance.InstanceId,
        UserId = instance.UserId,
        PackageId = instance.PackageId,  // ✅ Map PackageId
        StorageId = instance.StorageId,    // ✅ Map StorageId (nếu có)
        PromptName = instance.PromptName,
        InputJson = instance.InputJson,
        OutputJson = instance.OutputJson,  // ✅ Map OutputJson
        Status = instance.Status,
        ExecutedAt = instance.ExecutedAt,
        ProcessingTimeMs = instance.ProcessingTimeMs
    };
}
```

**Kiểm tra:**
- ✅ `OutputJson` có được map đúng không?
- ✅ `PackageId` có được map đúng không?
- ✅ `Status` có được map đúng không?

## Test Cases

### Test Case 1: Direct API Call

```bash
GET https://localhost:7199/api/prompt-instances/user/1
```

**Expected Response:**
```json
[
  {
    "instanceId": 8,
    "userId": 1,
    "packageId": 4,
    "storageId": null,
    "promptName": "Chat Vật lý lớp 10 - Chương 2 - ...",
    "inputJson": "...",
    "outputJson": "...",  // ✅ PHẢI có giá trị
    "status": "Completed",
    "executedAt": "2025-11-02T...",
    "processingTimeMs": 1234
  }
]
```

**Nếu trả về `[]`:**
- ❌ Service không gọi repository
- ❌ Repository query sai
- ❌ Database không có data
- ❌ MapToDto có vấn đề

### Test Case 2: Check Specific Instance

```bash
GET https://localhost:7199/api/prompt-instances/8
```

**Expected Response:**
```json
{
  "instanceId": 8,
  "userId": 1,
  "packageId": 4,
  "outputJson": "...",  // ✅ PHẢI có giá trị
  "status": "Completed",
  ...
}
```

**Nếu trả về 404:**
- ❌ Instance không tồn tại trong database
- ❌ InstanceId không đúng

### Test Case 3: Check Database Directly

```sql
-- Kiểm tra instance có tồn tại
SELECT * FROM PromptInstances WHERE InstanceId = 8;

-- Kiểm tra tất cả instances của user
SELECT 
    InstanceId,
    UserId,
    PackageID,
    Status,
    CASE 
        WHEN OutputJson IS NULL THEN 'NULL'
        ELSE 'HAS VALUE'
    END as OutputJsonStatus,
    LEN(OutputJson) as OutputJsonLength
FROM PromptInstances 
WHERE UserId = 1
ORDER BY ExecutedAt DESC;
```

## Debugging Steps

1. **Restart Backend API** - Đảm bảo code mới được load
2. **Check Database** - Verify instance có trong database
3. **Test API Directly** - Dùng Postman/curl để test endpoint
4. **Check Logs** - Xem backend logs có error không
5. **Verify UserId** - Đảm bảo userId trong request = userId trong database

## Possible Issues

### Issue 1: Service Not Calling Repository
```csharp
// ❌ SAI
public Task<IEnumerable<PromptInstanceDto>> GetByUserIdAsync(int UserId)
{
    return Task.FromResult(Enumerable.Empty<PromptInstanceDto>());
}

// ✅ ĐÚNG
public async Task<IEnumerable<PromptInstanceDto>> GetByUserIdAsync(int UserId)
{
    var instances = await _promptInstanceRepository.GetByUserIdAsync(UserId);
    return instances.Select(MapToDto);
}
```

### Issue 2: Repository Query Wrong
```csharp
// ❌ SAI - Filter sai
.Where(p => p.UserId != UserId)  // ❌

// ✅ ĐÚNG
.Where(p => p.UserId == UserId)  // ✅
```

### Issue 3: Database Transaction Not Committed
- Instance được tạo nhưng transaction chưa commit
- Cần đảm bảo `SaveChangesAsync()` được gọi

### Issue 4: UserId Mismatch
- Frontend gửi `userId = 1`
- Database có `UserId = 2` (khác)
- Cần verify userId trong database

## Verification Checklist

- [ ] Backend đã restart sau khi fix
- [ ] Service method `GetByUserIdAsync` gọi repository
- [ ] Repository query filter đúng `UserId`
- [ ] Instance có trong database với `UserId = 1`
- [ ] Instance có `OutputJson` không null
- [ ] Instance có `Status = "Completed"`
- [ ] Controller endpoint route đúng
- [ ] MapToDto map đúng tất cả fields
- [ ] API test trực tiếp trả về instances (không phải `[]`)

## Next Steps

1. **Backend Team:**
   - Verify code implementation
   - Check database data
   - Test API endpoint trực tiếp
   - Provide response với instances hoặc error message rõ ràng

2. **Frontend Team:**
   - Đợi backend fix
   - Test lại sau khi backend fix
   - Verify logging chi tiết

## Contact

Nếu có câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ frontend team.

