// Centralized Status Enums for Eduprompt

// 1. USER STATUS
export const UserStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
  Banned: 'Banned',
  Suspended: 'Suspended',
} as const
export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

// 2. ROLE STATUS
export const RoleStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
} as const
export type RoleStatus = typeof RoleStatus[keyof typeof RoleStatus]

// 3. CART STATUS
export const CartStatus = {
  Active: 'Active',
  Abandoned: 'Abandoned',
  Cleared: 'Cleared',
  Checkout: 'Checkout',
} as const
export type CartStatus = typeof CartStatus[keyof typeof CartStatus]

// 4. CONVERSATION STATUS
export const ConversationStatus = {
  Active: 'Active',
  Archived: 'Archived',
  Closed: 'Closed',
} as const
export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus]

// 5. MESSAGE STATUS
export const MessageStatus = {
  Sent: 'Sent',
  Delivered: 'Delivered',
  Read: 'Read',
  Failed: 'Failed',
  Deleted: 'Deleted',
} as const
export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus]

// 6. ORDER STATUS
export const OrderStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Refunded: 'Refunded',
  Failed: 'Failed',
} as const
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]

// 7. TRANSACTION STATUS
export const TransactionStatus = {
  Pending: 'Pending',
  Completed: 'Completed',
  Failed: 'Failed',
  Reversed: 'Reversed',
  OnHold: 'OnHold',
} as const
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus]

// 8. WALLET STATUS
export const WalletStatus = {
  Active: 'Active',
  Frozen: 'Frozen',
  Closed: 'Closed',
  Suspended: 'Suspended',
} as const
export type WalletStatus = typeof WalletStatus[keyof typeof WalletStatus]

// 9. AI HISTORY STATUS
export const AIHistoryStatus = {
  Completed: 'Completed',
  Processing: 'Processing',
  Failed: 'Failed',
  Paused: 'Paused',
  Error: 'Error',
} as const
export type AIHistoryStatus = typeof AIHistoryStatus[keyof typeof AIHistoryStatus]

// 10. PROMPT INSTANCE STATUS
export const PromptInstanceStatus = {
  Completed: 'Completed',
  Running: 'Running',
  Queued: 'Queued',
  Failed: 'Failed',
  Paused: 'Paused',
  Retrying: 'Retrying',
} as const
export type PromptInstanceStatus = typeof PromptInstanceStatus[keyof typeof PromptInstanceStatus]

// 11. POST STATUS
export const PostStatus = {
  Published: 'Published',
  Draft: 'Draft',
  Reviewing: 'Reviewing',
  Rejected: 'Rejected',
  Archived: 'Archived',
  Unpublished: 'Unpublished',
} as const
export type PostStatus = typeof PostStatus[keyof typeof PostStatus]

// 12. FEEDBACK STATUS
export const FeedbackStatus = {
  Active: 'Active',
  Removed: 'Removed',
  Flagged: 'Flagged',
  Hidden: 'Hidden',
} as const
export type FeedbackStatus = typeof FeedbackStatus[keyof typeof FeedbackStatus]

// 13. PACKAGE ACTIVE FLAG (expressed as enum for convenience in FE)
export const PackageActiveFlag = {
  Active: 1,
  Inactive: 0,
} as const
export type PackageActiveFlag = typeof PackageActiveFlag[keyof typeof PackageActiveFlag]

// 14. PAYMENT STATUS
export const PaymentStatus = {
  Pending: 'Pending',      // Chờ xử lý - Khi tạo Payment record lần đầu, đang chờ user thanh toán trên VNPay
  Paid: 'Paid',            // Đã thanh toán - Khi VNPay callback thành công (vnp_ResponseCode = "00")
  Failed: 'Failed',        // Thanh toán thất bại - Signature không hợp lệ hoặc vnp_ResponseCode != "00"
  Refunded: 'Refunded',    // Đã hoàn tiền - Khi admin thực hiện refund qua VNPay
  Cancelled: 'Cancelled',  // Đã hủy - Khi admin/user hủy payment
} as const
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus]

// Re-export as a single namespace-like object (optional convenience)
export const Status = {
  UserStatus,
  RoleStatus,
  CartStatus,
  ConversationStatus,
  MessageStatus,
  OrderStatus,
  TransactionStatus,
  WalletStatus,
  AIHistoryStatus,
  PromptInstanceStatus,
  PostStatus,
  FeedbackStatus,
  PackageActiveFlag,
  PaymentStatus,
}

export type AnyStatus =
  | `${UserStatus}`
  | `${RoleStatus}`
  | `${CartStatus}`
  | `${ConversationStatus}`
  | `${MessageStatus}`
  | `${OrderStatus}`
  | `${TransactionStatus}`
  | `${WalletStatus}`
  | `${AIHistoryStatus}`
  | `${PromptInstanceStatus}`
  | `${PostStatus}`
  | `${FeedbackStatus}`
  | `${PaymentStatus}`

// Defaults per DB notes
export const DefaultStatus = {
  User: UserStatus.Active,
  Wallet: WalletStatus.Active,
  Cart: CartStatus.Active,
  Conversation: ConversationStatus.Active,
  Feedback: FeedbackStatus.Active,
  Message: MessageStatus.Sent,
  Order: OrderStatus.Pending,
  Post: PostStatus.Published,
  PromptInstance: PromptInstanceStatus.Completed,
  AIHistory: AIHistoryStatus.Completed,
  Transaction: TransactionStatus.Pending,
  Payment: PaymentStatus.Pending, // Payment default status per backend
} as const


