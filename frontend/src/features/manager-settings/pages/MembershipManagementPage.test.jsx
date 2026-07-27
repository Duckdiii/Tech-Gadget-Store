import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MembershipManagementPage from './MembershipManagementPage'
import { apiFetch } from '../../../services/api'

vi.mock('../../../services/api', () => ({
  apiFetch: vi.fn(),
}))

describe('MembershipManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hiển thị đúng thông tin quyền lợi từ nested benefit của backend response', async () => {
    const mockMemberships = [
      {
        id: 'mem-silver',
        tier: 'SILVER',
        minSpending: 10000000,
        maxSpending: 20000000,
        benefitId: 'ben-silver',
        benefit: {
          id: 'ben-silver',
          discountPercentage: 5,
          freeShipping: true,
          description: 'Ưu đãi dành riêng cho hạng Bạc',
        },
        customersIds: ['cust-1', 'cust-2'],
      },
    ]

    apiFetch.mockResolvedValueOnce(mockMemberships)

    render(
      <MemoryRouter>
        <MembershipManagementPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Bạc').length).toBeGreaterThan(0)
    })

    // Kiểm tra hiển thị giảm giá 5%, miễn ship Có, mô tả quyền lợi
    expect(screen.getByText('Giảm 5% + Freeship')).toBeInTheDocument()
    expect(screen.getAllByText('5%').length).toBeGreaterThan(0)
    expect(screen.getByText('Có')).toBeInTheDocument()
    expect(screen.getByText('Ưu đãi dành riêng cho hạng Bạc')).toBeInTheDocument()
  })
})
