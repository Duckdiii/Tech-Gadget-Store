export class CheckoutPage {
  constructor(page) {
    this.page = page
    // aria-label gắn tên/địa chỉ thật (động) — khớp theo tiền tố cố định "Giao đến".
    this.addressCards = page.getByRole('button', { name: /^Giao đến/ })
    // Radio's aria-label là method.name — COD được seed với name literal "COD" (xem
    // PaymentService.java). Không dùng paymentRadios.first(): backend trả về theo thứ tự
    // MOMO → VNPAY → COD, "first" sẽ chọn nhầm MoMo và redirect sang cổng thanh toán MoMo.
    this.codPaymentRadio = page.getByRole('radio', { name: 'COD', exact: true })
    this.submitButton = page.getByRole('button', { name: 'Xác nhận đặt hàng' })
  }

  async selectFirstAddress() {
    await this.addressCards.first().click()
  }

  async selectCodPaymentMethod() {
    await this.codPaymentRadio.check()
  }

  async submitOrder() {
    await this.submitButton.click()
  }
}
