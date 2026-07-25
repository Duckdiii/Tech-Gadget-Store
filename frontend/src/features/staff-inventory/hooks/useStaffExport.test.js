import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStaffExport } from './useStaffExport'
import { staffInventoryService } from '../services/staffInventoryService'

vi.mock('../services/staffInventoryService', () => ({
  staffInventoryService: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    getWarehouseLogs: vi.fn(),
    createExportLog: vi.fn(),
  },
}))

const USER = { email: 'bich.tran@techstore.vn', name: 'Trần Thị Bích' } // → user-stf-01

const RAW_PRODUCTS = { items: [{ id: 'p1', name: 'iPhone 15' }] }
// 3 "đơn vị" biến thể: 2 cái cùng cấu hình Đen (đếm theo totalUnits), 1 cái Trắng.
const DETAILED_PRODUCT = {
  id: 'p1', name: 'iPhone 15',
  variants: [
    { id: 'v1', ramGb: 8, storageGb: 128, color: 'Đen', price: 20000000 },
    { id: 'v2', ramGb: 8, storageGb: 128, color: 'Đen', price: 20000000 },
    { id: 'v3', ramGb: 8, storageGb: 256, color: 'Trắng', price: 22000000 },
  ],
}
// 1 log xuất đã trừ đi 1 đơn vị màu Đen
const LOGS = [
  { type: 'EXPORT', productName: 'iPhone 15', productDetails: '8GB RAM / 128GB Storage / Đen', quantity: 1 },
]

function mockService() {
  staffInventoryService.getProducts.mockResolvedValue(RAW_PRODUCTS)
  staffInventoryService.getProductById.mockResolvedValue(DETAILED_PRODUCT)
  staffInventoryService.getWarehouseLogs.mockResolvedValue(LOGS)
}

async function setupWithData() {
  mockService()
  const { result } = renderHook(() => useStaffExport(USER))
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStaffExport', () => {
  it('tính đúng stock khả dụng = tổng đơn vị theo cấu hình - số đã xuất trong log', async () => {
    const result = await setupWithData()

    const den = result.current.flatVariants.find((v) => v.color === 'Đen')
    const trang = result.current.flatVariants.find((v) => v.color === 'Trắng')
    expect(den.stock).toBe(1) // 2 đơn vị - 1 đã xuất
    expect(trang.stock).toBe(1) // 1 đơn vị - 0 đã xuất
  })

  it('validate: báo lỗi khi thiếu tên người nhận (nhãn theo loại xuất)', async () => {
    const result = await setupWithData()

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.recipient).toBe('Vui lòng nhập Khách hàng') // exportType mặc định 'sale'
    expect(staffInventoryService.createExportLog).not.toHaveBeenCalled()
  })

  it('validate: báo lỗi khi chưa có dòng sản phẩm hợp lệ nào', async () => {
    const result = await setupWithData()
    act(() => result.current.setRecipient('Khách A'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.rows).toBe('Cần ít nhất 1 sản phẩm')
  })

  it('validate: báo lỗi khi số lượng xuất vượt tồn kho khả dụng', async () => {
    const result = await setupWithData()
    const den = result.current.flatVariants.find((v) => v.color === 'Đen') // stock = 1
    act(() => result.current.setRecipient('Khách A'))
    act(() => result.current.updateRow(0, 'productVariantId', den.id))
    act(() => result.current.updateRow(0, 'qty', 5))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.row_0).toBe('Xuất quá số lượng tồn kho khả dụng')
    expect(staffInventoryService.createExportLog).not.toHaveBeenCalled()
  })

  it('submit thành công: gọi API đúng payload và tạo phiếu xuất', async () => {
    const result = await setupWithData()
    const den = result.current.flatVariants.find((v) => v.color === 'Đen')
    act(() => result.current.setRecipient('Khách A'))
    act(() => result.current.updateRow(0, 'productVariantId', den.id))
    act(() => result.current.updateRow(0, 'qty', 1))
    staffInventoryService.createExportLog.mockResolvedValue({
      id: 'exp-1', receiptId: 'RC-001', exportedAt: '2026-01-01T00:00:00Z',
    })

    await act(async () => { await result.current.handleSubmit() })

    expect(staffInventoryService.createExportLog).toHaveBeenCalledWith({
      performedById: 'user-stf-01',
      reason: 'Khách A; ',
      items: [{ productVariantId: den.id, quantity: 1 }],
    })
    expect(result.current.receipt.id).toBe('exp-1')
    expect(result.current.receipt.staffName).toBe('Trần Thị Bích')
  })

  it('submit thất bại: set errors.submit và không tạo phiếu', async () => {
    const result = await setupWithData()
    const den = result.current.flatVariants.find((v) => v.color === 'Đen')
    act(() => result.current.setRecipient('Khách A'))
    act(() => result.current.updateRow(0, 'productVariantId', den.id))
    act(() => result.current.updateRow(0, 'qty', 1))
    staffInventoryService.createExportLog.mockRejectedValue(new Error('Lỗi kết nối'))

    await act(async () => { await result.current.handleSubmit() })

    expect(result.current.errors.submit).toBe('Lỗi kết nối')
    expect(result.current.receipt).toBeNull()
  })
})
