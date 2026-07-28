export class StoreNavbarPage {
  constructor(page) {
    this.page = page
    // aria-label="Tìm kiếm sản phẩm" bị dùng chung cho cả 2 ô input (thường + chế độ AI) lẫn nút
    // submit — không unique. Ô input thường phân biệt được qua placeholder cố định; nút submit
    // phân biệt qua role (input là textbox, không phải button).
    this.searchInput = page.getByPlaceholder('Tìm điện thoại, máy tính, phụ kiện...')
    this.searchButton = page.getByRole('button', { name: 'Tìm kiếm sản phẩm' })
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
