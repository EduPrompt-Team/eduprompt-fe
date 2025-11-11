import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { postService } from '@/services/postService'
import { storageTemplateService } from '@/services/storageTemplateService'
import { getCurrentUser } from '@/lib/api'
import { Button } from '@/components/ui/button'

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<'Sale' | 'Exchange' | 'Free'>('Sale')
  const [price, setPrice] = useState<number>(0)
  const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null)
  const [myStorage, setMyStorage] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyStorage()
  }, [])

  const fetchMyStorage = async () => {
    try {
      const storage = await storageTemplateService.getMyStorage()
      setMyStorage(storage)
    } catch (err) {
      console.error('Failed to fetch storage:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser?.userId) {
        setError('Vui lòng đăng nhập')
        return
      }

      if (!selectedStorageId) {
        setError('Vui lòng chọn template muốn bán/trao đổi')
        return
      }

      await postService.createPost({
        userId: Number(currentUser.userId),
        title,
        content,
        postType,
        status: 'Published',
        storageId: selectedStorageId,
        price: postType === 'Sale' ? price : 0
      })

      navigate('/posts')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold mb-8">Tạo bài đăng bán/trao đổi template</h1>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nội dung *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white min-h-[200px] focus:outline-none focus:border-[#60a5fa]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại bài đăng *</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as 'Sale' | 'Exchange' | 'Free')}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                >
                  <option value="Sale">Bán</option>
                  <option value="Exchange">Trao đổi</option>
                  <option value="Free">Miễn phí</option>
                </select>
              </div>

              {postType === 'Sale' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Giá (VND) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                    min="0"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Chọn template *</label>
                <select
                  value={selectedStorageId || ''}
                  onChange={(e) => setSelectedStorageId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                  required
                >
                  <option value="">-- Chọn template --</option>
                  {myStorage.map((item) => (
                    <option key={item.storageId} value={item.storageId}>
                      {item.templateName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                >
                  {loading ? 'Đang tạo...' : 'Tạo bài đăng'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="border-[#2f2f4a] text-white"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreatePostPage

