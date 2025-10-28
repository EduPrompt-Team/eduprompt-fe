import { api } from '@/lib/api'

export interface Post {
  postId: number
  userId: number
  title: string
  content: string
  postType: string
  isPublished: boolean
  createdAt: string
  [key: string]: any
}

export interface CreatePostRequest {
  title: string
  content: string
  postType: string
  isPublished?: boolean
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

