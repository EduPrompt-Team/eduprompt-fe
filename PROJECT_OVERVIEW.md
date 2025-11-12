# EduPrompt Frontend – Tổng quan dự án & luồng hoạt động

## Công nghệ
- **Framework**: React + TypeScript, Vite
- **Routing**: `react-router-dom`
- **HTTP**: Axios (`src/lib/api.ts`)
- **Trạng thái (cache đăng nhập)**: `sessionStorage`/`localStorage` qua helper trong `src/lib/api.ts`
- **UI**: TailwindCSS, component tùy biến
- **Icons**: `lucide-react`
- **Google Login**: `@react-oauth/google`

## Biến môi trường
- `VITE_API_BASE_URL` → base URL cho Axios
- `VITE_GOOGLE_CLIENT_ID` → client id cho Google OAuth

## Luồng xác thực (Authentication)
- Đăng nhập thường (email/mật khẩu)
  - UI: `src/components/Login/Login.tsx` → `handleEmailPasswordLogin`
  - API: `POST /api/auth/login` với `{ email, password }`
  - Thành công: `setTokens`, `fetchCurrentUser` (`GET /api/auth/me`), lưu user vào cache, phát sự kiện `user-logged-in`, điều hướng `/home`.
- Đăng nhập Google
  - UI: `src/components/Login/Login.tsx` (`GoogleLogin.onSuccess`)
  - API: `POST /api/auth/google-login` với `{ idToken }`
  - Thành công: các bước giống trên.
- Refresh token tự động
  - Trong `src/lib/api.ts` (interceptor phản hồi)
  - Nếu 401 và có refresh token → `POST /api/auth/refresh-token` → retry request. Nếu thất bại → xóa token, chuyển `/login`.
- Đồng bộ user trên header
  - `src/components/Layout/HeaderHomepage.tsx`, `src/components/Layout/HeaderGrade.tsx`
  - Kiểm tra mỗi 2 giây, lắng nghe `storage` và sự kiện `user-logged-in`, dùng `getCurrentUser()` / `fetchCurrentUser()` để cập nhật UI.

## Bản đồ routing (người dùng thường)
File: `src/router/ProtectRouter.tsx`
- `/` → redirect sang `/home`
- `/login` → Trang đăng nhập (UI: `src/components/Login/Login.tsx` được render từ route này)
- `/home` → HomePage
- Khối lớp: `/grade10`, `/grade11`, `/grade12`
- Legacy khối 10 (toán): `/grade10/math`, `/grade10/math/detail`, `/grade10/math/detail/chuong1`, `/grade10/math/detail/chuong2`, `/grade10/math/detail2`
- Trang chương động: `/grade/:grade/:subject`
- Trang chi tiết môn/chương động: `/grade/:grade/:subject/detail/:chapter`
- Tương thích ngược:
  - `/grade10/:subject/detail/:chapter`
  - `/grade11/:subject/detail/:chapter`
  - `/grade12/:subject/detail/:chapter`
  - `/grade11/:subject`, `/grade12/:subject`
- Hồ sơ & kho: `/profile`, `/mystorage`, `/myfavorites`, `/my-packages`
- Thanh toán: `/payment`, `/wallet`, `/wallet/topup`, `/payment-demo`, `/packages`
- Admin: `/admin/dashboard`, `/admin/viewprofile` (bọc bởi `AdminProtectedRoute`)

## Services và endpoint chính
- Vị trí: `src/services/*` và `src/lib/api.ts`
- Auth (`src/services/authService.ts`)
  - `POST /api/Auth/login`, `POST /api/Auth/google-login`, `GET /api/Auth/me`, `POST /api/Auth/refresh-token`, `POST /api/Auth/register`, `POST /api/Auth/revoke-token`
- Storage Templates (`src/services/storageTemplateService.ts`)
  - `GET /api/storage-templates/public` (filter: `grade`, `subject`, `chapter`)
  - `GET /api/storage-templates/my-storage`, CRUD `/api/storage-templates`
- Đánh giá/Feedback (`src/services/reviewService.ts` qua `feedbackService.ts`)
  - Tạo: `POST /api/feedbacks` payload `{ storageId, comment, rating, packageId? }`
  - Danh sách: `GET /api/feedbacks/storage/{storageId}`
  - Đếm: `GET /api/feedbacks/storage/{storageId}/count`
  - Điểm TB: `GET /api/feedbacks/storage/{storageId}/rating`
  - Cập nhật/Xóa theo id (nếu backend hỗ trợ)
- Ví/Thanh toán/Giao dịch (kết hợp các helper trong `src/lib/api.ts` và service chuyên biệt)
  - Ví: `GET /api/wallets/user/{userId}`, `GET /api/wallets/{walletId}`, `POST /api/wallets`
  - Số dư: `GET /api/wallets/balance/{userId}`
  - Cộng/Trừ: `POST /api/wallets/add-funds`, `POST /api/wallets/deduct-funds`
  - Phương thức thanh toán: `GET/POST /api/payment-methods`
  - Giao dịch: `GET /api/transactions`, `GET /api/transactions/wallet/{walletId}`, `POST /api/transactions`
  - Đơn hàng/Giỏ: `POST /api/orders/create-from-cart`, `GET /api/orders/my`, `GET/POST/DELETE /api/cart`, `POST /api/cart/items`
- Gói & Danh mục
  - Gói: `GET /api/packages`, `POST /api/packages`, `GET /api/packages/active`, `GET /api/packages/search`
  - Danh mục: `GET /api/package-categories`, `POST /api/package-categories`, `GET /api/package-categories/active`
- Khác (có mặt trong services, có thể chưa dùng full): lịch sử AI, vai trò, bài viết, wishlist, hội thoại/tin nhắn, kiến trúc template, expected outputs.

## Luồng theo từng trang (điều hướng + API)

### Đăng nhập – `/login`
- Component: `src/components/Login/Login.tsx`
- Hàm chính:
  - `handleEmailPasswordLogin` → `POST /api/auth/login` → `setTokens` → `fetchCurrentUser` → phát `user-logged-in` → `/home`.
  - `GoogleLogin.onSuccess` → `POST /api/auth/google-login` → tương tự.
- Lưu ý: lưu lựa chọn “Ghi nhớ”; header cập nhật theo sự kiện và storage.

### Danh sách chương – `/grade/:grade/:subject`
- Component: `src/components/Page/DynamicSubjectChaptersPage.tsx`
- Tải dữ liệu:
  - `storageTemplateService.getPublicTemplates({ grade, subject })`
  - Gom nhóm theo chương; lấy `chapter` từ field hoặc từ JSON `templateContent`.
- Điều hướng: click card chương → `/grade/{grade}/{subject}/detail/{chuongX}`.

### Chi tiết môn/chương – `/grade/:grade/:subject/detail/:chapter`
- Component: `src/components/Page/DynamicSubjectDetailRouter.tsx`
- Tải template:
  - Thử filter trực tiếp: `getPublicTemplates({ grade, subject, chapter })`, nếu fail thì tải all và lọc client-side theo `grade`, `subject`, `chapter`.
- Khu vực đánh giá (khi có `selectedPrompt.storageId`):
  - Danh sách: `reviewService.getReviewsByStorageId(storageId)` → `GET /api/feedbacks/storage/{storageId}`
  - Đếm: `reviewService.getReviewCount(storageId)` → `GET /api/feedbacks/storage/{storageId}/count`
  - Điểm TB: `reviewService.getAverageRating(storageId)` → `GET /api/feedbacks/storage/{storageId}/rating`
  - Tạo: `reviewService.createReview({ storageId, rating, comment, packageId? })` → `POST /api/feedbacks`
  - Sửa/Xóa: `reviewService.updateReview(...)`, `reviewService.deleteReview(...)` (nếu backend mở)
- Hành vi UI: toggle yêu thích (local), mở chat, thêm vào thư viện (`/mystorage`).

### Gói Prompt – `/packages`
- Component: `src/components/Package/PackagePage.tsx`
- Tải dữ liệu:
  - `packageService.getAllPackages()` → `GET /api/packages`
  - `packageCategoryService.getActiveCategories()` → `GET /api/package-categories/active` (fallback: suy ra từ packages)
  - Số dư ví (lazy): `walletService.getWalletByUserId(userId)`
- Thanh toán gói:
  - Gói miễn phí: đánh dấu đã sở hữu trong localStorage.
  - Gói trả phí: nếu thiếu tiền → lưu gói chọn → điều hướng `/wallet/topup`.
  - Đủ tiền: clear cart → thêm item (`POST /api/cart/items`) → tạo order (`POST /api/orders/create-from-cart`) → tạo transaction (Pending) → `walletService.deductFunds` → update transaction (Completed) → update order status → clear cart → thông báo.

### Ví – `/wallet`
- Component: `src/components/Page/WalletPage.tsx`
- Tải dữ liệu:
  - Ví theo user: `walletService.getWalletByUserId(userId)` hoặc fallback `GET /api/wallets/balance/{userId}`
  - Giao dịch: `GET /api/transactions/wallet/{walletId}`
- Hành động:
  - Kích hoạt ví: `POST /api/wallets`
  - Nạp tiền: điều hướng `/wallet/topup` (có hỗ trợ số tiền nhanh qua query)

### Nạp ví (Chế độ test) – `/wallet/topup`
- Component: `src/components/Payment/PaymentPrompt.tsx`
- Tải dữ liệu:
  - Ví theo user: `walletService.getWalletByUserId(userId)` hoặc fallback `GET /api/wallets/balance/{userId}`
  - Có thể tải phương thức thanh toán cho luồng nội bộ.
- Hành động (test):
  - `walletService.addFunds({ userId, amount })`
  - (Tuỳ chọn) tạo PaymentMethod/Transaction (TopUp → Pending), rồi cập nhật Completed (async)
  - Refresh ví; toast; điều hướng `/wallet`.

### Thanh toán (demo) – `/payment`
- Component: `src/components/Page/PaymentPage.tsx` (demo; có vài path legacy bên trong)
- Tải phương thức thanh toán theo id (route state), tạo & cập nhật transaction, trừ tiền ví nếu cần.

### Admin Dashboard – `/admin/dashboard`
- Component: `src/components/Admin/DashboardAdmin.tsx`
- Tải dữ liệu (phần quản lý đánh giá):
  - Templates: `storageTemplateService.getPublicTemplates({})` và `getMyStorage()` (nếu có)
  - Users: `userService.getAllUsers()` (nếu cần)
  - Với mỗi template: `reviewService.getReviewsByStorageId(storageId)`
  - Ghép dữ liệu hiển thị: tên/email user, tên template/khối/môn/chương, storageId.

## lib/api.ts – HTTP, token, helper
- Axios instance với baseURL và interceptors.
- Chọn nơi lưu token qua `setRemember` (localStorage vs sessionStorage).
- Helper: `setTokens`, `clearTokens`, `setCurrentUser`, `getCurrentUser`, `fetchCurrentUser`.
- Nhóm API tiện ích (cart, order, paymentMethod, transaction, wallet, package) với path REST tiêu chuẩn.

## Types/Status
- `src/types/status.ts` chứa enum như `TransactionStatus` dùng trong luồng thanh toán.

## Mẫu điều hướng toàn cục
- Header (`HeaderHomepage`, `HeaderGrade`) điều hướng tới khối lớp, hồ sơ, ví, kho, yêu thích, packages, và Admin (nếu là admin).
- Danh sách chương → chi tiết môn/chương → tạo/đọc đánh giá → (tuỳ chọn) mở chat/thêm vào thư viện.
- Gói → nạp ví (nếu thiếu tiền) → thanh toán → cập nhật đơn/giao dịch.

## Gợi ý tích hợp mobile
- Tái sử dụng các endpoint backend liệt kê ở trên.
- Auth
  - Đăng nhập: `/api/auth/login`, Google: `/api/auth/google-login`.
  - Lưu token (kho an toàn) và gọi `/api/auth/me` khi mở app.
  - Hỗ trợ refresh qua `/api/auth/refresh-token`.
- Templates
  - Endpoint public hỗ trợ filter: `grade` ∈ {'10','11','12'}, `subject` (tên tiếng Việt), `chapter` (ví dụ: "Chương 1").
- Đánh giá
  - Luôn dùng route theo storageId: `/api/feedbacks/storage/{storageId}`.
  - Trường nội dung là `comment` (không phải `content`).
- Ví/Thanh toán
  - Nạp ví: `POST /api/wallets/add-funds` và có thể tạo `POST /api/transactions` để theo dõi.
  - Mua gói: giỏ → đơn hàng → giao dịch → trừ ví → cập nhật trạng thái.

## Danh mục file chính
- Routing: `src/router/ProtectRouter.tsx`
- Auth: `src/components/Login/Login.tsx`, `src/services/authService.ts`, `src/lib/api.ts`
- Header: `src/components/Layout/HeaderHomepage.tsx`, `src/components/Layout/HeaderGrade.tsx`
- Templates: `src/services/storageTemplateService.ts`
- Reviews: `src/services/reviewService.ts`, `src/services/feedbackService.ts`
- Gói/Danh mục: `src/services/packageService.ts`, `src/services/packageCategoryService.ts`, `src/components/Package/PackagePage.tsx`
- Ví/Thanh toán: `src/components/Page/WalletPage.tsx`, `src/components/Payment/PaymentPrompt.tsx`, các services trong `src/lib/api.ts` và `src/services/*`
- Admin: `src/components/Admin/DashboardAdmin.tsx`

---
Tài liệu này tóm tắt điều hướng, cách gọi API và trách nhiệm của từng component để hỗ trợ triển khai mobile app sử dụng chung backend.
