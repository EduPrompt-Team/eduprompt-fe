# AI Integration Setup Guide

## Cách tích hợp AI đã train vào project

### 1. Cấu hình n8n Webhook

1. **Lấy Webhook URL từ n8n:**
   - Mở n8n workflow của bạn
   - Click vào Webhook node
   - Copy URL webhook (ví dụ: `https://interiorly-pinnatisect-adalyn.ngrok-free.dev/webhook/your-webhook-id`)

2. **Cập nhật Webhook URL:**
   - Mở file `src/services/aiService.ts`
   - Thay đổi `webhookUrl` thành URL webhook của bạn:
   ```typescript
   this.webhookUrl = 'YOUR_N8N_WEBHOOK_URL_HERE'
   ```

### 2. Cấu hình n8n Workflow

Đảm bảo n8n workflow của bạn:

1. **Webhook Node:**
   - Method: POST
   - Accept JSON data
   - Response: JSON format

2. **AI Agent Node:**
   - Kết nối với Google Gemini Chat Model
   - Nhận input từ Webhook
   - Xử lý prompt generation

3. **Response Format:**
   ```json
   {
     "response": "Generated prompt text here",
     "success": true
   }
   ```

### 3. Test Integration

1. **Start n8n workflow:**
   - Đảm bảo workflow đang chạy
   - Status: "Active"

2. **Test từ Frontend:**
   - Mở trang chat
   - Kiểm tra connection status (green dot = connected)
   - Điền form và click "Tạo Prompt chuẩn"

### 4. Troubleshooting

**Nếu connection failed:**
- Kiểm tra ngrok URL có đúng không
- Đảm bảo n8n workflow đang chạy
- Check browser console cho error messages

**Nếu AI response không đúng:**
- Kiểm tra format data gửi từ frontend
- Verify n8n workflow logic
- Check AI model configuration

### 5. Environment Variables (Optional)

Để bảo mật hơn, bạn có thể sử dụng environment variables:

```typescript
// .env
VITE_N8N_WEBHOOK_URL=https://your-webhook-url.com

// aiService.ts
this.webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
```

### 6. Data Flow

```
Frontend Form → aiService → n8n Webhook → AI Agent → Gemini → Response → Frontend
```

### 7. Error Handling

- **Network Error:** Fallback to local prompt generation
- **AI Error:** Show error message with fallback
- **Connection Lost:** Visual indicator in header