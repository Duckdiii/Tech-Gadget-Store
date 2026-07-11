import ProductCard from './ProductCard'

export default function RecommendationSection({ title, products, loading, onNavigate }) {
  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-black mb-4" style={{ color: 'var(--t1)' }}>{title}</h2>
        <div className="grid grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px' }} />
          ))}
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-black mb-4" style={{ color: 'var(--t1)' }}>{title}</h2>
      <div className="grid grid-cols-4 gap-5">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  )
}
