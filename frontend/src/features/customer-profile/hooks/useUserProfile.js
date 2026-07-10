import { useState, useEffect } from 'react'
import { profileService } from '../services/profileService'
import { orderService } from '../../customer-orders/services/orderService'

export function useUserProfile() {
  const [activeSection, setActiveSection] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [membership, setMembership] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfileAndData = () => {
    setLoading(true)
    Promise.all([
      profileService.getProfile().catch(() => null),
      profileService.getMembership().catch(() => null),
      orderService.getCustomerOrders().catch(() => null),
    ])
      .then(([prof, memb, ords]) => {
        if (prof) setProfile(prof)
        if (memb) setMembership(memb)
        if (ords) setOrders(ords)
      })
      .catch(err => {
        console.error('Error fetching user profile info:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfileAndData()
  }, [])

  return {
    activeSection,
    setActiveSection,
    profile,
    setProfile,
    membership,
    setMembership,
    orders,
    setOrders,
    loading,
    setLoading,
    error,
    refreshData: fetchProfileAndData,
  }
}
