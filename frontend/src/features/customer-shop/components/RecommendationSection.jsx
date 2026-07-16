import { useRef, useState, useEffect, useCallback } from 'react'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

const CARD_WIDTH = 280
const CARD_GAP = 20

export default function RecommendationSection({ title, products, loading, onNavigate, hideTitle = false }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
  }, [products, updateScrollState])

  const scrollByAmount = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * (CARD_WIDTH + CARD_GAP) * 2, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className="mt-10">
        {!hideTitle && <h2 className="text-lg font-black mb-4" style={{ color: 'var(--t1)' }}>{title}</h2>}
        <div className="flex gap-5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0" style={{ width: CARD_WIDTH }}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="mt-10 rec-scroll-wrap relative">
      {!hideTitle && <h2 className="text-lg font-black mb-4" style={{ color: 'var(--t1)' }}>{title}</h2>}

      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount(-1)}
          aria-label="Cuộn sang trái"
          className="rec-arrow"
          style={{
            position: 'absolute', left: '-16px', top: '58%', zIndex: 10,
            width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'var(--card)', border: '1px solid var(--b1)', color: 'var(--t1)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollByAmount(1)}
          aria-label="Cuộn sang phải"
          className="rec-arrow"
          style={{
            position: 'absolute', right: '-16px', top: '58%', zIndex: 10,
            width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'var(--card)', border: '1px solid var(--b1)', color: 'var(--t1)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="scroll-x flex gap-5"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {products.map(p => (
          <div key={p.id} className="shrink-0" style={{ width: CARD_WIDTH, scrollSnapAlign: 'start' }}>
            <ProductCard product={p} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </section>
  )
}
