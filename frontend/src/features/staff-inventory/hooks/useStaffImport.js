import { useState, useEffect } from 'react'
import { managerInventoryService } from '../../manager-inventory/services/managerInventoryService'

const WAREHOUSES = ['Kho trung tâm', 'Kho chi nhánh Q1', 'Kho chi nhánh Q7', 'Kho phụ B']

const USER_EMAIL_TO_ID = {
  'nguyenducduy@gmail.com': 'user-mgr-01',
  'bich.tran@techstore.vn': 'user-stf-01',
  'cuong.le@techstore.vn': 'user-stf-02',
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const BLANK_ROW = () => ({
  isNewProduct: false,
  productId: '',
  productVariantId: '',
  qty: '',
  unitPrice: '',
  displayName: '',
  variantName: '',
  // For new products
  newName: '',
  newDescription: '',
  newBrandId: 'brand-apple',
  newCategoryId: 'cat-phone',
  newRamGb: '',
  newStorageGb: '',
  newColor: '',
  newPrice: '',
})

export function useStaffImport(user) {
  const [productsList, setProductsList] = useState([])
  const [supplier, setSupplier] = useState('')
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0])
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [rows, setRows] = useState([BLANK_ROW()])
  const [errors, setErrors] = useState({})
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const userPerfId = USER_EMAIL_TO_ID[user?.email] || 'user-stf-01'

  const loadProducts = async () => {
    try {
      setLoading(true)
      const raw = await managerInventoryService.getProducts()
      const detailed = await Promise.all(
        raw.map(async (p) => {
          try {
            return await managerInventoryService.getProductById(p.id)
          } catch {
            return { ...p, variants: [] }
          }
        })
      )
      setProductsList(detailed)
    } catch (err) {
      console.error('Failed to load products list', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function addRow() {
    setRows(r => [...r, BLANK_ROW()])
  }

  function removeRow(i) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  function updateRow(i, field, val) {
    setRows(r =>
      r.map((row, idx) => {
        if (idx !== i) return row
        const next = { ...row, [field]: val }

        // Auto-set prices if existing product/variant is selected
        if (field === 'productId') {
          next.productVariantId = ''
        }
        if (field === 'productVariantId') {
          const prod = productsList.find(p => p.id === row.productId)
          const variant = prod?.variants?.find(v => v.id === val)
          if (variant) {
            next.unitPrice = variant.price || 0
            next.displayName = prod.name
            const specs = `${variant.ramGb ? variant.ramGb + 'GB RAM / ' : ''}${variant.storageGb ? variant.storageGb + 'GB Storage / ' : ''}${variant.color || ''}`
            next.specs = specs
            next.variantName = specs
          }
        }
        return next
      })
    )
  }

  const validate = () => {
    const errs = {}
    if (!supplier.trim()) errs.supplier = 'Vui lòng điền tên nhà cung cấp'
    if (!date) errs.date = 'Vui lòng chọn ngày nhập'

    const rowErrs = {}
    rows.forEach((r, idx) => {
      if (r.isNewProduct) {
        if (!r.newName.trim()) rowErrs[`${idx}_newName`] = 'Thiếu tên sản phẩm'
        if (r.newPrice === '' || Number(r.newPrice) <= 0) rowErrs[`${idx}_newPrice`] = 'Giá không hợp lệ'
        if (r.qty === '' || Number(r.qty) <= 0) rowErrs[`${idx}_qty`] = 'Số lượng > 0'
        if (r.unitPrice === '' || Number(r.unitPrice) < 0) rowErrs[`${idx}_unitPrice`] = 'Giá nhập >= 0'
      } else {
        if (!r.productId) rowErrs[`${idx}_productId`] = 'Chưa chọn sản phẩm'
        if (!r.productVariantId) rowErrs[`${idx}_productVariantId`] = 'Chưa chọn phiên bản'
        if (r.qty === '' || Number(r.qty) <= 0) rowErrs[`${idx}_qty`] = 'Số lượng > 0'
        if (r.unitPrice === '' || Number(r.unitPrice) < 0) rowErrs[`${idx}_unitPrice`] = 'Giá nhập >= 0'
      }
    })

    if (Object.keys(rowErrs).length) errs.rows = rowErrs
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})

    setSubmitting(true)
    try {
      const validRows = rows.map((r) => {
        if (r.isNewProduct) {
          const specs = `${r.newRamGb ? r.newRamGb + 'GB RAM / ' : ''}${r.newStorageGb ? r.newStorageGb + 'GB Storage / ' : ''}${r.newColor || ''}`
          return {
            ...r,
            displayName: r.newName.trim(),
            variantName: specs,
            specs: specs,
          }
        } else {
          return r
        }
      })

      const payload = {
        supplierName: supplier.trim(),
        warehouseName: warehouse,
        noteOrReason: `${supplier.trim()}; ${note.trim()}`,
        performedBy: userPerfId,
        items: validRows.map((r) => {
          if (r.isNewProduct) {
            return {
              newProduct: {
                name: r.newName.trim(),
                description: r.newDescription.trim() || 'Nhập kho sản phẩm mới',
                brandId: r.newBrandId,
                categoryId: r.newCategoryId,
                ramGb: Number(r.newRamGb) || null,
                storageGb: Number(r.newStorageGb) || null,
                color: r.newColor.trim(),
                price: Number(r.newPrice) || 0,
              },
              quantity: Number(r.qty) || 1,
              importPrice: Number(r.unitPrice) || 0,
            }
          } else {
            return {
              productVariantId: r.productVariantId,
              quantity: Number(r.qty) || 1,
              importPrice: Number(r.unitPrice) || 0,
            }
          }
        }),
      }

      const res = await managerInventoryService.createImportLog(payload)

      setReceipt({
        id: res.id,
        date: new Date(res.importedAt || res.createdAt).toLocaleDateString('vi-VN'),
        supplier,
        warehouse,
        note,
        staffName: user?.name || 'Lê Hoàng Dũng',
        rows: validRows,
      })
    } catch (err) {
      console.error(err)
      setErrors({ submit: err.message || 'Lỗi hệ thống khi nhập kho' })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSupplier('')
    setWarehouse(WAREHOUSES[0])
    setDate(today())
    setNote('')
    setRows([BLANK_ROW()])
    setErrors({})
    setReceipt(null)
  }

  return {
    productsList,
    supplier,
    setSupplier,
    warehouse,
    setWarehouse,
    date,
    setDate,
    note,
    setNote,
    rows,
    errors,
    receipt,
    setReceipt,
    loading,
    submitting,
    addRow,
    removeRow,
    updateRow,
    handleSubmit,
    resetForm,
  }
}
