import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Test tải cho luồng đọc (duyệt/tìm kiếm/xem chi tiết sản phẩm) — traffic thực tế nặng nhất
// và không ghi DB, nên an toàn chạy lặp lại nhiều lần trên Staging. KHÔNG bao gồm
// login/checkout: login bị AuthRateLimitFilter giới hạn 5 lần/15 phút/IP (sẽ tự fail ở tải
// thấp), còn checkout ghi order/serial thật vào DB staging mỗi lần chạy.
const BASE_URL = __ENV.PERF_BASE_URL
if (!BASE_URL) {
  throw new Error('PERF_BASE_URL chưa được set — truyền qua -e PERF_BASE_URL=...')
}

const MAX_VUS = Number(__ENV.K6_MAX_VUS || 10)
const STEADY_DURATION = __ENV.K6_STEADY_DURATION || '1m'

const errorRate = new Rate('errors')

export const options = {
  scenarios: {
    browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: MAX_VUS },
        { duration: STEADY_DURATION, target: MAX_VUS },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],
    errors: ['rate<0.01'],
  },
}

const SEARCH_KEYWORDS = ['iPhone', 'Samsung', 'laptop', 'tai nghe', 'chuột']

// Lấy sẵn một mẫu product id thật từ Staging thay vì hardcode, để không phụ thuộc vào
// một sản phẩm cụ thể còn tồn tại/còn hàng hay không.
export function setup() {
  const res = http.get(`${BASE_URL}/api/products/filter?size=20&sort=newest`)
  const items = res.json('items')
  if (!items || items.length === 0) {
    throw new Error('Không lấy được sản phẩm nào từ Staging để test — kiểm tra lại seed data.')
  }
  return { sampleProductIds: items.slice(0, 5).map((p) => p.id) }
}

export default function (data) {
  let res = http.get(`${BASE_URL}/api/products/filter?page=0&size=20&sort=newest`, {
    tags: { name: 'ListProducts' },
  })
  check(res, { 'list: status 200': (r) => r.status === 200 }) || errorRate.add(1)

  sleep(1)

  const keyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)]
  res = http.get(`${BASE_URL}/api/products/filter?keyword=${encodeURIComponent(keyword)}&size=10`, {
    tags: { name: 'SearchProducts' },
  })
  check(res, { 'search: status 200': (r) => r.status === 200 }) || errorRate.add(1)

  sleep(1)

  const productId = data.sampleProductIds[Math.floor(Math.random() * data.sampleProductIds.length)]
  res = http.get(`${BASE_URL}/api/products/${productId}`, { tags: { name: 'ProductDetail' } })
  check(res, { 'detail: status 200': (r) => r.status === 200 }) || errorRate.add(1)

  sleep(2)
}
