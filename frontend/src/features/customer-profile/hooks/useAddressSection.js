import { useState, useEffect } from 'react'
import { profileService } from '../services/profileService'

export function useAddressSection({ profile }) {
  const [addresses, setAddresses] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | { editId }
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const fetchAddresses = () => {
    setLoading(true)
    profileService.getAddresses()
      .then(data => {
        const mapped = data.map(addr => ({
          id: addr.id,
          name: addr.name || profile?.fullName || '',
          phone: addr.phone || profile?.phone || '',
          province: addr.province,
          district: addr.district,
          ward: addr.ward,
          detail: addr.street,
          type: addr.type || 'home',
          isDefault: addr.isDefault,
        }))
        setAddresses(mapped)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAddresses()
  }, [profile])

  const handleSave = async (form) => {
    const payload = {
      street: form.detail,
      ward: form.ward,
      district: form.district,
      province: form.province,
      name: form.name,
      phone: form.phone,
      type: form.type,
      isDefault: form.isDefault,
    }

    try {
      if (modal === 'add') {
        await profileService.addAddress(payload)
        showToast('Thêm địa chỉ thành công!')
      } else {
        await profileService.updateAddress(modal.editId, payload)
        showToast('Cập nhật địa chỉ thành công!')
      }
      fetchAddresses()
      setModal(null)
    } catch (err) {
      alert(err.message || 'Không thể lưu địa chỉ')
    }
  }

  const handleDelete = async (id) => {
    try {
      await profileService.deleteAddress(id)
      showToast('Đã xoá địa chỉ.')
      fetchAddresses()
    } catch (err) {
      alert(err.message || 'Không thể xoá địa chỉ')
    }
    setDeletingId(null)
  }

  const handleSetDefault = async (id) => {
    const target = addresses.find(a => a.id === id)
    if (!target) return
    const payload = {
      street: target.detail,
      ward: target.ward,
      district: target.district,
      province: target.province,
      name: target.name,
      phone: target.phone,
      type: target.type,
      isDefault: true,
    }
    try {
      await profileService.updateAddress(id, payload)
      showToast('Đã đặt làm địa chỉ mặc định!')
      fetchAddresses()
    } catch (err) {
      alert(err.message || 'Không thể đặt địa chỉ mặc định')
    }
  }

  const typeInfo = {
    home: { label: 'Nhà riêng', icon: '🏠', bg: 'bg-teal-50 text-teal-700 border-teal-100' },
    office: { label: 'Văn phòng', icon: '🏢', bg: 'bg-[#E8420A]/5 text-[#E8420A] border-[#E8420A]/10' },
  }

  return {
    addresses,
    modal,
    setModal,
    deletingId,
    setDeletingId,
    toast,
    loading,
    handleSave,
    handleDelete,
    handleSetDefault,
    typeInfo,
    showToast,
    fetchAddresses,
  }
}
