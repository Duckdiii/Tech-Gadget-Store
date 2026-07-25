import { useState } from 'react'
import { apiFetch } from '../../../services/api'

const EMPTY_FORM = {
  name: '', description: '', brandId: '', categoryId: '',
  screenSize: '', screenResolution: '', rearCamera: '', frontCamera: '',
  chipset: '', nfcSupported: false, batteryCapacity: '', simType: '', operatingSystem: '',
}

const EMPTY_VARIANT_FORM = { ramGb: '', storageGb: '', color: '', price: '' }
const EMPTY_IMAGE_FORM = { name: '', imageUrl: '' }

// Panel thêm/sửa sản phẩm + quản lý phiên bản & hình ảnh của sản phẩm đang sửa.
// loadProducts/showToast được truyền vào từ useProductList để đồng bộ lại danh sách sau khi lưu.
export function useProductForm({ loadProducts, showToast }) {
  const [panel, setPanel]         = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]       = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)

  const [variants, setVariants]     = useState([])
  const [images, setImages]         = useState([])
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT_FORM)
  const [imageForm, setImageForm]     = useState(EMPTY_IMAGE_FORM)
  const [subError, setSubError]       = useState(null)
  const [subSaving, setSubSaving]     = useState(false)

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setVariants([])
    setImages([])
    setVariantForm(EMPTY_VARIANT_FORM)
    setImageForm(EMPTY_IMAGE_FORM)
    setSubError(null)
    setShowSpecs(false)
    setEditingId(null)
    setPanel('add')
  }

  function applyDetail(detail) {
    setForm({
      name: detail.name || '',
      description: detail.description || '',
      brandId: detail.brandId || '',
      categoryId: detail.categoryId || '',
      screenSize: detail.screenSize ?? '',
      screenResolution: detail.screenResolution || '',
      rearCamera: detail.rearCamera || '',
      frontCamera: detail.frontCamera || '',
      chipset: detail.chipset || '',
      nfcSupported: !!detail.nfcSupported,
      batteryCapacity: detail.batteryCapacity ?? '',
      simType: detail.simType || '',
      operatingSystem: detail.operatingSystem || '',
    })
    setVariants(detail.variants || [])
    setImages(detail.images || [])
  }

  async function openEdit(p) {
    setEditingId(p.id)
    setFormErrors({})
    setVariantForm(EMPTY_VARIANT_FORM)
    setImageForm(EMPTY_IMAGE_FORM)
    setSubError(null)
    setShowSpecs(false)
    setPanel('edit')
    try {
      const detail = await apiFetch(`/api/products/${p.id}`)
      applyDetail(detail)
    } catch (err) {
      showToast(err.message)
      closePanel()
    }
  }

  function closePanel() {
    setPanel(null)
    setEditingId(null)
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      brandId: form.brandId,
      categoryId: form.categoryId,
      screenSize: form.screenSize === '' ? null : Number(form.screenSize),
      screenResolution: form.screenResolution.trim() || null,
      rearCamera: form.rearCamera.trim() || null,
      frontCamera: form.frontCamera.trim() || null,
      chipset: form.chipset.trim() || null,
      nfcSupported: form.nfcSupported,
      batteryCapacity: form.batteryCapacity === '' ? null : Number(form.batteryCapacity),
      simType: form.simType.trim() || null,
      operatingSystem: form.operatingSystem.trim() || null,
    }
  }

  function validateBasic() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm'
    if (!form.brandId) errs.brandId = 'Vui lòng chọn thương hiệu'
    if (!form.categoryId) errs.categoryId = 'Vui lòng chọn danh mục'
    return errs
  }

  async function handleAdd() {
    const errs = validateBasic()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const dto = await apiFetch('/api/manager/products', { method: 'POST', body: JSON.stringify(buildPayload()) })
      showToast('Đã thêm sản phẩm mới')
      loadProducts()
      setEditingId(dto.id)
      applyDetail(dto)
      setPanel('edit')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    const errs = validateBasic()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const dto = await apiFetch(`/api/manager/products/${editingId}`, { method: 'PUT', body: JSON.stringify(buildPayload()) })
      applyDetail(dto)
      loadProducts()
      showToast('Đã cập nhật sản phẩm')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddVariant() {
    if (!variantForm.ramGb || !variantForm.storageGb || !variantForm.color.trim() || !variantForm.price) {
      setSubError('Vui lòng điền đầy đủ thông tin phiên bản')
      return
    }
    setSubSaving(true)
    setSubError(null)
    try {
      const payload = {
        ramGb: Number(variantForm.ramGb),
        storageGb: Number(variantForm.storageGb),
        color: variantForm.color.trim(),
        price: Number(variantForm.price),
      }
      const dto = await apiFetch(`/api/manager/products/${editingId}/variants`, { method: 'POST', body: JSON.stringify(payload) })
      setVariants(v => [...v, dto])
      setVariantForm(EMPTY_VARIANT_FORM)
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    } finally {
      setSubSaving(false)
    }
  }

  async function handleRemoveVariant(variantId) {
    setSubError(null)
    try {
      await apiFetch(`/api/manager/products/${editingId}/variants/${variantId}`, { method: 'DELETE' })
      setVariants(v => v.filter(x => x.id !== variantId))
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    }
  }

  async function handleAddImage() {
    if (!imageForm.imageUrl.trim()) {
      setSubError('Vui lòng nhập URL ảnh')
      return
    }
    setSubSaving(true)
    setSubError(null)
    try {
      const payload = { name: imageForm.name.trim() || null, imageUrl: imageForm.imageUrl.trim() }
      const dto = await apiFetch(`/api/manager/products/${editingId}/images`, { method: 'POST', body: JSON.stringify(payload) })
      setImages(i => [...i, dto])
      setImageForm(EMPTY_IMAGE_FORM)
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    } finally {
      setSubSaving(false)
    }
  }

  async function handleRemoveImage(imageId) {
    setSubError(null)
    try {
      await apiFetch(`/api/manager/products/${editingId}/images/${imageId}`, { method: 'DELETE' })
      setImages(i => i.filter(x => x.id !== imageId))
      loadProducts()
    } catch (err) {
      setSubError(err.message)
    }
  }

  return {
    panel,
    panelOpen: panel === 'add' || panel === 'edit',
    editingId,
    form, setForm,
    formErrors,
    saving,
    showSpecs, setShowSpecs,

    variants,
    images,
    variantForm, setVariantForm,
    imageForm, setImageForm,
    subError,
    subSaving,

    openAdd,
    openEdit,
    closePanel,
    handleAdd,
    handleSaveEdit,
    handleAddVariant,
    handleRemoveVariant,
    handleAddImage,
    handleRemoveImage,
  }
}
