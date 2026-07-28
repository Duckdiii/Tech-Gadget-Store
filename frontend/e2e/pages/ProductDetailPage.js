export class ProductDetailPage {
  constructor(page) {
    this.page = page
    // Nút đích thực dùng chung aria-label="Thao tác" với hàng chục nút khác trên trang (tab,
    // breadcrumb, thumbnail...) nên không unique — phải chọn theo text hiển thị thay vì role+name.
    this.addToCartButton = page.getByText('Thêm vào giỏ hàng', { exact: true })
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
  }
}
