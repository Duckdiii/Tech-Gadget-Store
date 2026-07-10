import { useState, useEffect } from 'react'
import { useNav } from '../../../hooks/useNav'
import { shopService } from '../services/shopService'

export function useCart() {
  const onNavigate = useNav()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const cartData = await shopService.getCart()
      if (cartData && cartData.items) {
        const itemsWithBundles = await Promise.all(
          cartData.items.map(async (item) => {
            let availableBundles = []
            try {
              availableBundles = await shopService.getCartItemBundles(item.cartItemId)
            } catch (e) {
              console.warn(`Lỗi tải dịch vụ cho item ${item.cartItemId}:`, e)
            }

            const selectedBundleIds = new Set((item.bundleServices || []).map((b) => b.id))
            const bundles = (availableBundles || []).map((b) => ({
              id: b.id,
              label: b.name,
              price: b.price,
              checked: selectedBundleIds.has(b.id),
            }))

            return {
              id: item.cartItemId,
              brand: 'TechStore',
              name: item.productName,
              variant: item.variantName,
              price: item.unitPrice,
              originalPrice: item.unitPrice * 1.12,
              qty: item.quantity,
              image: `https://placehold.co/120x100/EEF1F9/96A3BC?text=${encodeURIComponent(
                item.productName || 'Product'
              )}`,
              checked: true,
              bundles: bundles,
              rawItem: item,
            }
          })
        )
        setItems(itemsWithBundles)
      } else {
        setItems([])
      }
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const allChecked = items.length > 0 && items.every((i) => i.checked)
  const someChecked = items.some((i) => i.checked)
  const checkedItems = items.filter((i) => i.checked)
  const totalQty = checkedItems.reduce((s, i) => s + i.qty, 0)
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const serviceFee = checkedItems.reduce(
    (s, i) => s + i.bundles.filter((b) => b.checked).reduce((bs, b) => bs + b.price, 0) * i.qty,
    0
  )
  const grandTotal = subtotal + serviceFee

  const toggleAll = () => setItems((prev) => prev.map((i) => ({ ...i, checked: !allChecked })))
  const toggleItem = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))

  const toggleBundle = async (itemId, bundleId) => {
    const targetItem = items.find((i) => i.id === itemId)
    if (!targetItem) return

    const updatedBundles = targetItem.bundles.map((b) =>
      b.id === bundleId ? { ...b, checked: !b.checked } : b
    )
    const selectedBundleIds = updatedBundles.filter((b) => b.checked).map((b) => b.id)

    try {
      await shopService.updateCartItemBundles(itemId, selectedBundleIds)
      await fetchCart()
    } catch (e) {
      console.error('Lỗi cập nhật dịch vụ:', e)
    }
  }

  const changeQty = async (id, qty) => {
    try {
      await shopService.updateCartItemQuantity(id, qty)
      await fetchCart()
    } catch (e) {
      console.error('Lỗi cập nhật số lượng:', e)
    }
  }

  const removeItem = async (id) => {
    try {
      await shopService.deleteCartItem(id)
      await fetchCart()
    } catch (e) {
      console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', e)
    }
  }

  const removeCheckedItems = async () => {
    const checkedIds = checkedItems.map((i) => i.id)
    try {
      await Promise.all(checkedIds.map((id) => shopService.deleteCartItem(id)))
      await fetchCart()
    } catch (e) {
      console.error('Lỗi xóa các sản phẩm chọn:', e)
    }
  }

  return {
    items,
    loading,
    allChecked,
    someChecked,
    checkedItems,
    totalQty,
    subtotal,
    serviceFee,
    grandTotal,
    toggleAll,
    toggleItem,
    toggleBundle,
    changeQty,
    removeItem,
    removeCheckedItems,
    onNavigate,
  }
}
