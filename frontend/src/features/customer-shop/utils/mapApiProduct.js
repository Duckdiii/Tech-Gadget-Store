export function mapApiProduct(p) {
  const minPrice = p.minPrice ? Number(p.minPrice) : 0
  const discountPercent = p.discountPercent ? Number(p.discountPercent) : 0
  const salePrice = discountPercent > 0 ? Math.round(minPrice * (1 - discountPercent / 100)) : minPrice

  return {
    id: p.id,
    variantId: p.variantId ?? null,
    brand: p.brandName ?? '',
    category: p.categoryName ?? '',
    name: p.name,
    price: salePrice,
    originalPrice: discountPercent > 0 ? minPrice : null,
    discountPercent: discountPercent > 0 ? discountPercent : null,
    salesCount: p.salesCount ?? 0,
    rating: p.averageRating ?? null,
    reviews: p.reviewCount ?? null,
    available: (p.availableCount ?? 0) > 0,
    availableCount: p.availableCount ?? 0,
    ram: p.ramGb != null ? `${p.ramGb}GB` : null,
    storage: p.storageGb != null ? `${p.storageGb}GB` : null,
    color: p.color ?? null,
    specSummary: p.specSummary ?? null,
    // null when the product has no real photo yet — ProductCard renders a proper
    // placeholder for this instead of loading an ugly text-on-box image.
    image: p.imageUrl ?? null,
    
    // Details for List view
    cpu: p.cpu ?? null,
    gpu: p.gpu ?? null,
    screenSize: p.screenSize ?? null,
    batteryCapacity: p.batteryCapacity ?? null,
    operatingSystem: p.operatingSystem ?? null,
    chipset: p.chipset ?? null,
    resolution: p.resolution ?? null,
    refreshRate: p.refreshRate ?? null,
    panelType: p.panelType ?? null,
    isWireless: p.isWireless ?? null,
    hasNoiseCancelling: p.hasNoiseCancelling ?? null,
    batteryLifeHours: p.batteryLifeHours ?? null,
    batteryLifeDays: p.batteryLifeDays ?? null,
    hasGps: p.hasGps ?? null,
    isWaterResistant: p.isWaterResistant ?? null,
  }
}
