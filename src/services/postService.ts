import { api } from '@/lib/api'

export interface Post {
  postId: number
  userId: number
  title: string
  content: string
  postType?: string
  status?: string
  tags?: string
  viewCount: number
  likeCount: number
  createdDate: string
  userName?: string
  averageRating: number
  feedbackCount: number
  storageId?: number
  price?: number
  [key: string]: any
}

export interface CreatePostRequest {
  userId: number
  title: string
  content: string
  postType?: string
  status?: string
  tags?: string
  storageId?: number
  price?: number
  templateArchitectureId?: number
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  isPublished?: boolean
}

class PostService {
  // GET /api/posts
  async getAllPosts(): Promise<Post[]> {
    const { data } = await api.get('/api/posts')
    return data
  }

  // POST /api/posts
  async createPost(request: CreatePostRequest): Promise<Post> {
    const { data } = await api.post('/api/posts', request)
    return data
  }

  // POST /api/posts/{id}/purchase
  async purchasePost(postId: number): Promise<{ storageId: number; promptInstanceId: number; message: string }> {
    const { data } = await api.post(`/api/posts/${postId}/purchase`)
    return data
  }

  // GET /api/posts/{id}
  async getPostById(postId: number): Promise<Post> {
    const { data } = await api.get(`/api/posts/${postId}`)
    return data
  }

  // PUT /api/posts/{id}
  async updatePost(postId: number, request: UpdatePostRequest): Promise<Post> {
    const { data } = await api.put(`/api/posts/${postId}`, request)
    return data
  }

  // DELETE /api/posts/{id}
  async deletePost(postId: number): Promise<void> {
    await api.delete(`/api/posts/${postId}`)
  }

  // POST /api/posts/{id}/like
  async likePost(postId: number): Promise<void> {
    await api.post(`/api/posts/${postId}/like`)
  }

  // GET /api/posts/{id}/rating
  async getPostRating(postId: number): Promise<number> {
    const { data } = await api.get(`/api/posts/${postId}/rating`)
    return data
  }

  // GET /api/posts/published
  async getPublishedPosts(): Promise<Post[]> {
    const { data } = await api.get('/api/posts/published')
    return data
  }

  // GET /api/posts/search
  async searchPosts(searchTerm: string): Promise<Post[]> {
    const { data } = await api.get('/api/posts/search', {
      params: { searchTerm }
    })
    return data
  }

  // GET /api/posts/type/{postType}
  async getPostsByType(postType: string): Promise<Post[]> {
    const { data } = await api.get(`/api/posts/type/${postType}`)
    return data
  }

  // GET /api/posts/user/{UserId}
  async getPostsByUserId(userId: number): Promise<Post[]> {
    const { data } = await api.get(`/api/posts/user/${userId}`)
    return data
  }
}

export const postService = new PostService()

