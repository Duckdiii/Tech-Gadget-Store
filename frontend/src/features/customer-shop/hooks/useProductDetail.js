import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNav } from '../../../hooks/useNav'
import { shopService } from '../services/shopService'

export function useProductDetail() {
  const onNavigate = useNav()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('id')

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Variant States
  const [selectedRam, setSelectedRam] = useState(null)
  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return
      try {
        setLoading(true)
        const data = await shopService.getProductById(productId)
        setProduct(data)

        // Initialize variant options
        if (data.variants && data.variants.length > 0) {
          const first = data.variants[0]
          setSelectedRam(first.ramGb)
          setSelectedStorage(first.storageGb)
          setSelectedColor(first.color)
          setSelectedVariant(first)
        }
      } catch (e) {
        console.error('Lỗi tải thông tin sản phẩm:', e)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  // Recalculate selected variant when selections change
  useEffect(() => {
    if (!product || !product.variants) return
    const match = product.variants.find((v) =>
      (!selectedRam || v.ramGb === selectedRam) &&
      (!selectedStorage || v.storageGb === selectedStorage) &&
      (!selectedColor || v.color === selectedColor)
    )
    setSelectedVariant(match || null)
  }, [selectedRam, selectedStorage, selectedColor, product])

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setAdding(true)
    try {
      await shopService.addCartItem(selectedVariant.id, 1)
      showToast('Đã thêm vào giỏ hàng')
    } catch (e) {
      alert('Lỗi thêm vào giỏ hàng: ' + e.message)
    } finally {
      setAdding(false)
    }
  }

  return {
    productId,
    product,
    loading,
    selectedRam,
    setSelectedRam,
    selectedStorage,
    setSelectedStorage,
    selectedColor,
    setSelectedColor,
    selectedVariant,
    adding,
    toast,
    handleAddToCart,
    onNavigate,
  }
}
