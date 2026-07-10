import { useState, useEffect } from 'react'
import { managerInventoryService } from '../services/managerInventoryService'

function parseDetails(detailsStr) {
  if (!detailsStr) return { ram: '', storage: '', color: '' }
  const parts = detailsStr.split('/').map(s => s.trim())
  let ram = ''
  let storage = ''
  let color = ''
  parts.forEach(p => {
    if (p.toLowerCase().includes('ram')) {
      ram = p.replace(/gb\s*ram/i, '').trim()
    } else if (p.toLowerCase().includes('storage')) {
      storage = p.replace(/gb\s*storage/i, '').trim()
    } else {
      color = p
    }
  })
  return { ram, storage, color }
}

function groupLogs(logs, typeFilter) {
  const filtered = logs.filter(l => l.type === typeFilter)
  const groups = {}
  filtered.forEach(item => {
    if (!groups[item.logId]) {
      const dt = new Date(item.createdTime)
      const dateStr = dt.toLocaleDateString('vi-VN')
      const timeStr = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      groups[item.logId] = {
        id: item.logId,
        date: dateStr,
        time: timeStr,
        supplier: typeFilter === 'IMPORT' ? (item.noteOrReason?.split(';')[0] || 'Nhà cung cấp') : undefined,
        recipient: typeFilter === 'EXPORT' ? (item.noteOrReason?.split(';')[0] || 'Người nhận') : undefined,
        staff: item.performedBy === 'user-stf-01' ? 'Trần Thị Bích' : item.performedBy === 'user-stf-02' ? 'Lê Hoàng Cường' : item.performedBy === 'user-mgr-01' ? 'Nguyễn Văn An' : item.performedBy,
        status: item.status.toLowerCase(),
        note: item.noteOrReason || '',
        items: [],
        total: 0,
      }
    }
    groups[item.logId].items.push({
      name: item.productName,
      sku: item.productDetails || 'N/A',
      qty: item.quantity,
      unitPrice: item.price,
    })
    groups[item.logId].total += item.quantity * item.price
  })
  return Object.values(groups)
}

function buildInventoryProducts(products, logs) {
  const exportedCounts = {}
  logs.filter(l => l.type === 'EXPORT').forEach(log => {
    const { ram, storage, color } = parseDetails(log.productDetails)
    const key = `${log.productName}-${ram}-${storage}-${color}`.toLowerCase()
    exportedCounts[key] = (exportedCounts[key] || 0) + log.quantity
  })

  const list = []
  products.forEach(p => {
    const configMap = {}
    p.variants.forEach(v => {
      const ramStr = v.ramGb ? `${v.ramGb}GB` : ''
      const storageStr = v.storageGb ? `${v.storageGb}GB` : ''
      const configKey = `${v.ramGb || ''}-${v.storageGb || ''}-${v.color || ''}`.toLowerCase()
      if (!configMap[configKey]) {
        configMap[configKey] = {
          id: v.id,
          name: `${p.name} ${ramStr} ${storageStr} ${v.color || ''}`.replace(/\s+/g, ' ').trim(),
          sku: `${p.brandName ? p.brandName.slice(0,3).toUpperCase() : 'GEN'}-${v.id.slice(0,8).toUpperCase()}`,
          category: p.categoryName || 'General',
          price: v.price || 0,
          totalUnits: 0,
          ramGb: v.ramGb,
          storageGb: v.storageGb,
          color: v.color,
          img: p.imageUrl || 'https://placehold.co/48x48/e0e7ff/4f46e5?text=TS',
        }
      }
      configMap[configKey].totalUnits += 1
    })

    const productTotalImported = logs
      .filter(l => l.type === 'IMPORT' && l.productName?.toLowerCase() === p.name?.toLowerCase())
      .reduce((sum, item) => sum + item.quantity, 0)

    Object.values(configMap).forEach(variant => {
      const { ram, storage, color } = parseDetails(`${variant.ramGb}GB / ${variant.storageGb}GB / ${variant.color}`)
      const key = `${p.name}-${ram}-${storage}-${color}`.toLowerCase()
      const variantExported = exportedCounts[key] || 0

      const variantLogs = logs.filter(l => {
        const { ram: lRam, storage: lStorage, color: lColor } = parseDetails(l.productDetails)
        return (
          l.productName?.toLowerCase() === p.name?.toLowerCase() &&
          lRam?.toLowerCase() === ram?.toLowerCase() &&
          lStorage?.toLowerCase() === storage?.toLowerCase() &&
          lColor?.toLowerCase() === color?.toLowerCase()
        )
      })

      const variantImported = variantLogs
        .filter(l => l.type === 'IMPORT')
        .reduce((sum, item) => sum + item.quantity, 0)

      variant.inStock = variantImported - variantExported
      if (variant.inStock < 0) variant.inStock = 0
      variant.stock = variant.inStock
      variant.maxStock = Math.max(100, variant.stock * 2)
      variant.status = variant.stock === 0 ? 'het_hang' : variant.stock <= 5 ? 'sap_het' : 'con_hang'
      variant.faded = variant.stock === 0
      list.push(variant)
    })
  })
  return list
}

export function useInventory() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [productsList, setProductsList] = useState([])
  const [importLogs, setImportLogs] = useState([])
  const [exportLogs, setExportLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const rawProducts = await managerInventoryService.getProducts()
      const detailed = await Promise.all(
        rawProducts.map(async (p) => {
          try {
            return await managerInventoryService.getProductById(p.id)
          } catch {
            return { ...p, variants: [] }
          }
        })
      )

      let logs = []
      try {
        logs = await managerInventoryService.getWarehouseLogs()
      } catch (e) {
        console.warn('Failed to load warehouse logs', e)
      }

      const imports = groupLogs(logs, 'IMPORT')
      const exports = groupLogs(logs, 'EXPORT')
      const liveProducts = buildInventoryProducts(detailed, logs)

      setProductsList(liveProducts)
      setImportLogs(imports)
      setExportLogs(exports)
    } catch (err) {
      console.error('Failed to load inventory', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    activeTab,
    setActiveTab,
    productsList,
    importLogs,
    exportLogs,
    loading,
    loadData,
  }
}
