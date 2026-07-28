export class ProductDetailPage {
  constructor(page) {
    this.page = page
    // Nút đích thực dùng chung aria-label="Thao tác" với hàng chục nút khác trên trang (tab,
    // breadcrumb, thumbnail...) nên không unique — phải chọn theo text hiển thị thay vì role+name.
    this.addToCartButton = page.getByText('Thêm vào giỏ hàng', { exact: true })
    // Toast "Đã thêm vào giỏ hàng" chỉ render SAU KHI shopService.addCartItem() (async) resolve —
    // đợi nó thay vì chỉ đợi click() (click chỉ đợi sự kiện dispatch, không đợi API bên trong
    // handler hoàn tất), tránh điều hướng sang giỏ hàng trước khi item kịp lưu server-side.
    this.addedToCartToast = page.getByText('Đã thêm vào giỏ hàng', { exact: true })
  }

  ramOption(label) {
    return this.page.getByRole('button', { name: label, exact: true })
  }

  storageOption(label) {
    return this.page.getByRole('button', { name: label, exact: true })
  }

  colorOption(label) {
    return this.page.getByRole('button', { name: label, exact: true })
  }

  async selectVariant({ ram, storage, color }) {
    if (ram) await this.ramOption(ram).click()
    if (storage) await this.storageOption(storage).click()
    if (color) await this.colorOption(color).click()
  }

  async addToCart() {
    await this.addToCartButton.click()
    await this.addedToCartToast.waitFor({ state: 'visible' })
  }
}
