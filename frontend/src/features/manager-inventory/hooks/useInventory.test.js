import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInventory } from './useInventory'
import { apiFetch } from '../../../services/api'

vi.mock('../../../services/api', () => ({
  apiFetch: vi.fn(),
}))

function mockApi({ productsPage, kpiTotal = 0, kpiOut = 0, kpiNoVar = 0, kpiNoImg = 0, logs = [] } = {}) {
  apiFetch.mockImplementation((url) => {
    if (url === '/api/products/filter?size=1') return Promise.resolve({ totalItems: kpiTotal })
    if (url === '/api/products/filter?stockFilter=outOfStock&size=1') return Promise.resolve({ totalItems: kpiOut })
    if (url === '/api/products/filter?stockFilter=noVariants&size=1') return Promise.resolve({ totalItems: kpiNoVar })
    if (url === '/api/products/filter?stockFilter=noImages&size=1') return Promise.resolve({ totalItems: kpiNoImg })
    if (url.startsWith('/api/products/filter')) return Promise.resolve(productsPage ?? { items: [], totalItems: 0, totalPages: 0 })
    if (url === '/api/manager/warehouse-logs') return Promise.resolve(logs)
    return Promise.reject(new Error(`Unhandled path trong mock: ${url}`))
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useInventory', () => {
  it('tải KPI counts từ 4 API song song', async () => {
    mockApi({ kpiTotal: 100, kpiOut: 5, kpiNoVar: 3, kpiNoImg: 2 })
    const { result } = renderHook(() => useInventory())

    await waitFor(() => expect(result.current.kpiCounts.total).toBe(100))
    expect(result.current.kpiCounts).toEqual({ total: 100, outOfStock: 5, noVariants: 3, noImages: 2 })
  })

  it('tải sản phẩm và tính đúng trạng thái tồn kho (het_hang/sap_het/con_hang)', async () => {
    mockApi({
      productsPage: {
        items: [
          { id: 1, name: 'A', availableCount: 0 },
          { id: 2, name: 'B', availableCount: 3 },
          { id: 3, name: 'C', availableCount: 20 },
        ],
        totalItems: 3, totalPages: 1,
      },
    })
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loadingProducts).toBe(false))

    expect(result.current.productsList.map((p) => p.status)).toEqual(['het_hang', 'sap_het', 'con_hang'])
  })

  it('debounce tìm kiếm: sau khi gõ, gọi lại API với keyword đúng và reset về trang đầu', async () => {
    mockApi({ productsPage: { items: [], totalItems: 0, totalPages: 0 } })
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loadingProducts).toBe(false))
    apiFetch.mockClear()

    act(() => result.current.setSearch('iphone'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith('/api/products/filter?keyword=iphone&page=0&size=20'))
  })

  it('lọc "sap_het" được thực hiện ở client vì backend chưa hỗ trợ trực tiếp', async () => {
    mockApi({
      productsPage: {
        items: [
          { id: 1, name: 'A', availableCount: 3 },
          { id: 2, name: 'B', availableCount: 20 },
        ],
        totalItems: 2, totalPages: 1,
      },
    })
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loadingProducts).toBe(false))

    act(() => result.current.setStatusFilter('sap_het'))

    expect(result.current.productsList).toHaveLength(1)
    expect(result.current.productsList[0].id).toBe(1)
  })

  it('đổi statusFilter sang het_hang thì gọi API với stockFilter=outOfStock (lọc server-side)', async () => {
    mockApi({ productsPage: { items: [], totalItems: 0, totalPages: 0 } })
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loadingProducts).toBe(false))
    apiFetch.mockClear()

    act(() => result.current.setStatusFilter('het_hang'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith('/api/products/filter?stockFilter=outOfStock&page=0&size=20'))
  })

  it('chỉ tải logs khi chuyển sang tab import/export, và không tải lại nếu đã có dữ liệu', async () => {
    mockApi({
      productsPage: { items: [], totalItems: 0, totalPages: 0 },
      logs: [{
        logId: 'l1', type: 'IMPORT', createdTime: '2026-01-01T00:00:00Z',
        performedBy: 'staff1', status: 'DONE', productName: 'A', quantity: 2, price: 1000,
      }],
    })
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loadingProducts).toBe(false))
    expect(apiFetch).not.toHaveBeenCalledWith('/api/manager/warehouse-logs')

    act(() => result.current.setActiveTab('import'))
    await waitFor(() => expect(result.current.importLogs).toHaveLength(1))

    const callsAfterFirstLoad = apiFetch.mock.calls.filter(([url]) => url === '/api/manager/warehouse-logs').length
    expect(callsAfterFirstLoad).toBe(1)

    act(() => result.current.setActiveTab('export')) // vẫn thuộc nhóm import/export nhưng đã có data rồi

    const callsAfterSecondSwitch = apiFetch.mock.calls.filter(([url]) => url === '/api/manager/warehouse-logs').length
    expect(callsAfterSecondSwitch).toBe(1) // không tải lại
  })
})
