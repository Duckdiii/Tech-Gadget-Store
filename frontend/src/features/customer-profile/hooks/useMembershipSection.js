import { useState, useEffect } from 'react'
import { profileService } from '../services/profileService'

export function useMembershipSection() {
  const [data, setData] = useState(null)
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      profileService.getMembership().catch(err => { throw err }),
      profileService.getMembershipTiers().catch(err => { throw err }),
    ])
      .then(([membership, tierList]) => {
        setData(membership)
        setTiers(tierList)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return {
    data,
    tiers,
    loading,
    error,
  }
}
