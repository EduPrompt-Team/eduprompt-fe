import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { templateArchitectureService } from '@/services/templateArchitectureService'
import { storageTemplateService } from '@/services/storageTemplateService'
import { getCurrentUser } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface FieldDefinition {
  name: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

const CreateTemplateArchitecturePage: React.FC = () => {
  const navigate = useNavigate()
  const [architectureName, setArchitectureName] = useState('')
  const [architectureType, setArchitectureType] = useState('Sequential')
  const [description, setDescription] = useState('')
  const [storageId, setStorageId] = useState<number | null>(null)
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myStorage, setMyStorage] = useState<any[]>([])

  React.useEffect(() => {
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

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', label: '', required: false }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
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

      if (!storageId) {
        setError('Vui lòng chọn Storage Template')
        return
      }

      const configuration = JSON.stringify({ fields })

      await templateArchitectureService.create({
        storageId,
        architectureName,
        architectureType,
        description,
        configuration,
        status: 'Active'
      })

      navigate('/admin/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo template architecture')
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
            <h1 className="text-3xl font-bold mb-8">Tạo Template Architecture (Admin)</h1>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tên Architecture *</label>
                <input
                  type="text"
                  value={architectureName}
                  onChange={(e) => setArchitectureName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại Architecture *</label>
                <select
                  value={architectureType}
                  onChange={(e) => setArchitectureType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                >
                  <option value="Sequential">Sequential</option>
                  <option value="Branching">Branching</option>
                  <option value="Parallel">Parallel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white min-h-[100px] focus:outline-none focus:border-[#60a5fa]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Storage Template *</label>
                <select
                  value={storageId || ''}
                  onChange={(e) => setStorageId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                  required
                >
                  <option value="">-- Chọn Storage Template --</option>
                  {myStorage.map((item) => (
                    <option key={item.storageId} value={item.storageId}>
                      {item.templateName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">Field Definitions</label>
                  <Button type="button" onClick={addField} variant="outline" className="border-[#2f2f4a] text-white">
                    + Thêm Field
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={index} className="bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Name *</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded text-white text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Type *</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(index, { type: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded text-white text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="number">Number</option>
                            <option value="select">Select</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs text-neutral-400 mb-1">Label *</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded text-white text-sm"
                          required
                        />
                      </div>
                      {field.type === 'select' && (
                        <div className="mb-4">
                          <label className="block text-xs text-neutral-400 mb-1">Options (comma-separated)</label>
                          <input
                            type="text"
                            value={field.options?.join(',') || ''}
                            onChange={(e) => updateField(index, { options: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded text-white text-sm"
                            placeholder="option1, option2, option3"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Required
                        </label>
                        <Button
                          type="button"
                          onClick={() => removeField(index)}
                          variant="outline"
                          className="border-red-500 text-red-400 text-sm"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                >
                  {loading ? 'Đang tạo...' : 'Tạo Template Architecture'}
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

export default CreateTemplateArchitecturePage

