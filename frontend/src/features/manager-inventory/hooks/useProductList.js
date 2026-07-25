import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { apiFetch } from '../../../services/api'
import { useToast } from '../../../hooks/useToast'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'

function normalizeProduct(dto) {
  return {
    id:             dto.id,
    name:           dto.name || '',
    brandName:      dto.brandName || '',
    categoryName:   dto.categoryName || '',
    minPrice:       dto.minPrice,
    imageUrl:       dto.imageUrl || '',
    hasVariants:    !!dto.hasVariants,
    variantCount:   dto.variantCount ?? 0,
    availableCount: dto.availableCount ?? 0,
  }
}

const PAGE_SIZE = 20

// Danh sách sản phẩm + bộ lọc + KPI + ngừng/kích hoạt kinh doanh cho ProductManagementPage.
export function useProductList() {
  const location = useLocation()
  const [products, setProducts]   = useState([])
  const [brands, setBrands]       = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    if (location.state?.searchKey !== undefined) {
      setSearch(location.state.searchKey)
    }
  }, [location.state])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const brand = searchParams.get('brand')
    const category = searchParams.get('category')
    if (brand) setSelectedBrand(brand)
    if (category) setSelectedCategory(category)
  }, [location.search])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const [discontinueId, setDiscontinueId] = useState(null)
  const [discontinuing, setDiscontinuing] = useState(false)
  const { toast, showToast } = useToast()

  // ── KPI stats ──────────────────────────────────────────────────
  const [stats, setStats]         = useState(null)
  const [activeKpi, setActiveKpi] = useState(null) // null | 'outOfStock' | 'noVariants' | 'noImages'
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'discontinued'

  function reloadStats() { apiFetch('/api/manager/products/stats').then(setStats).catch(() => {}) }

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value)
    setPage(0)
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setPage(0)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSelectedBrand('')
    setSelectedCategory('')
    setActiveKpi(null)
    setPage(0)
  }

  const selectKpi = (key) => {
    if (key === null) { setActiveKpi(null); setPage(0); return }
    setActiveKpi(active => (active === key ? null : key))
    setPage(0)
  }

  const selectTab = (tabId) => {
    setActiveTab(tabId)
    setActiveKpi(null)
    setPage(0)
  }

  const selectChip = (key) => {
    setActiveKpi(active => (active === key && key !== null ? null : key))
    setPage(0)
  }

  const loadProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.append('keyword', debouncedSearch)
    if (selectedBrand) params.append('brandNames', selectedBrand)
    if (selectedCategory) params.append('categoryNames', selectedCategory)
    if (activeKpi) params.append('stockFilter', activeKpi)
    params.append('active', activeTab === 'active' ? 'true' : 'false')
    params.append('page', page)
    params.append('size', PAGE_SIZE)

    apiFetch(`/api/products/filter?${params.toString()}`)
      .then(data => {
        setProducts((data.items || []).map(normalizeProduct))
        setTotalPages(data.totalPages || 0)
        setTotalItems(data.totalItems || 0)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [debouncedSearch, selectedBrand, selectedCategory, activeKpi, activeTab, page])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    apiFetch('/api/manager/brands').then(setBrands).catch(() => {})
    apiFetch('/api/manager/categories').then(setCategories).catch(() => {})
    reloadStats()
  }, [])

  async function handleDiscontinue(id) {
    setDiscontinuing(true)
    try {
      await apiFetch(`/api/manager/products/${id}/discontinue`, { method: 'PATCH' })
      setProducts(p => p.filter(x => x.id !== id))
      setDiscontinueId(null)
      showToast('Đã ngừng kinh doanh sản phẩm')
      reloadStats()
      return id
    } catch (err) {
      showToast(err.message)
    } finally {
      setDiscontinuing(false)
    }
  }

  async function handleReactivate(id) {
    try {
      await apiFetch(`/api/manager/products/${id}/reactivate`, { method: 'PATCH' })
      setProducts(p => p.filter(x => x.id !== id))
      showToast('Đã kích hoạt lại sản phẩm')
      reloadStats()
    } catch (err) {
      showToast(err.message)
    }
  }

  return {
    products,
    brands,
    categories,
    loading,
    error,
    search, setSearch,
    selectedBrand, handleBrandChange,
    selectedCategory, handleCategoryChange,
    page, setPage,
    totalPages,
    totalItems,
    pageSize: PAGE_SIZE,
    handleClearFilters,

    stats,
    activeKpi,
    selectKpi,
    activeTab,
    selectTab,
    selectChip,

    toast,
    showToast,
    reloadStats,
    loadProducts,

    discontinueId, setDiscontinueId,
    discontinuing,
    handleDiscontinue,
    handleReactivate,
  }
}
