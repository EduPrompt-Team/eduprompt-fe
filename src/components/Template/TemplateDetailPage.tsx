import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { templateArchitectureService } from '@/services/templateArchitectureService'
import { promptInstanceService } from '@/services/promptInstanceService'
import { aiService } from '@/services/aiService'
import { storageTemplateService } from '@/services/storageTemplateService'
import { getCurrentUser } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

interface FieldDefinition {
  name: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  [key: string]: any
}

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [processing, setProcessing] = useState(false)
  const [useAI, setUseAI] = useState(true)
  const [aiOutput, setAiOutput] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchTemplate(Number(id))
    }
  }, [id])

  const fetchTemplate = async (templateId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await templateArchitectureService.getById(templateId)
      setTemplate(data)
      
      // Parse configuration to get field definitions
      if (data.configuration) {
        try {
          const config = JSON.parse(data.configuration)
          if (config.fields && Array.isArray(config.fields)) {
            const initialData: Record<string, any> = {}
            config.fields.forEach((field: FieldDefinition) => {
              initialData[field.name] = ''
            })
            setFormData(initialData)
          }
        } catch (e) {
          console.warn('Failed to parse configuration:', e)
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải template')
    } finally {
      setLoading(false)
    }
  }

  const getFieldDefinitions = (): FieldDefinition[] => {
    if (!template?.configuration) return []
    try {
      const config = JSON.parse(template.configuration)
      return config.fields || []
    } catch {
      return []
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleSubmit = async () => {
    try {
      setProcessing(true)
      const currentUser = getCurrentUser()
      if (!currentUser?.userId) {
        showToast('Vui lòng đăng nhập', 'error')
        return
      }

      // 1. Create PromptInstance
      const promptInstance = await promptInstanceService.create({
        userId: Number(currentUser.userId),
        packageId: template?.storageId || 0, // Use storageId as packageId if available
        promptName: `${template?.architectureName || 'Template'} - ${new Date().toLocaleString()}`,
        inputJson: JSON.stringify(formData),
        status: 'Pending'
      })

      let finalOutput = JSON.stringify(formData)

      // 2. If use AI, generate suggestions
      if (useAI) {
        try {
          const aiResponse = await aiService.generateSuggestions(promptInstance.instanceId, {
            outputName: 'AI Generated Output'
          })
          setAiOutput(aiResponse.generatedOutput)
          finalOutput = aiResponse.generatedOutput
        } catch (aiErr: any) {
          console.warn('AI generation failed:', aiErr)
          showToast('AI generation failed, saving without AI output', 'warning')
        }
      }

      // 3. Save to StorageTemplate
      await storageTemplateService.saveTemplate({
        packageId: template?.storageId || 0,
        templateName: `${template?.architectureName || 'Template'} - Saved`,
        templateContent: finalOutput,
        isPublic: false
      })

      showToast('Đã lưu template thành công!', 'success')
      navigate('/profile/storage')
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể lưu template', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.name] || ''

    switch (field.type) {
      case 'text':
      case 'string':
        return (
          <input
            key={field.name}
            type="text"
            className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#60a5fa]"
            placeholder={field.placeholder || field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        )
      case 'textarea':
        return (
          <textarea
            key={field.name}
            className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#60a5fa] min-h-[100px]"
            placeholder={field.placeholder || field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        )
      case 'select':
      case 'dropdown':
        return (
          <select
            key={field.name}
            className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Chọn {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'number':
        return (
          <input
            key={field.name}
            type="number"
            className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#60a5fa]"
            placeholder={field.placeholder || field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
            required={field.required}
          />
        )
      default:
        return (
          <input
            key={field.name}
            type="text"
            className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#60a5fa]"
            placeholder={field.placeholder || field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        )
    }
  }

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

  if (error || !template) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <HeaderHomepage />
        <div className="flex">
          <SiderBar />
          <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
            <div className="max-w-4xl mx-auto px-4 py-16">
              <div className="text-center text-red-400">{error || 'Template not found'}</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const fields = getFieldDefinitions()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{template.architectureName}</h1>
              <p className="text-neutral-400">Loại: {template.architectureType}</p>
            </div>

            <div className="bg-[#23233a] rounded-lg border border-[#2a2a44] p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Sử dụng AI để gợi ý output</span>
                </label>
              </div>

              {fields.length === 0 ? (
                <div className="text-neutral-400">Template không có field definitions</div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {aiOutput && (
              <div className="bg-[#1a1a2d] rounded-lg border border-[#2f2f4a] p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">AI Generated Output:</h3>
                <pre className="text-sm text-neutral-300 whitespace-pre-wrap">{aiOutput}</pre>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={processing}
                className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
              >
                {processing ? 'Đang xử lý...' : useAI ? 'Gọi AI và Lưu' : 'Lưu Template'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-[#2f2f4a] text-white"
              >
                Hủy
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TemplateDetailPage

