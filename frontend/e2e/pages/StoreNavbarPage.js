export class StoreNavbarPage {
  constructor(page) {
    this.page = page
    // HomePage.jsx có 1 khối search riêng ở hero section, dùng CHUNG aria-label/placeholder với
    // ô search trong navbar — nên phải giới hạn phạm vi tìm trong <header> (StoreNavbar), tránh
    // khớp nhầm sang widget của HomePage khi đang ở trang chủ "/".
    const header = page.locator('header')
    this.searchInput = header.getByPlaceholder('Tìm điện thoại, máy tính, phụ kiện...')
    this.searchButton = header.getByRole('button', { name: 'Tìm kiếm', exact: true })
    this.cartLink = header.getByRole('button', { name: 'Giỏ hàng' })
    this.accountButton = header.getByRole('button', { name: 'Tài khoản' })
  }

  async searchFor(keyword) {
    await this.searchInput.fill(keyword)
    await this.searchButton.click()
  }

  async goToCart() {
    await this.cartLink.click()
  }
}
