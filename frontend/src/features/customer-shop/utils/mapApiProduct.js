export function mapApiProduct(p) {
  const nameSlug = encodeURIComponent(p.name.replace(/\s+/g, '+'))
  return {
    id: p.id,
    brand: p.brandName ?? '',
    name: p.name,
    price: p.minPrice ? Number(p.minPrice) : 0,
    originalPrice: p.minPrice ? Number(p.minPrice) * 1.12 : null, // Mock original price for styling discount
    available: p.hasVariants,
    discount: p.hasVariants ? 12 : null, // Mock discount percentage
    rating: 4.8, // Mock rating
    reviews: 142, // Mock reviews count
    ram: p.ramGb != null ? `${p.ramGb}GB` : null,
    storage: p.storageGb != null ? `${p.storageGb}GB` : null,
    color: p.color ?? null,
    tag: p.hasVariants ? 'Mới' : null,
    image: p.imageUrl ?? `https://placehold.co/300x300/EEF1F9/96A3BC?text=${nameSlug}`,
  }
}
