import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { postService } from '@/services/postService'
import { getCurrentUser } from '@/lib/api'
import { Button } from '@/components/ui/button'

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchPost(Number(id))
    }
  }, [id])

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true)
      const data = await postService.getPostById(postId)
      setPost(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải post')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!post || !id) return

    try {
      setPurchasing(true)
      setError(null)
      const result = await postService.purchasePost(Number(id))
      alert(`Mua thành công! Template đã được thêm vào Storage (ID: ${result.storageId})`)
      navigate('/profile/storage')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể mua template')
    } finally {
      setPurchasing(false)
    }
  }

  const currentUser = getCurrentUser()
  const isOwner = post && currentUser?.userId && post.userId === Number(currentUser.userId)
  const isSold = post?.status === 'Sold'
  const canPurchase = post && !isOwner && !isSold && post.storageId

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <HeaderHomepage />
        <div className="flex">
          <SiderBar />
          <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
            <div className="max-w-4xl mx-auto px-4 py-16">
              <div className="text-center">Đang tải...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <HeaderHomepage />
        <div className="flex">
          <SiderBar />
          <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
            <div className="max-w-4xl mx-auto px-4 py-16">
              <div className="text-center text-red-400">{error}</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="max-w-4xl mx-auto px-4 py-16">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            {post && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                  <div className="flex items-center gap-4 text-neutral-400">
                    <span>Bởi: {post.userName || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(post.createdDate).toLocaleDateString()}</span>
                    {post.price && post.price > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-400 font-semibold">{post.price.toLocaleString()} VND</span>
                      </>
                    )}
                    {isSold && <span className="text-red-400">• Đã bán</span>}
                  </div>
                </div>

                <div className="bg-[#1a1a2d] rounded-lg border border-[#2f2f4a] p-6 mb-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>

                {canPurchase && (
                  <div className="flex gap-4">
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400"
                    >
                      {purchasing ? 'Đang xử lý...' : post.price && post.price > 0 ? `Mua với ${post.price.toLocaleString()} VND` : 'Nhận miễn phí'}
                    </Button>
                  </div>
                )}

                {isOwner && (
                  <div className="text-neutral-400">Đây là bài đăng của bạn</div>
                )}

                {isSold && !isOwner && (
                  <div className="text-red-400">Template này đã được bán</div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PostDetailPage

