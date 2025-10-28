import { PostStatus } from '@/types/status'

export interface PostDto {
  postId: number
  userId: number
  packageId?: number | null
  title: string
  content: string
  viewCount: number
  publishedAt: string
  status?: PostStatus | null
  postType?: string | null
  tags?: string | null
  likeCount: number
}


