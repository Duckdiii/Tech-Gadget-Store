export class CheckoutPage {
  constructor(page) {
    this.page = page
    // aria-label gắn tên/địa chỉ thật (động) — khớp theo tiền tố cố định "Giao đến".
    this.addressCards = page.getByRole('button', { name: /^Giao đến/ })
    this.paymentRadios = page.getByRole('radio')
    this.submitButton = page.getByRole('button', { name: 'Xác nhận đặt hàng' })
  }

  async selectFirstAddress() {
    await this.addressCards.first().click()
  }

  async selectFirstPaymentMethod() {
    await this.paymentRadios.first().check()
  }

  async submitOrder() {
    await this.submitButton.click()
  }
}
