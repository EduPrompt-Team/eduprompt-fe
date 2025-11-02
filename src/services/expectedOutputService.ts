import { api } from '@/lib/api'
import type { ExpectedOutputDto } from '@/types/dto/prompt'

class ExpectedOutputService {
  // POST /api/expected-outputs
  async create(payload: Omit<ExpectedOutputDto, 'outputId'>): Promise<ExpectedOutputDto> {
    const { data } = await api.post('/api/expected-outputs', payload)
    return data
  }

  // PUT /api/expected-outputs/{outputId}
  async update(outputId: number, payload: Partial<ExpectedOutputDto>): Promise<ExpectedOutputDto> {
    const { data } = await api.put(`/api/expected-outputs/${outputId}`, payload)
    return data
  }

  // DELETE /api/expected-outputs/{outputId}
  async remove(outputId: number): Promise<void> {
    await api.delete(`/api/expected-outputs/${outputId}`)
  }

  // GET /api/expected-outputs/instance/{InstanceId}
  async getByInstance(instanceId: number): Promise<ExpectedOutputDto[]> {
    const { data } = await api.get(`/api/expected-outputs/instance/${instanceId}`)
    return data
  }
}

export const expectedOutputService = new ExpectedOutputService()
