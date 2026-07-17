import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../../services/api'

// Nhóm warehouse logs để hiện ở tab Nhật ký nhập/xuất
function groupLogs(logs, typeFilter) {
  const filtered = logs.filter(l => l.type === typeFilter)
  const groups = {}
  filtered.forEach(item => {
    if (!groups[item.logId]) {
      const dt = new Date(item.createdTime)
      groups[item.logId] = {
        id: item.logId,
        date: dt.toLocaleDateString('vi-VN'),
        time: dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        supplier:  typeFilter === 'IMPORT' ? (item.noteOrReason?.split(';')[0] || 'Nhà cung cấp') : undefined,
        recipient: typeFilter === 'EXPORT' ? (item.noteOrReason?.split(';')[0] || 'Người nhận')   : undefined,
        staff: item.performedBy,
        status: item.status?.toLowerCase(),
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

// Chuyển ProductResponseDto (từ /api/products/filter) sang shape cho InventoryTab
function normalizeProduct(p) {
  const stock = p.availableCount ?? 0
  const status = stock === 0 ? 'het_hang' : stock <= 5 ? 'sap_het' : 'con_hang'
  return {
    id: p.id,
    name: p.name,
    category: p.categoryName || 'General',
    price: Number(p.minPrice) || 0,
    stock,
    maxStock: Math.max(50, stock * 2),
    status,
    faded: stock === 0,
    img: p.imageUrl || 'https://placehold.co/48x48/e0e7ff/4f46e5?text=TS',
  }
}

const PAGE_SIZE = 20

export function useInventory() {
  const [activeTab, setActiveTab] = useState('inventory')

  // ── Tồn kho ──────────────────────────────────────────
  const [productsList,   setProductsList]  = useState([])
  const [totalItems,     setTotalItems]    = useState(0)
  const [totalPages,     setTotalPages]    = useState(0)
  const [page,           setPage]          = useState(0)
  const [search,         setSearch]        = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter,   setStatusFilter]  = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)

  // ── Logs ──────────────────────────────────────────────
  const [importLogs, setImportLogs] = useState([])
  const [exportLogs, setExportLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Tải sản phẩm — 1 request duy nhất từ /api/products/filter
  const loadProducts = useCallback(() => {
    setLoadingProducts(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.append('keyword', debouncedSearch)
    params.append('page', page)
    params.append('size', PAGE_SIZE)

    apiFetch(`/api/products/filter?${params.toString()}`)
      .then(data => {
        setProductsList((data.items || []).map(normalizeProduct))
        setTotalItems(data.totalItems || 0)
        setTotalPages(data.totalPages || 0)
      })
      .catch(err => console.error('Failed to load inventory products', err))
      .finally(() => setLoadingProducts(false))
  }, [debouncedSearch, page])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Tải logs (chỉ khi chuyển sang tab nhật ký lần đầu)
  const loadLogs = useCallback(() => {
    if (importLogs.length > 0 || exportLogs.length > 0) return // đã có rồi
    setLoadingLogs(true)
    apiFetch('/api/manager/warehouse-logs')
      .then(logs => {
        setImportLogs(groupLogs(logs, 'IMPORT'))
        setExportLogs(groupLogs(logs, 'EXPORT'))
      })
      .catch(err => console.warn('Failed to load warehouse logs', err))
      .finally(() => setLoadingLogs(false))
  }, [importLogs.length, exportLogs.length])

  useEffect(() => {
    if (activeTab === 'import' || activeTab === 'export') {
      loadLogs()
    }
  }, [activeTab, loadLogs])

  // Lọc theo trạng thái kho (client-side, đã có data theo trang)
  const filteredProducts = statusFilter
    ? productsList.filter(p => p.status === statusFilter)
    : productsList

  return {
    activeTab,
    setActiveTab,

    // Tồn kho
    productsList: filteredProducts,
    totalItems,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loadingProducts,
    pageSize: PAGE_SIZE,

    // Logs
    importLogs,
    exportLogs,
    loadingLogs,

    // compat
    loading: loadingProducts,
  }
}
