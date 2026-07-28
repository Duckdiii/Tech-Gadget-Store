import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStaffImport } from './useStaffImport'
import { staffInventoryService } from '../services/staffInventoryService'

vi.mock('../services/staffInventoryService', () => ({
  staffInventoryService: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    getSuppliers: vi.fn(),
    getBrands: vi.fn(),
    getCategories: vi.fn(),
    createImportLog: vi.fn(),
  },
}))

const USER = { email: 'bich.tran@techstore.vn', name: 'Trần Thị Bích' } // → user-stf-01

const RAW_PRODUCTS = { items: [{ id: 'p1', name: 'iPhone 15' }] }
const DETAILED_PRODUCT = {
  id: 'p1', name: 'iPhone 15',
  variants: [{ id: 'v1', ramGb: 8, storageGb: 128, color: 'Đen', price: 20000000 }],
}

async function setupWithData() {
  staffInventoryService.getProducts.mockResolvedValue(RAW_PRODUCTS)
  staffInventoryService.getProductById.mockResolvedValue(DETAILED_PRODUCT)
  staffInventoryService.getSuppliers.mockResolvedValue([])
  staffInventoryService.getBrands.mockResolvedValue([])
  staffInventoryService.getCategories.mockResolvedValue([])
  const { result } = renderHook(() => useStaffImport(USER))
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStaffImport', () => {
  it('tải danh sách sản phẩm (kèm chi tiết variants) lần đầu', async () => {
    const result = await setupWithData()
    expect(result.current.productsList).toEqual([DETAILED_PRODUCT])
  })

  it('updateRow: chọn sản phẩm + phiên bản hiện có thì tự động điền giá/tên', async () => {
    const result = await setupWithData()

    act(() => result.current.updateRow(0, 'productId', 'p1'))
    act(() => result.current.updateRow(0, 'productVariantId', 'v1'))

    expect(result.current.rows[0].unitPrice).toBe(20000000)
    expect(result.current.rows[0].displayName).toBe('iPhone 15')
    expect(result.current.rows[0].variantName).toBe('8GB RAM / 128GB Storage / Đen')
  })

  it('validate: báo lỗi khi thiếu nhà cung cấp và ngày nhập', async () => {
    const result = await setupWithData()
    act(() => result.current.setDate(''))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.supplier).toBe('Vui lòng điền tên nhà cung cấp')
    expect(result.current.errors.date).toBe('Vui lòng chọn ngày nhập')
  })

  it('validate: dòng sản phẩm hiện có (trống hoàn toàn) báo đúng lỗi từng field', async () => {
    const result = await setupWithData()
    act(() => result.current.setSupplier('NCC ABC'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.rows).toEqual({
      '0_productId': 'Chưa chọn sản phẩm',
      '0_productVariantId': 'Chưa chọn phiên bản',
      '0_qty': 'Số lượng > 0',
      '0_unitPrice': 'Giá nhập >= 0',
    })
  })

  it('validate: dòng sản phẩm mới thiếu tên/giá báo đúng lỗi', async () => {
    const result = await setupWithData()
    act(() => result.current.setSupplier('NCC ABC'))
    act(() => result.current.updateRow(0, 'isNewProduct', true))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.rows).toEqual({
      '0_newName': 'Thiếu tên sản phẩm',
      '0_newPrice': 'Giá không hợp lệ',
      '0_qty': 'Số lượng > 0',
      '0_unitPrice': 'Giá nhập >= 0',
    })
  })

  it('submit thành công (sản phẩm hiện có): payload dùng productVariantId, tạo phiếu nhập', async () => {
    const result = await setupWithData()
    act(() => result.current.setSupplier('NCC ABC'))
    act(() => result.current.updateRow(0, 'productId', 'p1'))
    act(() => result.current.updateRow(0, 'productVariantId', 'v1'))
    act(() => result.current.updateRow(0, 'qty', 10))
    act(() => result.current.updateRow(0, 'unitPrice', 18000000))
    staffInventoryService.createImportLog.mockResolvedValue({ id: 'imp-1', importedAt: '2026-01-01T00:00:00Z' })

    await act(async () => { await result.current.handleSubmit() })

    expect(staffInventoryService.createImportLog).toHaveBeenCalledWith(expect.objectContaining({
      supplierName: 'NCC ABC',
      performedBy: 'user-stf-01',
      items: [{ productVariantId: 'v1', quantity: 10, importPrice: 18000000 }],
    }))
    expect(result.current.receipt.id).toBe('imp-1')
    expect(result.current.receipt.staffName).toBe('Trần Thị Bích')
  })

  it('submit thành công (sản phẩm mới): payload dùng newProduct, tạo phiếu nhập', async () => {
    const result = await setupWithData()
    act(() => result.current.setSupplier('NCC ABC'))
    act(() => result.current.updateRow(0, 'isNewProduct', true))
    act(() => result.current.updateRow(0, 'newName', 'Xiaomi 14'))
    act(() => result.current.updateRow(0, 'newPrice', 15000000))
    act(() => result.current.updateRow(0, 'qty', 5))
    act(() => result.current.updateRow(0, 'unitPrice', 13000000))
    staffInventoryService.createImportLog.mockResolvedValue({ id: 'imp-2', importedAt: '2026-01-01T00:00:00Z' })

    await act(async () => { await result.current.handleSubmit() })

    expect(staffInventoryService.createImportLog).toHaveBeenCalledWith(expect.objectContaining({
      items: [expect.objectContaining({
        newProduct: expect.objectContaining({ name: 'Xiaomi 14', price: 15000000 }),
        quantity: 5,
        importPrice: 13000000,
      })],
    }))
    expect(result.current.receipt.id).toBe('imp-2')
  })

  it('submit thất bại: set errors.submit, không tạo phiếu', async () => {
    const result = await setupWithData()
    act(() => result.current.setSupplier('NCC ABC'))
    act(() => result.current.updateRow(0, 'productId', 'p1'))
    act(() => result.current.updateRow(0, 'productVariantId', 'v1'))
    act(() => result.current.updateRow(0, 'qty', 10))
    act(() => result.current.updateRow(0, 'unitPrice', 18000000))
    staffInventoryService.createImportLog.mockRejectedValue(new Error('Server quá tải'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.submit).toBe('Server quá tải')
    expect(result.current.receipt).toBeNull()
  })
})
