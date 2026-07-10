import { useState, useEffect } from 'react'
import { staffInventoryService } from '../services/staffInventoryService'
import { STAFF_NAMES } from '../utils/inventoryHelpers'

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
        staff: STAFF_NAMES[item.performedBy] || item.performedBy,
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

export function useStaffLogs() {
  const [activeTab, setActiveTab] = useState('import')
  const [search, setSearch] = useState('')
  const [viewLog, setViewLog] = useState(null)
  const [importLogs, setImportLogs] = useState([])
  const [exportLogs, setExportLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true)
        const logs = await staffInventoryService.getWarehouseLogs()
        setImportLogs(groupLogs(logs, 'IMPORT'))
        setExportLogs(groupLogs(logs, 'EXPORT'))
      } catch (err) {
        console.error('Failed to load logs history', err)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  const q = search.toLowerCase()
  const importFiltered = importLogs.filter(l => !q || l.id.toLowerCase().includes(q) || l.supplier?.toLowerCase().includes(q))
  const exportFiltered = exportLogs.filter(l => !q || l.id.toLowerCase().includes(q) || l.recipient?.toLowerCase().includes(q))

  return {
    activeTab, setActiveTab,
    search, setSearch,
    viewLog, setViewLog,
    loading,
    importFiltered,
    exportFiltered,
  }
}
