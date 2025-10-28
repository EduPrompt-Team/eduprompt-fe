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
  // GET /api/Post
  async getAllPosts(): Promise<Post[]> {
    const { data } = await api.get('/api/Post')
    return data
  }

  // POST /api/Post
  async createPost(request: CreatePostRequest): Promise<Post> {
    const { data } = await api.post('/api/Post', request)
    return data
  }

  // GET /api/Post/{PostId}
  async getPostById(postId: number): Promise<Post> {
    const { data } = await api.get(`/api/Post/${postId}`)
    return data
  }

  // PUT /api/Post/{PostId}
  async updatePost(postId: number, request: UpdatePostRequest): Promise<Post> {
    const { data } = await api.put(`/api/Post/${postId}`, request)
    return data
  }

  // DELETE /api/Post/{PostId}
  async deletePost(postId: number): Promise<void> {
    await api.delete(`/api/Post/${postId}`)
  }

  // POST /api/Post/{PostId}/like
  async likePost(postId: number): Promise<void> {
    await api.post(`/api/Post/${postId}/like`)
  }

  // GET /api/Post/{PostId}/rating
  async getPostRating(postId: number): Promise<number> {
    const { data } = await api.get(`/api/Post/${postId}/rating`)
    return data
  }

  // GET /api/Post/published
  async getPublishedPosts(): Promise<Post[]> {
    const { data } = await api.get('/api/Post/published')
    return data
  }

  // GET /api/Post/search
  async searchPosts(searchTerm: string): Promise<Post[]> {
    const { data } = await api.get('/api/Post/search', {
      params: { searchTerm }
    })
    return data
  }

  // GET /api/Post/type/{postType}
  async getPostsByType(postType: string): Promise<Post[]> {
    const { data } = await api.get(`/api/Post/type/${postType}`)
    return data
  }

  // GET /api/Post/user/{UserId}
  async getPostsByUserId(userId: number): Promise<Post[]> {
    const { data } = await api.get(`/api/Post/user/${userId}`)
    return data
  }
}

export const postService = new PostService()

