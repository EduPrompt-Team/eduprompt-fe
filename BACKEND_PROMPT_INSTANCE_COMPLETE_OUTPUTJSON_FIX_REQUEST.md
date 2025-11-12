# Backend Fix Request: Prompt Instance Complete - outputJson Not Saved

## Vấn Đề Hiện Tại

Endpoint `POST /api/prompt-instances/{instanceId}/complete` không lưu `outputJson` vào database. Response trả về `outputJson: ""` (empty string) mặc dù frontend đã gửi `outputJson` với data đầy đủ.

## Evidence

**Frontend Request:**
```json
POST /api/prompt-instances/9/complete
{
  "outputJson": "{\"prompt\":\"...\",\"isMock\":false,\"conversationHistory\":[...],\"timestamp\":\"...\"}",
  "status": "Completed",
  "processingTimeMs": 1234
}
```

**Backend Response:**
```json
{
  "instanceId": 9,
  "userId": 1,
  "packageId": 7,
  "storageId": null,
  "promptName": "Chat Toán lớp 12 - Chương 1 - ...",
  "inputJson": "{\"formData\":{...},\"conversationHistory\":[...]}",
  "outputJson": "",  // ❌ Empty string - KHÔNG ĐÚNG!
  "status": "Completed",
  "executedAt": "2025-11-12T22:25:40.0210636",
  "processingTimeMs": null
}
```

## Yêu Cầu Backend

### 1. **Kiểm Tra Endpoint Complete**

**File:** `Eduprompt.API/Controllers/PromptInstanceController.cs`

**Endpoint:**
```csharp
[HttpPost("{instanceId}/complete")]
public async Task<IActionResult> Complete(int instanceId, [FromBody] CompletePromptInstanceDto completeDto)
{
    // ...
}
```

**Kiểm tra:**
- ✅ DTO có nhận `outputJson` không?
- ✅ Service có lưu `outputJson` vào database không?
- ✅ Có validation nào loại bỏ `outputJson` không?

### 2. **Kiểm Tra DTO**

**File:** `Eduprompt.Domain/DTOs/PromptInstance/CompletePromptInstanceDto.cs`

**Expected:**
```csharp
public class CompletePromptInstanceDto
{
    public string? OutputJson { get; set; }  // ✅ Phải có field này
    public string? Status { get; set; }
    public int? ProcessingTimeMs { get; set; }
}
```

### 3. **Kiểm Tra Service Method**

**File:** `Eduprompt.BLL/Services/PromptInstanceService.cs`

**Method:**
```csharp
public async Task<PromptInstanceDto> CompleteAsync(int instanceId, CompletePromptInstanceDto completeDto)
{
    var instance = await _promptInstanceRepository.GetByIdAsync(instanceId);
    if (instance == null)
    {
        throw new KeyNotFoundException($"PromptInstance with ID {instanceId} not found");
    }
    
    // ✅ PHẢI update outputJson
    if (!string.IsNullOrEmpty(completeDto.OutputJson))
    {
        instance.OutputJson = completeDto.OutputJson;  // ✅ Phải set outputJson
    }
    
    instance.Status = completeDto.Status ?? "Completed";
    instance.ProcessingTimeMs = completeDto.ProcessingTimeMs;
    
    var updatedInstance = await _promptInstanceRepository.UpdateAsync(instance);
    return MapToDto(updatedInstance);
}
```

### 4. **Kiểm Tra Repository Update**

**File:** `Eduprompt.DAL/Repositories/PromptInstanceRepository.cs`

**Method:**
```csharp
public async Task<PromptInstance> UpdateAsync(PromptInstance instance)
{
    _context.PromptInstances.Update(instance);
    await _context.SaveChangesAsync();
    return instance;
}
```

**Kiểm tra:**
- ✅ `OutputJson` có được map đúng trong DbContext không?
- ✅ `SaveChangesAsync()` có được gọi không?
- ✅ Có transaction nào rollback không?

## Test Cases

### Test Case 1: Complete Instance with outputJson

```bash
POST /api/prompt-instances/9/complete
{
  "outputJson": "{\"prompt\":\"Test prompt\",\"isMock\":false}",
  "status": "Completed",
  "processingTimeMs": 1000
}
```

**Expected Response:**
```json
{
  "instanceId": 9,
  "outputJson": "{\"prompt\":\"Test prompt\",\"isMock\":false}",  // ✅ PHẢI có giá trị
  "status": "Completed",
  "processingTimeMs": 1000
}
```

**Database:**
```sql
SELECT InstanceId, LEN(OutputJson) as OutputJsonLength, Status
FROM PromptInstances
WHERE InstanceId = 9;
-- Expected: OutputJsonLength > 0, Status = 'Completed'
```

### Test Case 2: Complete Instance with Empty outputJson

```bash
POST /api/prompt-instances/9/complete
{
  "outputJson": "",
  "status": "Completed"
}
```

**Expected:**
- Nếu `outputJson` là empty string, có thể giữ nguyên giá trị cũ hoặc set null
- Không nên set empty string nếu có giá trị cũ

### Test Case 3: Complete Instance without outputJson

```bash
POST /api/prompt-instances/9/complete
{
  "status": "Completed",
  "processingTimeMs": 1000
}
```

**Expected:**
- Nếu không có `outputJson` trong request, giữ nguyên giá trị cũ
- Chỉ update `status` và `processingTimeMs`

## Debugging Steps

1. **Check Request Body:**
   - Verify frontend gửi `outputJson` đúng format
   - Check Content-Type header: `application/json`

2. **Check Backend Logs:**
   - Xem có log nào về `outputJson` không?
   - Có exception nào khi parse JSON không?

3. **Check Database:**
   ```sql
   SELECT InstanceId, OutputJson, Status, ProcessingTimeMs
   FROM PromptInstances
   WHERE InstanceId = 9;
   ```
   - Verify `OutputJson` có giá trị trong database không?

4. **Check Response:**
   - Verify response có trả về `outputJson` đúng không?
   - Có field nào bị filter không?

## Possible Issues

### Issue 1: DTO Not Mapping outputJson
```csharp
// ❌ SAI - Thiếu OutputJson
public class CompletePromptInstanceDto
{
    public string? Status { get; set; }
    public int? ProcessingTimeMs { get; set; }
    // Missing: public string? OutputJson { get; set; }
}
```

### Issue 2: Service Not Updating outputJson
```csharp
// ❌ SAI - Không update outputJson
public async Task<PromptInstanceDto> CompleteAsync(...)
{
    instance.Status = completeDto.Status;
    // Missing: instance.OutputJson = completeDto.OutputJson;
    await _repository.UpdateAsync(instance);
}
```

### Issue 3: DbContext Not Saving outputJson
```csharp
// ❌ SAI - OutputJson không được map
modelBuilder.Entity<PromptInstance>(entity => {
    // Missing: entity.Property(e => e.OutputJson)...
});
```

### Issue 4: Response Filtering outputJson
```csharp
// ❌ SAI - Filter loại bỏ outputJson
private static PromptInstanceDto MapToDto(PromptInstance instance)
{
    return new PromptInstanceDto
    {
        InstanceId = instance.InstanceId,
        // Missing: OutputJson = instance.OutputJson,
        ...
    };
}
```

## Verification Checklist

- [ ] DTO `CompletePromptInstanceDto` có field `OutputJson`
- [ ] Service method `CompleteAsync` update `OutputJson`
- [ ] Repository `UpdateAsync` lưu `OutputJson` vào database
- [ ] DbContext map `OutputJson` đúng
- [ ] Response trả về `OutputJson` đầy đủ
- [ ] Database có `OutputJson` sau khi complete
- [ ] Test case pass với `outputJson` có giá trị

## Frontend Code Reference

**File:** `src/components/Page/DynamicChatPage.tsx`
**Line:** 520-526

```typescript
await promptInstanceService.complete(instanceId, {
  outputJson: JSON.stringify({
    prompt: response.data,
    isMock: response.isMock || false,
    conversationHistory: updatedMessages.map(msg => ({
      id: msg.id,
      text: msg.text,
      isUser: msg.isUser,
      timestamp: msg.timestamp.toISOString()
    })),
    timestamp: new Date().toISOString()
  }),
  status: PromptInstanceStatus.Completed,
  processingTimeMs: processingTime
})
```

**File:** `src/services/promptInstanceService.ts`
**Line:** 29-31

```typescript
async complete(instanceId: number, outputData: Record<string, unknown>): Promise<void> {
  await api.post(`/api/prompt-instances/${instanceId}/complete`, outputData)
}
```

## Impact

**Vấn đề này ảnh hưởng:**
- ❌ User không thể xem lại lịch sử chat đã lưu
- ❌ Chat history restore không hoạt động
- ❌ Prompt đã tạo bị mất (không thể xem lại)

## Priority

**🔴 HIGH** - Critical bug, ảnh hưởng trực tiếp đến user experience

## Next Steps

1. **Backend Team:**
   - Verify endpoint `/complete` lưu `outputJson` đúng
   - Test với các test cases trên
   - Fix nếu có vấn đề

2. **Frontend Team:**
   - Đợi backend fix
   - Test lại sau khi backend fix
   - Verify chat history restore hoạt động

## Contact

Nếu có câu hỏi hoặc cần làm rõ thêm, vui lòng liên hệ frontend team.

