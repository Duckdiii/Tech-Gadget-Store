import { useState, useEffect, useCallback } from 'react'
import { systemConfigService } from '../services/systemConfigService'

const EMPTY_FORM = { storeName: '', contactEmail: '', contactPhone: '', address: '' }

function toForm(dto) {
  return {
    storeName: dto.storeName || '',
    contactEmail: dto.contactEmail || '',
    contactPhone: dto.contactPhone || '',
    address: dto.address || '',
  }
}

export function useSystemConfig() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [allowReview, setAllowReview] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  const loadSettings = useCallback(() => {
    setLoading(true)
    setError('')
    return systemConfigService.getSettings()
      .then((dto) => {
        setForm(toForm(dto))
        setAllowReview(!!dto.allowProductReviews)
      })
      .catch((e) => setError(e.message || 'Không tải được cấu hình.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const dto = await systemConfigService.updateSettings({
        storeName: form.storeName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: form.address,
        allowProductReviews: allowReview,
      })
      setForm(toForm(dto))
      setAllowReview(!!dto.allowProductReviews)
      setSavedAt(new Date())
    } catch (e) {
      setError(e.message || 'Lưu thay đổi thất bại.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    loadSettings()
  }

  return {
    form,
    handleChange,
    allowReview,
    setAllowReview,
    loading,
    saving,
    error,
    savedAt,
    handleSave,
    handleCancel,
  }
}
