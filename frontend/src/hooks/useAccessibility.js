import { useState, useEffect } from 'react'

export function useAccessibility() {
  const [dark, setDark] = useState(() => localStorage.getItem('a11y-dark') === 'true')
  const [font, setFont] = useState(() => localStorage.getItem('a11y-font') || 'md')
  const [noMotion, setNoMotion] = useState(() => localStorage.getItem('a11y-motion') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('a11y-dark', dark)
  }, [dark])

  useEffect(() => {
    document.documentElement.setAttribute('data-font', font)
    localStorage.setItem('a11y-font', font)
  }, [font])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', noMotion)
    localStorage.setItem('a11y-motion', noMotion)
  }, [noMotion])

  return { dark, setDark, font, setFont, noMotion, setNoMotion }
}
