export function mapApiProduct(p) {
  return {
    id: p.id,
    brand: p.brandName ?? '',
    category: p.categoryName ?? '',
    name: p.name,
    price: p.minPrice ? Number(p.minPrice) : 0,
    available: p.hasVariants,
    ram: p.ramGb != null ? `${p.ramGb}GB` : null,
    storage: p.storageGb != null ? `${p.storageGb}GB` : null,
    color: p.color ?? null,
    // null when the product has no real photo yet — ProductCard renders a proper
    // placeholder for this instead of loading an ugly text-on-box image.
    image: p.imageUrl ?? null,
  }
}
