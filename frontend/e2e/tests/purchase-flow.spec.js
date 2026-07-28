import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { StoreNavbarPage } from '../pages/StoreNavbarPage'
import { ProductListPage } from '../pages/ProductListPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'

// Tài khoản demo do CustomerOrderSeeder tạo (RANDOM_SEED cố định → luôn cùng 1 tập account).
const SEED_CUSTOMER = { email: 'seed.customer.1@example.com', password: 'Seed@12345' }
const PRODUCT_NAME = 'iPhone 15 Pro Max'

test.describe('Luồng mua hàng cốt lõi (browse → giỏ hàng → checkout COD)', () => {
  test('khách hàng đã đăng nhập có thể tìm sản phẩm, thêm vào giỏ và đặt hàng COD thành công', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const navbar = new StoreNavbarPage(page)
    const productList = new ProductListPage(page)
    const productDetail = new ProductDetailPage(page)
    const cartPage = new CartPage(page)
    const checkoutPage = new CheckoutPage(page)

    await loginPage.goto()
    await loginPage.login(SEED_CUSTOMER.email, SEED_CUSTOMER.password)
    await expect(page).toHaveURL('/')

    await navbar.searchFor(PRODUCT_NAME)
    await expect(productList.productCardByName(PRODUCT_NAME)).toBeVisible()
    await productList.openProduct(PRODUCT_NAME)

    // ProductDetailPage tự chọn sẵn variant đầu tiên khi load (xem useProductDetail.js), nên nút
    // thêm vào giỏ đã enable ngay, không cần thao tác chọn RAM/dung lượng/màu.
    await expect(productDetail.addToCartButton).toBeEnabled()
    await productDetail.addToCart()

    await navbar.goToCart()
    await cartPage.proceedToCheckout()

    await checkoutPage.selectFirstAddress()
    await checkoutPage.selectFirstPaymentMethod()
    await checkoutPage.submitOrder()

    await expect(page.getByRole('heading', { name: 'Đặt hàng thành công!' })).toBeVisible({ timeout: 15000 })
  })
})
