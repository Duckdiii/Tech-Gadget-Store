import { useState, useEffect } from 'react'
import { staffInventoryService } from '../services/staffInventoryService'
import { USER_EMAIL_TO_ID, EXPORT_TYPES, today, parseDetails } from '../utils/inventoryHelpers'

const BLANK_ROW = () => ({ productId: '', productVariantId: '', qty: 1 })

export function useStaffExport(user) {
  const [productsList, setProductsList] = useState([])
  const [flatVariants, setFlatVariants] = useState([])
  const [exportType, setExportType] = useState('sale')
  const [recipient,  setRecipient]  = useState('')
  const [date,       setDate]       = useState(() => today())
  const [note,       setNote]       = useState('')
  const [rows,       setRows]       = useState([BLANK_ROW()])
  const [errors,     setErrors]     = useState({})
  const [receipt,    setReceipt]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const userPerfId = user?.id || user?.email || USER_EMAIL_TO_ID[user?.email] || 'user-stf-01'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const rawProducts = await staffInventoryService.getProducts()
        const detailed = await Promise.all(
          (rawProducts.items || []).map(async (p) => {
            try {
              return await staffInventoryService.getProductById(p.id)
            } catch {
              return { ...p, variants: [] }
            }
          })
        )

        let logs = []
        try {
          logs = await staffInventoryService.getWarehouseLogs()
        } catch (e) {
          console.warn('Failed to load warehouse logs', e)
        }

        const exportedCounts = {}
        logs.forEach(log => {
          if (log.type !== 'EXPORT') return
          const { ram, storage, color } = parseDetails(log.productDetails)
          const key = `${log.productName}-${ram}-${storage}-${color}`.toLowerCase()
          exportedCounts[key] = (exportedCounts[key] || 0) + log.quantity
        })

        const list = []
        detailed.forEach(p => {
          const configMap = {}
          p.variants.forEach(v => {
            const configKey = `${v.ramGb || ''}-${v.storageGb || ''}-${v.color || ''}`.toLowerCase()
            if (!configMap[configKey]) {
              configMap[configKey] = {
                id: v.id,
                productId: p.id,
                productName: p.name,
                ramGb: v.ramGb,
                storageGb: v.storageGb,
                color: v.color,
                price: v.price || 0,
                totalUnits: 0,
              }
            }
            configMap[configKey].totalUnits += 1
          })

          Object.values(configMap).forEach(cfg => {
            const matchKey = `${p.name}-${cfg.ramGb || ''}-${cfg.storageGb || ''}-${cfg.color || ''}`.toLowerCase()
            const exported = exportedCounts[matchKey] || 0
            const stock = Math.max(0, cfg.totalUnits - exported)
            list.push({ ...cfg, stock })
          })
        })

        setProductsList(detailed)
        setFlatVariants(list)
      } catch (err) {
        console.error('Failed to load export data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  function addRow() { setRows(r => [...r, BLANK_ROW()]) }
  function removeRow(i) { setRows(r => r.filter((_, idx) => idx !== i)) }
  function updateRow(i, field, val) { setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row)) }

  function getVariantDetails(row) {
    return flatVariants.find(v => v.id === row.productVariantId)
  }

  function stockAfter(row) {
    const v = getVariantDetails(row)
    if (!v) return null
    return v.stock - (Number(row.qty) || 0)
  }

  async function handleSubmit() {
    const currentType = EXPORT_TYPES.find(t => t.id === exportType)
    const e = {}
    if (!recipient.trim()) e.recipient = `Vui lòng nhập ${currentType?.recipientLabel}`

    const validRows = rows.filter(r => r.productVariantId && Number(r.qty) > 0)
    if (validRows.length === 0) e.rows = 'Cần ít nhất 1 sản phẩm'

    validRows.forEach((r, i) => {
      const after = stockAfter(r)
      if (after !== null && after < 0) {
        e[`row_${i}`] = 'Xuất quá số lượng tồn kho khả dụng'
      }
    })

    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    try {
      const payload = {
        performedById: userPerfId,
        reason: `${recipient}; ${note}`,
        items: validRows.map(r => ({
          productVariantId: r.productVariantId,
          quantity: Number(r.qty) || 1,
        }))
      }

      const res = await staffInventoryService.createExportLog(payload)

      setReceipt({
        id: res.id,
        date: new Date(res.exportedAt || res.createdAt).toLocaleDateString('vi-VN'),
        exportType,
        recipient,
        note,
        receiptId: res.receiptId,
        staffName: user?.name || 'Lê Hoàng Dũng',
        rows: validRows.map(r => {
          const v = getVariantDetails(r)
          return {
            ...r,
            displayName: v?.productName,
            specs: `${v?.ramGb ? v.ramGb + 'GB RAM / ' : ''}${v?.storageGb ? v.storageGb + 'GB Storage / ' : ''}${v?.color || ''}`,
            unitPrice: v?.price || 0,
          }
        })
      })
    } catch (err) {
      console.error(err)
      setErrors({ submit: err.message || 'Lỗi hệ thống khi xuất kho' })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setExportType('sale'); setRecipient(''); setDate(today())
    setNote(''); setRows([BLANK_ROW()]); setErrors({}); setReceipt(null)
  }

  return {
    productsList,
    flatVariants,
    exportType, setExportType,
    recipient, setRecipient,
    date, setDate,
    note, setNote,
    rows,
    errors,
    receipt, setReceipt,
    loading,
    submitting,
    addRow,
    removeRow,
    updateRow,
    getVariantDetails,
    stockAfter,
    handleSubmit,
    resetForm,
  }
}
