export class ProductListPage {
  constructor(page) {
    this.page = page
  }

  // ProductCard là 1 div thường (không có role/aria-label riêng) — click qua heading tên sản
  // phẩm, sự kiện click sẽ bubble lên đúng div cha có onClick điều hướng sang trang chi tiết.
  productCardByName(name) {
    return this.page.getByRole('heading', { name, exact: true })
  }

  async openProduct(name) {
    await this.productCardByName(name).click()
  }
}
