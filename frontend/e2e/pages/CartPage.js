export class CartPage {
  constructor(page) {
    this.page = page
    this.checkoutButton = page.getByRole('button', { name: 'Đặt hàng ngay' })
  }

  async proceedToCheckout() {
    await this.checkoutButton.click()
  }
}
