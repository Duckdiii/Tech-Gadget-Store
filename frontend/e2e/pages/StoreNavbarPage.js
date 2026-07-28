export class StoreNavbarPage {
  constructor(page) {
    this.page = page
    this.searchInput = page.getByLabel('Tìm kiếm sản phẩm')
    this.searchButton = page.getByRole('button', { name: 'Tìm kiếm' })
    this.cartLink = page.getByRole('button', { name: 'Giỏ hàng' })
    this.accountButton = page.getByRole('button', { name: 'Tài khoản' })
  }

  async searchFor(keyword) {
    await this.searchInput.fill(keyword)
    await this.searchButton.click()
  }

  async goToCart() {
    await this.cartLink.click()
  }
}
