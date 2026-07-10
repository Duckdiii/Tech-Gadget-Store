import { useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'

const EMPTY_FORM = { name: '', type: 'WARRANTY', description: '', price: '', durationMonths: '', active: true }

function normalizeBundleService(dto) {
  return {
    id: dto.id,
    name: dto.name || '',
    type: dto.type || 'WARRANTY',
    description: dto.description || '',
    price: dto.price,
    durationMonths: dto.durationMonths,
    active: !!dto.active,
  }
}

export function useBundleService() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const [panel, setPanel] = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deactivateId, setDeactivateId] = useState(null)
  const [deactivating, setDeactivating] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  function loadAll() {
    setLoading(true)
    settingsService.getBundleServices()
      .then(data => setItems(data.map(normalizeBundleService)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const filtered = items.filter(x => !search || x.name.toLowerCase().includes(search.toLowerCase()))

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setPanel('add')
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      type: item.type,
      description: item.description,
      price: item.price ?? '',
      durationMonths: item.durationMonths ?? '',
      active: item.active,
    })
    setFormErrors({})
    setPanel('edit')
  }

  function closePanel() {
    setPanel(null)
    setEditingId(null)
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên dịch vụ'
    if (!form.description.trim()) errs.description = 'Vui lòng nhập mô tả'
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Vui lòng nhập giá hợp lệ'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setFormErrors(errs)
      return
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      price: Number(form.price),
      durationMonths: form.durationMonths === '' ? null : Number(form.durationMonths),
      active: form.active,
    }

    setSaving(true)
    try {
      if (panel === 'add') {
        const dto = await settingsService.createBundleService(payload)
        setItems(p => [normalizeBundleService(dto), ...p])
        showToast('Đã thêm dịch vụ đi kèm')
      } else {
        const dto = await settingsService.updateBundleService(editingId, payload)
        setItems(p => p.map(x => x.id === editingId ? normalizeBundleService(dto) : x))
        showToast('Đã cập nhật dịch vụ đi kèm')
      }
      closePanel()
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id) {
    setDeactivating(true)
    try {
      await settingsService.deleteBundleService(id)
      setItems(p => p.map(x => x.id === id ? { ...x, active: false } : x))
      setDeactivateId(null)
      showToast('Đã ngừng dịch vụ đi kèm')
    } catch (err) {
      showToast(err.message)
    } finally {
      setDeactivating(false)
    }
  }

  const target = items.find(x => x.id === deactivateId)

  return {
    items,
    loading,
    error,
    search,
    setSearch,
    panel,
    form,
    setForm,
    formErrors,
    saving,
    deactivateId,
    setDeactivateId,
    deactivating,
    toast,
    filtered,
    openAdd,
    openEdit,
    closePanel,
    handleSubmit,
    handleDeactivate,
    target,
  }
}
