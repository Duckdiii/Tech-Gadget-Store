import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProductList } from './useProductList'
import { apiFetch } from '../../../services/api'

// Biên duy nhất chạm ra ngoài (network) là apiFetch — mock đúng chỗ này, còn lại
// (useToast, useDebouncedValue, useLocation...) để chạy thật, đúng tinh thần integration test.
vi.mock('../../../services/api', () => ({
  apiFetch: vi.fn(),
}))

function wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

function mockApi({ filter, brands = [], categories = [], stats = {}, discontinue, reactivate } = {}) {
  apiFetch.mockImplementation((path) => {
    if (path.startsWith('/api/products/filter')) {
      return Promise.resolve(filter ?? { items: [], totalPages: 0, totalItems: 0 })
    }
    if (path === '/api/manager/brands') return Promise.resolve(brands)
    if (path === '/api/manager/categories') return Promise.resolve(categories)
    if (path === '/api/manager/products/stats') return Promise.resolve(stats)
    if (/\/api\/manager\/products\/\d+\/discontinue$/.test(path)) {
      return discontinue ? discontinue(path) : Promise.resolve(null)
    }
    if (/\/api\/manager\/products\/\d+\/reactivate$/.test(path)) {
      return reactivate ? reactivate(path) : Promise.resolve(null)
    }
    return Promise.reject(new Error(`Unhandled path trong mock: ${path}`))
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProductList', () => {
  it('tải danh sách sản phẩm lần đầu và chuẩn hoá dữ liệu từ API', async () => {
    mockApi({
      filter: {
        items: [{
          id: 1, name: 'iPhone 15', brandName: 'Apple', categoryName: 'Điện thoại',
          minPrice: 20000000, availableCount: null, variantCount: undefined, hasVariants: 1,
        }],
        totalPages: 1,
        totalItems: 1,
      },
    })

    const { result } = renderHook(() => useProductList(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.products).toEqual([{
      id: 1, name: 'iPhone 15', brandName: 'Apple', categoryName: 'Điện thoại',
      minPrice: 20000000, imageUrl: '', hasVariants: true, variantCount: 0, availableCount: 0,
    }])
    expect(result.current.totalItems).toBe(1)
    expect(apiFetch).toHaveBeenCalledWith('/api/products/filter?active=true&page=0&size=20')
  })

  it('set error và tắt loading khi API lỗi', async () => {
    mockApi({}) // brands/categories/stats resolve bình thường
    apiFetch.mockImplementation((path) => {
      if (path.startsWith('/api/products/filter')) return Promise.reject(new Error('Server lỗi'))
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useProductList(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Server lỗi')
    expect(result.current.products).toEqual([])
  })

  it('tìm kiếm: sau khi debounce, gọi lại API với keyword đúng và reset về trang đầu', async () => {
    mockApi({ filter: { items: [], totalPages: 0, totalItems: 0 } })

    const { result } = renderHook(() => useProductList(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    apiFetch.mockClear()

    act(() => result.current.setSearch('iphone'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith(
      '/api/products/filter?keyword=iphone&active=true&page=0&size=20',
    ))
  })

  it('đổi sang tab discontinued thì gọi API với active=false', async () => {
    mockApi({ filter: { items: [], totalPages: 0, totalItems: 0 } })

    const { result } = renderHook(() => useProductList(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    apiFetch.mockClear()

    act(() => result.current.selectTab('discontinued'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith(
      '/api/products/filter?active=false&page=0&size=20',
    ))
  })

  it('handleDiscontinue: xoá sản phẩm khỏi danh sách và hiện toast khi thành công', async () => {
    mockApi({ filter: { items: [{ id: 1, name: 'iPhone 15' }], totalPages: 1, totalItems: 1 } })

    const { result } = renderHook(() => useProductList(), { wrapper })
    await waitFor(() => expect(result.current.products).toHaveLength(1))

    await act(async () => { await result.current.handleDiscontinue(1) })

    expect(result.current.products).toHaveLength(0)
    expect(result.current.toast).toBe('Đã ngừng kinh doanh sản phẩm')
    expect(apiFetch).toHaveBeenCalledWith('/api/manager/products/1/discontinue', { method: 'PATCH' })
  })

  it('handleDiscontinue: giữ nguyên danh sách và hiện toast lỗi khi API thất bại', async () => {
    mockApi({
      filter: { items: [{ id: 1, name: 'iPhone 15' }], totalPages: 1, totalItems: 1 },
      discontinue: () => Promise.reject(new Error('Không thể ngừng kinh doanh')),
    })

    const { result } = renderHook(() => useProductList(), { wrapper })
    await waitFor(() => expect(result.current.products).toHaveLength(1))

    await act(async () => { await result.current.handleDiscontinue(1) })

    expect(result.current.products).toHaveLength(1)
    expect(result.current.toast).toBe('Không thể ngừng kinh doanh')
  })

  it('selectKpi: chọn cùng 1 KPI hai lần liên tiếp thì bỏ chọn (toggle về null)', async () => {
    mockApi({ filter: { items: [], totalPages: 0, totalItems: 0 } })

    const { result } = renderHook(() => useProductList(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.selectKpi('outOfStock'))
    expect(result.current.activeKpi).toBe('outOfStock')

    act(() => result.current.selectKpi('outOfStock'))
    expect(result.current.activeKpi).toBeNull()
  })
})
