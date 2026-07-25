import { useState, useEffect } from 'react'
import { profileService } from '../services/profileService'

// original/discount cần dữ liệu khuyến mãi thật từ backend — API /api/customer/favorites
// hiện chưa trả về (không có discountPercent/originalPrice), nên item.original luôn undefined
// và hàm này luôn trả 0. Không tự bịa ra "giá gốc" giả để tránh hiển thị khuyến mãi không có thật.
function getDiscount(item) {
  return item.original ? Math.round((1 - item.price / item.original) * 100) : 0
}

export function useWishlistSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('grid')
  const [toast, setToast] = useState('')
  const [removing, setRemoving] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const fetchFavorites = () => {
    setLoading(true)
    profileService.getFavorites()
      .then(data => {
        setItems(data.items || [])
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const removeItem = async (productId) => {
    setRemoving(productId)
    try {
      await profileService.toggleFavorite(productId)
      showToast('Đã xóa khỏi danh sách yêu thích')
      fetchFavorites()
    } catch (err) {
      alert(err.message || 'Không thể xóa sản phẩm yêu thích')
    }
    setRemoving(null)
  }

  const mappedItems = items.map(item => ({
    id: item.productId,
    productId: item.productId,
    name: `${item.productName} ${item.ramGb ? `(${item.ramGb}GB RAM / ${item.storageGb}GB)` : ''}`,
    brand: 'TechGadget',
    category: 'Sản phẩm',
    price: item.price || 0,
    // Không có discountPercent/originalPrice thật từ API — không set field `original` ở đây
    // thay vì bịa ra "giá gốc" giả (trước đây là price * 1.15, luôn ra ~13% giảm giá cho MỌI
    // sản phẩm). getDiscount() và UI (WishlistSection.jsx) đã tự xử lý đúng khi thiếu field này.
    stock: 'in_stock',
    rating: 4.8,
    reviews: 124,
    imageUrl: item.imageUrl,
  }))

  const sorted = mappedItems.toSorted((a, b) => {
    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'discount') return getDiscount(b) - getDiscount(a)
    return 1
  })

  return {
    items,
    loading,
    sort,
    setSort,
    view,
    setView,
    toast,
    removing,
    removeItem,
    sorted,
    getDiscount,
    showToast,
  }
}
