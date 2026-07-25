import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductForm } from './useProductForm'
import { apiFetch } from '../../../services/api'

// loadProducts/showToast là dependency được TIÊM VÀO qua tham số (không phải import cứng),
// nên mock bằng vi.fn() truyền thẳng vào — không cần vi.mock() cho chúng.
vi.mock('../../../services/api', () => ({
  apiFetch: vi.fn(),
}))

function setup() {
  const loadProducts = vi.fn()
  const showToast = vi.fn()
  const { result } = renderHook(() => useProductForm({ loadProducts, showToast }))
  return { result, loadProducts, showToast }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProductForm', () => {
  it('handleAdd: chặn submit và set lỗi khi thiếu trường bắt buộc, không gọi API', async () => {
    const { result } = setup()

    await act(async () => { await result.current.handleAdd() })

    expect(apiFetch).not.toHaveBeenCalled()
    expect(result.current.formErrors).toEqual({
      name: 'Vui lòng nhập tên sản phẩm',
      brandId: 'Vui lòng chọn thương hiệu',
      categoryId: 'Vui lòng chọn danh mục',
    })
  })

  it('handleAdd: gửi đúng payload đã chuẩn hoá (trim, convert số, rỗng thành null) khi hợp lệ', async () => {
    const { result, loadProducts, showToast } = setup()
    apiFetch.mockResolvedValue({ id: 99, name: 'iPhone 15', variants: [], images: [] })

    act(() => result.current.setForm({
      ...result.current.form,
      name: '  iPhone 15  ',
      brandId: 'brand-1',
      categoryId: 'cat-1',
      screenSize: '6.1',
      description: '   ',
    }))

    await act(async () => { await result.current.handleAdd() })

    expect(apiFetch).toHaveBeenCalledWith('/api/manager/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'iPhone 15',
        description: null,
        brandId: 'brand-1',
        categoryId: 'cat-1',
        screenSize: 6.1,
        screenResolution: null,
        rearCamera: null,
        frontCamera: null,
        chipset: null,
        nfcSupported: false,
        batteryCapacity: null,
        simType: null,
        operatingSystem: null,
      }),
    })
    expect(showToast).toHaveBeenCalledWith('Đã thêm sản phẩm mới')
    expect(loadProducts).toHaveBeenCalled()
    expect(result.current.panel).toBe('edit')
    expect(result.current.editingId).toBe(99)
  })

  it('handleAdd: hiện toast lỗi và tắt saving khi API thất bại, không loadProducts', async () => {
    const { result, loadProducts, showToast } = setup()
    apiFetch.mockRejectedValue(new Error('Tên sản phẩm đã tồn tại'))

    act(() => result.current.setForm({ ...result.current.form, name: 'iPhone 15', brandId: 'b1', categoryId: 'c1' }))

    await act(async () => { await result.current.handleAdd() })

    expect(showToast).toHaveBeenCalledWith('Tên sản phẩm đã tồn tại')
    expect(result.current.saving).toBe(false)
    expect(loadProducts).not.toHaveBeenCalled()
  })

  it('openEdit: tải chi tiết sản phẩm và điền vào form (coerce nfcSupported, null → rỗng)', async () => {
    const { result } = setup()
    apiFetch.mockResolvedValue({
      id: 5, name: 'iPad', brandId: 'b1', categoryId: 'c1',
      nfcSupported: 1, screenSize: null, batteryCapacity: undefined,
      variants: [{ id: 1 }], images: [{ id: 2 }],
    })

    await act(async () => { await result.current.openEdit({ id: 5 }) })

    expect(apiFetch).toHaveBeenCalledWith('/api/products/5')
    expect(result.current.panel).toBe('edit')
    expect(result.current.editingId).toBe(5)
    expect(result.current.form.name).toBe('iPad')
    expect(result.current.form.nfcSupported).toBe(true)
    expect(result.current.form.screenSize).toBe('')
    expect(result.current.variants).toEqual([{ id: 1 }])
    expect(result.current.images).toEqual([{ id: 2 }])
  })

  it('openEdit: hiện toast lỗi và đóng panel khi tải chi tiết thất bại', async () => {
    const { result, showToast } = setup()
    apiFetch.mockRejectedValue(new Error('Không tìm thấy sản phẩm'))

    await act(async () => { await result.current.openEdit({ id: 404 }) })

    expect(showToast).toHaveBeenCalledWith('Không tìm thấy sản phẩm')
    expect(result.current.panel).toBeNull()
    expect(result.current.editingId).toBeNull()
  })

  it('handleAddVariant: chặn submit khi thiếu trường, không gọi API', async () => {
    const { result } = setup()

    await act(async () => { await result.current.handleAddVariant() })

    expect(apiFetch).not.toHaveBeenCalled()
    expect(result.current.subError).toBe('Vui lòng điền đầy đủ thông tin phiên bản')
  })

  it('handleAddVariant: gửi đúng payload đã convert số, thêm vào danh sách và reset form con', async () => {
    const { result, loadProducts } = setup()
    apiFetch.mockResolvedValueOnce({ id: 5, name: 'iPad', variants: [], images: [] }) // cho openEdit
    await act(async () => { await result.current.openEdit({ id: 5 }) })

    act(() => result.current.setVariantForm({ ramGb: '8', storageGb: '256', color: ' Xanh ', price: '25000000' }))

    const newVariant = { id: 10, ramGb: 8, storageGb: 256, color: 'Xanh', price: 25000000 }
    apiFetch.mockResolvedValueOnce(newVariant)

    await act(async () => { await result.current.handleAddVariant() })

    expect(apiFetch).toHaveBeenCalledWith('/api/manager/products/5/variants', {
      method: 'POST',
      body: JSON.stringify({ ramGb: 8, storageGb: 256, color: 'Xanh', price: 25000000 }),
    })
    expect(result.current.variants).toEqual([newVariant])
    expect(result.current.variantForm).toEqual({ ramGb: '', storageGb: '', color: '', price: '' })
    expect(loadProducts).toHaveBeenCalled()
  })
})
