import { useState, useRef } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

/* ── Static data ─────────────────────────────────────────────── */

const OVERVIEW_ORDERS = [
  {
    id: '#ORD-2603001988', date: '28/03/2026', status: 'Đã nhận hàng', statusClass: 'text-green-700',
    statusBg: 'bg-green-50 border-green-200',
    total: 24500000, product: 'MacBook Pro 14" M3 Pro 512GB Space Black', extra: 'Cùng 1 sản phẩm khác', img: 'Mac',
  },
  {
    id: '#ORD-2507001033', date: '15/07/2025', status: 'Đang giao hàng', statusClass: 'text-[#E8420A]',
    statusBg: 'bg-orange-50 border-orange-200',
    total: 29490000, product: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', extra: 'Cùng 2 sản phẩm khác', img: 'iOS',
  },
  {
    id: '#ORD-2506000871', date: '02/06/2025', status: 'Đang xử lý', statusClass: 'text-orange-700',
    statusBg: 'bg-orange-50 border-orange-200',
    total: 6490000, product: 'AirPods Pro 2nd Generation USB-C', extra: null, img: 'APods',
  },
]

const ORDER_STATUS = {
  completed:  { label: 'Đã nhận hàng',   dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50 border-green-200'  },
  shipping:   { label: 'Đang vận chuyển', dot: 'bg-[#E8420A]',  text: 'text-[#E8420A]',  bg: 'bg-orange-50 border-orange-200' },
  processing: { label: 'Đang xử lý',      dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200'},
  pending:    { label: 'Chờ xác nhận',    dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200'},
  cancelled:  { label: 'Đã huỷ',          dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50 border-red-200'      },
}

const ORDER_FILTER_TABS = [
  { id: 'all',        label: 'Tất cả' },
  { id: 'pending',    label: 'Chờ xác nhận' },
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipping',   label: 'Đang vận chuyển' },
  { id: 'completed',  label: 'Đã nhận hàng' },
  { id: 'cancelled',  label: 'Đã huỷ' },
]

const ALL_ORDERS = [
  {
    id: '#ORD-2603001988', date: '28/03/2026', status: 'completed', total: 24500000,
    product: 'MacBook Pro 14" M3 Pro 512GB Space Black', price: 49990000,
    extra: 'Cùng 1 sản phẩm khác', img: 'Mac',
  },
  {
    id: '#ORD-2507001033', date: '15/07/2025', status: 'shipping', total: 29490000,
    product: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', price: 29490000,
    extra: 'Cùng 2 sản phẩm khác', img: 'iOS',
  },
  {
    id: '#ORD-2506000871', date: '02/06/2025', status: 'processing', total: 6490000,
    product: 'AirPods Pro 2nd Generation USB-C', price: 6490000,
    extra: null, img: 'APods',
  },
  {
    id: '#ORD-2504000312', date: '18/04/2025', status: 'pending', total: 1250000,
    product: 'Cáp USB-C 240W (2 chiếc) + Dán kính cường lực', price: 1250000,
    extra: 'Cùng 1 sản phẩm khác', img: 'Acc',
  },
  {
    id: '#ORD-2503000198', date: '05/03/2025', status: 'cancelled', total: 25990000,
    product: 'Samsung Galaxy S23 Ultra 256GB', price: 25990000,
    extra: null, img: 'Sam',
  },
  {
    id: '#ORD-2502000087', date: '20/02/2025', status: 'completed', total: 11990000,
    product: 'Apple Watch Series 9 41mm Midnight', price: 11990000,
    extra: null, img: 'Watch',
  },
]

const WISHLIST = [
  { name: 'Laptop Acer Gaming Aspire 7 A715', price: 21490000, original: 23990000 },
  { name: 'Xiaomi Redmi Note 14 6GB 128GB',   price: 4690000,  original: 4990000  },
  { name: 'Laptop ASUS Vivobook S14 S3407VA', price: 19990000, original: 22990000 },
  { name: 'Màn hình Gaming LG UltraGear 27"', price: 2690000,  original: 3990000  },
  { name: 'Xiaomi Pad 7 Pro 8GB 256GB',       price: 13740000, original: null      },
  { name: 'RAM Laptop Transcend DDR5 4800MHz',price: 6490000,  original: 9990000  },
]

const WISHLIST_DATA = [
  { id: 1, name: 'Laptop Acer Gaming Aspire 7 A715-74G', brand: 'Acer', category: 'Laptop',
    price: 21490000, original: 23990000, stock: 'in_stock', rating: 4.5, reviews: 128, addedDate: '10/06/2026' },
  { id: 2, name: 'Xiaomi Redmi Note 14 Pro 8GB 256GB Black', brand: 'Xiaomi', category: 'Điện thoại',
    price: 4690000, original: 4990000, stock: 'in_stock', rating: 4.3, reviews: 312, addedDate: '08/06/2026' },
  { id: 3, name: 'Laptop ASUS Vivobook S14 OLED S3407QA', brand: 'ASUS', category: 'Laptop',
    price: 19990000, original: 22990000, stock: 'low', rating: 4.7, reviews: 89, addedDate: '05/06/2026' },
  { id: 4, name: 'Màn hình Gaming LG UltraGear 27" QHD 165Hz', brand: 'LG', category: 'Màn hình',
    price: 7290000, original: 9990000, stock: 'in_stock', rating: 4.6, reviews: 203, addedDate: '01/06/2026' },
  { id: 5, name: 'Xiaomi Pad 7 Pro 8GB 256GB Graphite Black', brand: 'Xiaomi', category: 'Máy tính bảng',
    price: 13740000, original: null, stock: 'out', rating: 4.4, reviews: 56, addedDate: '28/05/2026' },
  { id: 6, name: 'Tai nghe Sony WH-1000XM5 Chống ồn ANC', brand: 'Sony', category: 'Tai nghe',
    price: 7490000, original: 8990000, stock: 'in_stock', rating: 4.8, reviews: 445, addedDate: '25/05/2026' },
  { id: 7, name: 'iPhone 16 Pro Max 256GB Desert Titanium', brand: 'Apple', category: 'Điện thoại',
    price: 34990000, original: 36990000, stock: 'low', rating: 4.9, reviews: 876, addedDate: '20/05/2026' },
  { id: 8, name: 'Samsung Galaxy Tab S10 FE 6GB 128GB', brand: 'Samsung', category: 'Máy tính bảng',
    price: 10490000, original: 12990000, stock: 'in_stock', rating: 4.2, reviews: 134, addedDate: '15/05/2026' },
]

const BANNERS_INIT = [
  { id: 1, text: 'Thêm địa chỉ để đặt đơn hàng nhanh hơn.', cta: 'Thêm địa chỉ', action: 'address' },
  { id: 2, text: 'Liên kết thẻ ngân hàng để thanh toán nhanh hơn.', cta: 'Liên kết ngay', action: 'payment' },
]

const ADDRESSES_INIT = [
  {
    id: 1,
    name: 'Alex Johnson', phone: '0961234535',
    province: 'Hà Nội', district: 'Quận Cầu Giấy', ward: 'Phường Dịch Vọng Hậu',
    detail: '123 Đường Xuân Thủy',
    type: 'home', isDefault: true,
  },
  {
    id: 2,
    name: 'Alex Johnson', phone: '0961234535',
    province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé',
    detail: '45 Đường Lê Lợi, Tòa nhà Saigon Centre, Tầng 5',
    type: 'office', isDefault: false,
  },
]

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Quảng Ninh', 'Nghệ An',
  'Thừa Thiên Huế', 'Lâm Đồng', 'Bà Rịa - Vũng Tàu', 'Long An', 'Tiền Giang',
]

const DISTRICTS = {
  'Hà Nội':            ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Đống Đa', 'Quận Hai Bà Trưng', 'Quận Cầu Giấy', 'Quận Thanh Xuân', 'Quận Hoàng Mai', 'Huyện Đông Anh'],
  'TP. Hồ Chí Minh':  ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Tân Bình', 'Thành phố Thủ Đức'],
  'Đà Nẵng':           ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ'],
  'Cần Thơ':           ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Huyện Phong Điền'],
  'Hải Phòng':         ['Quận Hồng Bàng', 'Quận Lê Chân', 'Quận Ngô Quyền', 'Quận Kiến An', 'Quận Hải An'],
}

const WARDS = {
  'Quận Cầu Giấy':   ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
  'Quận Hoàn Kiếm':  ['Phường Hàng Bạc', 'Phường Hàng Gai', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Tràng Tiền'],
  'Quận 1':           ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Thái Bình'],
  'Quận Bình Thạnh': ['Phường 1', 'Phường 3', 'Phường 5', 'Phường 11', 'Phường 13', 'Phường 17', 'Phường 21', 'Phường 22', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
  'Quận Hải Châu':   ['Phường Bình Hiên', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thạch Thang'],
}

const CARDS_INIT = [
  {
    id: 1, type: 'visa',
    number: '4111111111111234', holder: 'ALEX JOHNSON',
    expiry: '12/27', bank: 'Vietcombank', isDefault: true,
  },
  {
    id: 2, type: 'mastercard',
    number: '5200830000001234', holder: 'ALEX JOHNSON',
    expiry: '08/26', bank: 'Techcombank', isDefault: false,
  },
]

const WALLETS_INIT = [
  {
    id: 'momo',    name: 'MoMo',     linked: true,  phone: '0961234535',
    color: 'from-pink-500 to-fuchsia-600', bg: 'bg-pink-50',
    border: 'border-pink-200', textColor: 'text-pink-700',
    desc: 'Ví điện tử phổ biến nhất Việt Nam',
  },
  {
    id: 'zalopay', name: 'ZaloPay',  linked: false, phone: null,
    color: 'from-slate-500 to-slate-700', bg: 'bg-slate-50',
    border: 'border-slate-200', textColor: 'text-slate-700',
    desc: 'Thanh toán qua ứng dụng Zalo',
  },
  {
    id: 'vnpay',   name: 'VNPay',    linked: true,  phone: '0961234535',
    color: 'from-red-500 to-rose-600', bg: 'bg-red-50',
    border: 'border-red-200', textColor: 'text-red-700',
    desc: 'Cổng thanh toán trực tuyến VNPAY',
  },
  {
    id: 'shopeepay', name: 'ShopeePay', linked: false, phone: null,
    color: 'from-orange-500 to-red-500', bg: 'bg-orange-50',
    border: 'border-orange-200', textColor: 'text-orange-700',
    desc: 'Ví điện tử của Shopee',
  },
]

const CARD_BLANK = { number: '', holder: '', expiry: '', cvv: '', bank: '', isDefault: false }

const FAQ_DATA = [
  {
    id: 'order', category: 'Đơn hàng & Giao hàng',
    items: [
      { q: 'Tôi có thể theo dõi đơn hàng của mình ở đâu?', a: 'Bạn có thể theo dõi đơn hàng trong mục "Lịch sử mua hàng" trên trang hồ sơ cá nhân hoặc qua email xác nhận đơn hàng. Mã vận đơn sẽ được gửi khi đơn được giao cho đơn vị vận chuyển.' },
      { q: 'Thời gian giao hàng tiêu chuẩn là bao lâu?', a: 'Nội thành Hà Nội & TP.HCM: 2–4 giờ (giao hỏa tốc) hoặc 1–2 ngày (tiêu chuẩn). Các tỉnh thành khác: 2–5 ngày làm việc tùy khu vực.' },
      { q: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?', a: 'Bạn có thể thay đổi địa chỉ trong vòng 30 phút sau khi đặt hàng, với điều kiện đơn chưa được xác nhận bởi kho. Liên hệ hotline 1800-1234 để được hỗ trợ nhanh nhất.' },
      { q: 'Phí vận chuyển được tính như thế nào?', a: 'Miễn phí vận chuyển cho đơn từ 500.000đ. Đơn dưới 500.000đ phí từ 20.000–40.000đ tùy khu vực. Thành viên Elite được miễn phí vận chuyển hỏa tốc.' },
    ],
  },
  {
    id: 'payment', category: 'Thanh toán',
    items: [
      { q: 'Các phương thức thanh toán nào được chấp nhận?', a: 'Chúng tôi chấp nhận: Thẻ Visa/Mastercard/JCB, Ví MoMo, ZaloPay, VNPay, và thanh toán khi nhận hàng (COD). Một số phương thức có thể không khả dụng tùy sản phẩm.' },
      { q: 'Thanh toán bằng thẻ có an toàn không?', a: 'Hoàn toàn an toàn. Giao dịch được mã hóa 256-bit SSL theo tiêu chuẩn PCI DSS. Chúng tôi không lưu trữ thông tin CVV của thẻ.' },
      { q: 'Tôi có thể trả góp 0% không?', a: 'Có, sản phẩm từ 3.000.000đ trở lên được hỗ trợ trả góp 0% qua thẻ tín dụng của 15+ ngân hàng đối tác. Chọn "Trả góp" ở bước thanh toán để xem điều kiện cụ thể.' },
    ],
  },
  {
    id: 'return', category: 'Đổi trả & Bảo hành',
    items: [
      { q: 'Chính sách đổi trả của cửa hàng như thế nào?', a: '15 ngày đổi trả miễn phí kể từ ngày nhận hàng nếu sản phẩm còn nguyên seal, đầy đủ phụ kiện và hóa đơn. Đổi máy mới trong 30 ngày nếu sản phẩm lỗi kỹ thuật do nhà sản xuất.' },
      { q: 'Sản phẩm của tôi bị lỗi, tôi cần làm gì?', a: 'Chụp ảnh/quay video sản phẩm lỗi, tạo phiếu yêu cầu trong mục "Hỗ trợ" hoặc gọi hotline 1800-1234. Đội ngũ kỹ thuật sẽ liên hệ trong vòng 24 giờ làm việc.' },
      { q: 'Thời gian bảo hành là bao lâu?', a: 'Tùy theo hãng và sản phẩm: Điện thoại 12–24 tháng, Laptop 12–24 tháng, Phụ kiện 6–12 tháng. Xem chi tiết trong phần "Tra cứu bảo hành" trên hồ sơ.' },
    ],
  },
  {
    id: 'account', category: 'Tài khoản & Thành viên',
    items: [
      { q: 'Điểm thành viên được tích lũy như thế nào?', a: 'Cứ mỗi 100.000đ chi tiêu bạn nhận được 1 điểm. Điểm được cộng sau khi đơn hàng hoàn thành (đã nhận hàng). Thành viên Elite nhân 3x điểm trên mỗi đơn.' },
      { q: 'Làm sao để lên hạng thành viên cao hơn?', a: 'Hạng thành viên dựa trên tổng chi tiêu tích lũy trong năm: Bạc ≥ 5tr, Vàng ≥ 20tr, Elite ≥ 50tr, Elite+ ≥ 100tr. Hạng được cập nhật ngay sau khi đạt ngưỡng.' },
      { q: 'Tài khoản của tôi bị khóa, tôi phải làm gì?', a: 'Liên hệ bộ phận hỗ trợ qua email support@techgadget.vn kèm thông tin xác minh. Thời gian xử lý trong vòng 1–2 ngày làm việc.' },
    ],
  },
]

const TICKETS_INIT = [
  {
    id: '#TKT-2604001', subject: 'Sản phẩm bị lỗi màn hình sau 3 ngày sử dụng',
    category: 'Đổi trả & Bảo hành', status: 'processing',
    priority: 'high', created: '01/04/2026', lastReply: '03/04/2026', messages: 5,
  },
  {
    id: '#TKT-2603002', subject: 'Chưa nhận được hoàn tiền sau khi huỷ đơn',
    category: 'Thanh toán', status: 'resolved',
    priority: 'medium', created: '15/03/2026', lastReply: '18/03/2026', messages: 4,
  },
  {
    id: '#TKT-2602001', subject: 'Không áp dụng được mã giảm giá ELITE10',
    category: 'Khuyến mãi', status: 'closed',
    priority: 'low', created: '08/02/2026', lastReply: '10/02/2026', messages: 3,
  },
]

const TICKET_STATUS = {
  open:       { label: 'Mới',         dot: 'bg-[#E8420A]',  text: 'text-[#E8420A]',  bg: 'bg-orange-50 border-orange-200' },
  processing: { label: 'Đang xử lý',  dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200'},
  resolved:   { label: 'Đã giải quyết', dot: 'bg-green-500', text: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  closed:     { label: 'Đã đóng',     dot: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-100 border-gray-200'  },
}

const SUPPORT_CATEGORIES = ['Đơn hàng & Giao hàng', 'Thanh toán', 'Đổi trả & Bảo hành', 'Khuyến mãi', 'Tài khoản', 'Sản phẩm & Tư vấn', 'Khác']

const SIDEBAR_ITEMS = [
  { id: 'overview',   label: 'Tổng quan',                icon: 'home'     },
  { id: 'orders',     label: 'Lịch sử mua hàng',         icon: 'orders'   },
  { id: 'wishlist',   label: 'Sản phẩm yêu thích',       icon: 'heart'    },
  { id: 'warranty',   label: 'Tra cứu bảo hành',         icon: 'warranty' },
  { id: 'membership', label: 'Hạng thành viên & ưu đãi', icon: 'star'     },
  null,
  { id: 'account',    label: 'Thông tin tài khoản',      icon: 'user'     },
  { id: 'address',    label: 'Sổ địa chỉ',               icon: 'location' },
  { id: 'payment',    label: 'Phương thức thanh toán',   icon: 'card' },
  { id: 'coupons',    label: 'Mã giảm giá',              icon: 'coupon'   },
  null,
  { id: 'support',    label: 'Hỗ trợ & Phản hồi',       icon: 'help'     },
  { id: 'logout',     label: 'Đăng xuất',                icon: 'logout',   action: 'login'          },
]

const QUICK_TABS = [
  { id: 'membership', label: 'Hạng thành viên' },
  { id: 'wishlist',   label: 'Yêu thích'        },
  { id: 'coupons',    label: 'Mã giảm giá'     },
  { id: 'orders',     label: 'Lịch sử mua hàng'},
  { id: 'address',    label: 'Sổ địa chỉ' },
  { id: 'payment',    label: 'Thanh toán' },
]

const MEMBERSHIP_TIERS = [
  { id: 'member',  label: 'Thành viên', min: 0,          max: 5000000,   color: 'bg-gray-400',   ring: 'ring-gray-300',   text: 'text-gray-600'   },
  { id: 'silver',  label: 'Bạc',        min: 5000000,    max: 20000000,  color: 'bg-slate-400',  ring: 'ring-slate-300',  text: 'text-slate-600'  },
  { id: 'gold',    label: 'Vàng',       min: 20000000,   max: 50000000,  color: 'bg-amber-400',  ring: 'ring-amber-300',  text: 'text-amber-600'  },
  { id: 'elite',   label: 'Elite',      min: 50000000,   max: 100000000, color: 'bg-[#E8420A]',  ring: 'ring-orange-300', text: 'text-[#E8420A]'  },
  { id: 'eliteplus',label: 'Elite+',    min: 100000000,  max: null,      color: 'bg-purple-600', ring: 'ring-purple-300', text: 'text-purple-700' },
]

const TIER_BENEFITS = {
  member:   ['Tích điểm 1x trên mỗi đơn hàng', 'Nhận thông báo khuyến mãi sớm', 'Hỗ trợ khách hàng ưu tiên'],
  silver:   ['Tích điểm 1.5x trên mỗi đơn hàng', 'Miễn phí vận chuyển đơn từ 500k', 'Giảm thêm 3% sinh nhật', 'Đổi điểm lấy voucher'],
  gold:     ['Tích điểm 2x trên mỗi đơn hàng', 'Miễn phí vận chuyển mọi đơn hàng', 'Giảm thêm 5% sinh nhật', 'Ưu tiên xử lý đổi trả', 'Quà tặng hàng quý'],
  elite:    ['Tích điểm 3x trên mỗi đơn hàng', 'Miễn phí vận chuyển hoả tốc', 'Giảm thêm 10% sinh nhật', 'Đường dây hỗ trợ VIP 24/7', 'Quà tặng hàng tháng', 'Early access sản phẩm mới'],
  eliteplus:['Tích điểm 5x trên mỗi đơn hàng', 'Miễn phí mọi dịch vụ vận chuyển', 'Sinh nhật: quà tặng + giảm 15%', 'Quản lý tài khoản riêng', 'Sự kiện ra mắt sản phẩm độc quyền', 'Bảo hành ưu tiên tại nhà', 'Hoàn tiền 2% mỗi đơn hàng'],
}

const POINTS_HISTORY = [
  { id: 1, desc: 'Mua hàng #ORD-2603001988', date: '28/03/2026', points: +245, type: 'earn'  },
  { id: 2, desc: 'Đổi điểm lấy voucher ELITE10', date: '15/03/2026', points: -200, type: 'redeem'},
  { id: 3, desc: 'Mua hàng #ORD-2507001033', date: '15/07/2025', points: +295, type: 'earn'  },
  { id: 4, desc: 'Thưởng điểm sinh nhật', date: '01/06/2025', points: +100, type: 'bonus' },
  { id: 5, desc: 'Mua hàng #ORD-2506000871', date: '02/06/2025', points: +65,  type: 'earn'  },
  { id: 6, desc: 'Đổi điểm lấy voucher FREESHIP', date: '10/05/2025', points: -100, type: 'redeem'},
  { id: 7, desc: 'Mua hàng #ORD-2502000087', date: '20/02/2025', points: +120, type: 'earn'  },
]

const COUPONS_DATA = [
  {
    id: 1, code: 'ELITE10', status: 'active',
    label: 'Giảm 10% toàn đơn hàng',
    desc: 'Áp dụng cho tất cả sản phẩm, tối đa 500.000đ',
    exp: '30/06/2026', minOrder: 1000000,
    type: 'percent', value: 10,
    color: 'from-[#E8420A] to-orange-700', badge: 'bg-orange-100 text-[#E8420A]',
  },
  {
    id: 2, code: 'FREESHIP', status: 'active',
    label: 'Miễn phí vận chuyển',
    desc: 'Áp dụng cho đơn hàng từ 200.000đ trở lên',
    exp: '15/06/2026', minOrder: 200000,
    type: 'ship', value: 0,
    color: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700',
  },
  {
    id: 3, code: 'DOUBLE2X', status: 'active',
    label: 'Tích điểm x2 cuối tuần',
    desc: 'Nhân đôi điểm thưởng cho mọi đơn hàng thứ 7 & CN',
    exp: '30/06/2026', minOrder: 0,
    type: 'points', value: 2,
    color: 'from-purple-500 to-violet-600', badge: 'bg-purple-100 text-purple-700',
  },
  {
    id: 4, code: 'BDAY500', status: 'active',
    label: 'Quà sinh nhật — giảm 500.000đ',
    desc: 'Áp dụng cho đơn hàng từ 2.000.000đ, dùng 1 lần',
    exp: '01/07/2026', minOrder: 2000000,
    type: 'flat', value: 500000,
    color: 'from-rose-500 to-pink-600', badge: 'bg-rose-100 text-rose-700',
  },
  {
    id: 5, code: 'SAVE20OLD', status: 'used',
    label: 'Giảm 20% đơn đầu tiên',
    desc: 'Đã sử dụng cho đơn #ORD-2502000087',
    exp: '28/02/2025', minOrder: 500000,
    type: 'percent', value: 20,
    color: 'from-gray-400 to-gray-500', badge: 'bg-gray-100 text-gray-500',
  },
  {
    id: 6, code: 'FLASH15', status: 'expired',
    label: 'Flash Sale — giảm 15%',
    desc: 'Chương trình khuyến mãi cuối năm 2024',
    exp: '31/12/2024', minOrder: 3000000,
    type: 'percent', value: 15,
    color: 'from-gray-400 to-gray-500', badge: 'bg-gray-100 text-gray-500',
  },
]

/* ── Helpers ─────────────────────────────────────────────────── */

function fmt(n) { return n.toLocaleString('vi-VN') + 'đ' }

const ICON_PATHS = {
  home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  orders:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  warranty: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  star:     'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  card:     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  coupon:   'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
  help:     'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

function SvgIcon({ name, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS[name]} />
    </svg>
  )
}

/* ── Sub-sections ────────────────────────────────────────────── */

/* ── PaymentSection ──────────────────────────────────────────── */

function detectCardType(number) {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n))           return 'visa'
  if (/^5[1-5]/.test(n))     return 'mastercard'
  if (/^35(28|29|[3-8])/.test(n)) return 'jcb'
  return 'unknown'
}

function formatCardNumber(raw) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function maskCardNumber(number) {
  const digits = number.replace(/\D/g, '')
  return `**** **** **** ${digits.slice(-4)}`
}

const CARD_GRADIENTS = {
  visa:       'from-slate-700 via-slate-600 to-slate-800',
  mastercard: 'from-orange-500 via-red-500 to-rose-600',
  jcb:        'from-green-600 via-teal-600 to-emerald-700',
  unknown:    'from-gray-600 via-gray-500 to-gray-700',
}

function CardLogo({ type, small }) {
  const sz = small ? 'text-xs' : 'text-sm'
  if (type === 'visa')
    return <span className={`font-black italic tracking-widest text-white ${sz}`} style={{ fontFamily: 'serif' }}>VISA</span>
  if (type === 'mastercard')
    return (
      <div className="flex items-center">
        <div className={`${small ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-red-400 opacity-90`} />
        <div className={`${small ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-yellow-400 opacity-90 -ml-2`} />
      </div>
    )
  if (type === 'jcb')
    return <span className={`font-black tracking-widest text-white bg-[#0D0F14] px-1.5 py-0.5 rounded ${sz}`}>JCB</span>
  return <span className={`font-bold text-white/70 ${sz}`}>CARD</span>
}

function AddCardModal({ onClose, onSave }) {
  const [form, setForm]         = useState(CARD_BLANK)
  const [cvvVisible, setCvvVisible] = useState(false)
  const [errors, setErrors]     = useState({})
  const [flipped, setFlipped]   = useState(false)

  const cardType = detectCardType(form.number)

  const set = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    set('number')(formatted)
  }

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
    set('expiry')(v)
  }

  const validate = () => {
    const e = {}
    const digits = form.number.replace(/\s/g, '')
    if (digits.length < 13)          e.number = 'Số thẻ không hợp lệ'
    if (!form.holder.trim())         e.holder = 'Vui lòng nhập tên chủ thẻ'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Định dạng MM/YY'
    if (form.cvv.length < 3)         e.cvv    = 'CVV không hợp lệ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => { if (validate()) onSave({ ...form, type: cardType }) }

  const inputCls = (k) =>
    `w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${errors[k] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`

  /* live card preview */
  const displayNumber = form.number || '**** **** **** ****'
  const displayHolder = form.holder.toUpperCase() || 'TÊN CHỦ THẺ'
  const displayExpiry = form.expiry || 'MM/YY'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t z-10">
          <div>
            <h2 className="text-base font-black text-gray-900">Thêm thẻ mới</h2>
            <p className="text-xs text-gray-400 mt-0.5">Hỗ trợ Visa, Mastercard và JCB</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Live card preview */}
          <div className={`relative h-44 rounded bg-gradient-to-br ${CARD_GRADIENTS[cardType]} p-6 shadow-lg overflow-hidden select-none`}>
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-white/10" />

            {/* chip */}
            <div className="w-10 h-7 rounded-md bg-yellow-300/80 mb-4 flex items-center justify-center">
              <div className="w-6 h-5 rounded-sm border border-yellow-500/50 grid grid-cols-2 gap-px p-0.5">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-yellow-500/40 rounded-[1px]" />)}
              </div>
            </div>

            <p className="text-white font-mono text-lg font-bold tracking-widest drop-shadow mb-3">{displayNumber}</p>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Chủ thẻ</p>
                <p className="text-white text-sm font-bold truncate max-w-[180px]">{displayHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Hết hạn</p>
                <p className="text-white text-sm font-bold">{displayExpiry}</p>
              </div>
              <div className="absolute top-5 right-6">
                <CardLogo type={cardType} />
              </div>
            </div>
          </div>

          {/* Card number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Số thẻ <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                value={form.number}
                onChange={handleNumberChange}
                placeholder="0000 0000 0000 0000"
                className={`${inputCls('number')} pr-12 font-mono tracking-widest`}
                maxLength={19}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CardLogo type={cardType} small />
              </div>
            </div>
            {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
          </div>

          {/* Cardholder */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tên chủ thẻ <span className="text-red-500">*</span></label>
            <input
              value={form.holder}
              onChange={e => set('holder')(e.target.value.toUpperCase())}
              placeholder="NGUYEN VAN A"
              className={`${inputCls('holder')} uppercase tracking-wide`}
            />
            {errors.holder && <p className="text-xs text-red-500 mt-1">{errors.holder}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Ngày hết hạn <span className="text-red-500">*</span></label>
              <input
                value={form.expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className={`${inputCls('expiry')} font-mono tracking-wider`}
                maxLength={5}
              />
              {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">CVV / CVC <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  value={form.cvv}
                  onChange={e => set('cvv')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                  type={cvvVisible ? 'text' : 'password'}
                  placeholder="•••"
                  className={`${inputCls('cvv')} pr-10 font-mono tracking-widest`}
                  maxLength={4}
                />
                <button type="button" onClick={() => setCvvVisible(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {cvvVisible
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
            </div>
          </div>

          {/* Bank (optional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Ngân hàng phát hành <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
            <select value={form.bank} onChange={e => set('bank')(e.target.value)} className={inputCls('bank')}>
              <option value="">-- Chọn ngân hàng --</option>
              {['Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'Techcombank', 'MB Bank', 'ACB', 'VPBank', 'TPBank', 'Sacombank', 'HDBank', 'OCB'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set('isDefault')(!form.isDefault)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${form.isDefault ? 'bg-[#E8420A] border-[#E8420A]' : 'border-gray-300 hover:border-[#E8420A]'}`}
            >
              {form.isDefault && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Đặt làm phương thức thanh toán mặc định</p>
              <p className="text-xs text-gray-400 mt-0.5">Thẻ này sẽ được chọn tự động khi thanh toán</p>
            </div>
          </label>

          {/* Security note */}
          <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded px-4 py-3">
            <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-green-700 font-medium">Thông tin thẻ được mã hóa theo tiêu chuẩn PCI DSS. Chúng tôi không lưu trữ CVV.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50/60 rounded-b sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors">Huỷ bỏ</button>
          <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors">Thêm thẻ</button>
        </div>
      </div>
    </div>
  )
}

function PaymentSection() {
  const [tab, setTab]             = useState('cards')
  const [cards, setCards]         = useState(CARDS_INIT)
  const [wallets, setWallets]     = useState(WALLETS_INIT)
  const [showAddCard, setShowAddCard] = useState(false)
  const [deletingCardId, setDeletingCardId] = useState(null)
  const [toast, setToast]         = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

  const handleAddCard = (form) => {
    const newCard = {
      ...form, id: Date.now(),
      type: detectCardType(form.number),
    }
    setCards(prev => {
      const list = form.isDefault ? prev.map(c => ({ ...c, isDefault: false })) : prev
      return [...list, newCard]
    })
    setShowAddCard(false)
    showToast('Thêm thẻ thành công!')
  }

  const handleDeleteCard = (id) => {
    setCards(prev => {
      const remaining = prev.filter(c => c.id !== id)
      if (remaining.length > 0 && !remaining.some(c => c.isDefault)) remaining[0].isDefault = true
      return remaining
    })
    setDeletingCardId(null)
    showToast('Đã xoá thẻ.')
  }

  const handleSetDefaultCard = (id) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })))
    showToast('Đã đặt làm thẻ mặc định!')
  }

  const handleToggleWallet = (id) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, linked: !w.linked, phone: !w.linked ? '0961234535' : null } : w))
    const w = wallets.find(w => w.id === id)
    showToast(w?.linked ? `Đã huỷ liên kết ${w.name}.` : `Đã liên kết ${w.name} thành công!`)
  }

  const linkedCount = wallets.filter(w => w.linked).length

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Thẻ đã lưu',       value: cards.length,  color: 'bg-orange-50 border-orange-100 text-[#E8420A]'  },
          { label: 'Ví đã liên kết',    value: linkedCount,   color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Tổng phương thức',  value: cards.length + linkedCount, color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map((s, i) => (
          <div key={i} className={`rounded border px-5 py-4 text-center ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">

        {/* Tab bar + action button */}
        <div className="flex items-center justify-between border-b border-gray-200 px-2 pt-2">
          <div className="flex gap-1">
            {[
              { id: 'cards',   label: 'Thẻ ngân hàng', count: cards.length    },
              { id: 'wallets', label: 'Ví điện tử',     count: linkedCount     },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tab === t.id ? 'bg-orange-100 text-[#E8420A]' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
              </button>
            ))}
          </div>
          {tab === 'cards' && (
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 mb-2 mr-2 px-4 py-2 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm thẻ
            </button>
          )}
        </div>

        {/* ── CARDS TAB ─────────────────────────────────────────── */}
        {tab === 'cards' && (
          <div className="p-6">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-600">Chưa có thẻ nào</p>
                <p className="text-sm text-gray-400 mt-1">Thêm thẻ để thanh toán nhanh hơn</p>
                <button onClick={() => setShowAddCard(true)} className="mt-5 flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm thẻ đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {cards.map(card => (
                  <div key={card.id} className="space-y-3">
                    {/* Card visual */}
                    <div className={`relative h-40 rounded bg-gradient-to-br ${CARD_GRADIENTS[card.type]} p-5 shadow-md overflow-hidden ${card.isDefault ? 'ring-2 ring-[#E8420A] ring-offset-2' : ''}`}>
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                      <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />

                      {/* Default ribbon */}
                      {card.isDefault && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-black bg-white/30 text-white border border-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm">Mặc định</span>
                        </div>
                      )}

                      {/* Chip */}
                      <div className="w-8 h-5 rounded bg-yellow-300/80 mb-3 flex items-center justify-center">
                        <div className="w-5 h-4 border border-yellow-500/40 rounded-sm grid grid-cols-2 gap-px p-0.5">
                          {[...Array(4)].map((_, i) => <div key={i} className="bg-yellow-500/40 rounded-[1px]" />)}
                        </div>
                      </div>

                      <p className="text-white font-mono text-sm font-bold tracking-widest drop-shadow">{maskCardNumber(card.number)}</p>

                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <p className="text-white/60 text-[9px] uppercase tracking-wider">Chủ thẻ</p>
                          <p className="text-white text-xs font-bold truncate max-w-[100px]">{card.holder}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/60 text-[9px] uppercase tracking-wider">Hết hạn</p>
                          <p className="text-white text-xs font-bold">{card.expiry}</p>
                        </div>
                        <div className="absolute bottom-4 right-5">
                          <CardLogo type={card.type} small />
                        </div>
                      </div>
                    </div>

                    {/* Card info + actions */}
                    <div className="bg-gray-50 rounded border border-gray-200 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700 capitalize">{card.type.toUpperCase()}{card.bank ? ` · ${card.bank}` : ''}</span>
                        {card.isDefault
                          ? <span className="text-xs font-black text-[#E8420A] bg-orange-100 border border-orange-200 px-2 py-0.5 rounded">Mặc định</span>
                          : <button onClick={() => handleSetDefaultCard(card.id)} className="text-xs font-semibold text-gray-500 hover:text-[#E8420A] transition-colors">Đặt mặc định</button>
                        }
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setDeletingCardId(card.id)} className="flex-1 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 py-1.5 rounded transition-colors">
                          Xoá thẻ
                        </button>
                      </div>

                      {/* Delete confirm */}
                      {deletingCardId === card.id && (
                        <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2">
                          <p className="text-xs font-semibold text-red-700 flex-1">Xác nhận xoá thẻ này?</p>
                          <button onClick={() => setDeletingCardId(null)} className="text-xs font-bold text-gray-500 px-2 py-1 hover:bg-white rounded border border-gray-200 transition-colors">Huỷ</button>
                          <button onClick={() => handleDeleteCard(card.id)} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors">Xoá</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add card tile */}
                <button
                  onClick={() => setShowAddCard(true)}
                  className="h-40 rounded border-2 border-dashed border-gray-300 hover:border-[#E8420A] hover:bg-orange-50/30 flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <div className="w-10 h-10 rounded bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#E8420A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 group-hover:text-[#E8420A] transition-colors">Thêm thẻ mới</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── WALLETS TAB ───────────────────────────────────────── */}
        {tab === 'wallets' && (
          <div className="divide-y divide-gray-100">
            {wallets.map(wallet => (
              <div key={wallet.id} className={`flex items-center gap-5 px-6 py-5 hover:bg-gray-50/60 transition-colors ${wallet.linked ? 'bg-white' : ''}`}>
                {/* Logo block */}
                <div className={`w-14 h-14 rounded bg-gradient-to-br ${wallet.color} flex items-center justify-center shrink-0 shadow-md`}>
                  <span className="text-white text-xs font-black leading-tight text-center px-1">{wallet.name}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{wallet.name}</p>
                    {wallet.linked && (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${wallet.bg} ${wallet.border} ${wallet.textColor}`}>Đã liên kết</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{wallet.desc}</p>
                  {wallet.linked && wallet.phone && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">{wallet.phone.replace(/^(\d{3})\d{4}(\d{2})$/, '$1·····$2')}</span>
                    </div>
                  )}
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => handleToggleWallet(wallet.id)}
                  className={`shrink-0 px-5 py-2 text-sm font-bold rounded border transition-colors ${
                    wallet.linked
                      ? 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-red-600 hover:border-red-200'
                      : 'border-[#E8420A] text-[#E8420A] hover:bg-[#E8420A] hover:text-white'
                  }`}
                >
                  {wallet.linked ? 'Huỷ liên kết' : 'Liên kết'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="bg-gray-50 border border-gray-200 rounded px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <p className="text-xs font-bold text-gray-800 mb-0.5">Bảo mật thanh toán</p>
          <p className="text-xs text-gray-600">Thông tin thẻ và ví được mã hóa 256-bit SSL. Chúng tôi không lưu trữ mã CVV. Mọi giao dịch đều yêu cầu xác thực OTP.</p>
        </div>
      </div>

      {/* Add card modal */}
      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} onSave={handleAddCard} />}
    </div>
  )
}

/* ── SupportSection ──────────────────────────────────────────── */

function FaqAccordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
          >
            <span className={`text-sm font-semibold pr-4 leading-snug ${open === i ? 'text-[#E8420A]' : 'text-gray-800'}`}>{item.q}</span>
            <svg className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180 text-[#E8420A]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 rounded px-4 py-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SupportSection() {
  const [tab, setTab]           = useState('faq')
  const [faqCat, setFaqCat]     = useState('order')
  const [tickets, setTickets]   = useState(TICKETS_INIT)
  const [ticketFilter, setTicketFilter] = useState('all')
  const [toast, setToast]       = useState('')

  /* ── New ticket form state ──────────────────────────────────── */
  const FORM_BLANK = { subject: '', category: '', priority: 'medium', message: '', rating: 0 }
  const [form, setForm]         = useState(FORM_BLANK)
  const [formErrors, setFormErrors] = useState({})
  const [submitted, setSubmitted]   = useState(false)
  const [hoverStar, setHoverStar]   = useState(0)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const setF = (k) => (e) => setForm(prev => ({ ...prev, [k]: typeof e === 'object' ? e.target.value : e }))

  const validateForm = () => {
    const e = {}
    if (!form.subject.trim())  e.subject  = 'Vui lòng nhập tiêu đề'
    if (!form.category)        e.category = 'Vui lòng chọn danh mục'
    if (form.message.trim().length < 20) e.message = 'Mô tả tối thiểu 20 ký tự'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    const newTicket = {
      id: `#TKT-${Date.now().toString().slice(-7)}`,
      subject: form.subject,
      category: form.category,
      status: 'open',
      priority: form.priority,
      created: new Date().toLocaleDateString('vi-VN'),
      lastReply: new Date().toLocaleDateString('vi-VN'),
      messages: 1,
    }
    setTickets(prev => [newTicket, ...prev])
    setForm(FORM_BLANK)
    setSubmitted(true)
    showToast('Gửi yêu cầu thành công! Chúng tôi sẽ phản hồi trong 24 giờ.')
    setTimeout(() => { setSubmitted(false); setTab('tickets') }, 2000)
  }

  const activeFaq   = FAQ_DATA.find(c => c.id === faqCat)
  const filtTickets = ticketFilter === 'all' ? tickets : tickets.filter(t => t.status === ticketFilter)

  const priorityStyle = {
    low:    { label: 'Thấp',    color: 'bg-gray-100 text-gray-600 border-gray-200'         },
    medium: { label: 'Trung bình', color: 'bg-orange-50 text-[#E8420A] border-orange-200'  },
    high:   { label: 'Cao',     color: 'bg-orange-50 text-orange-700 border-orange-200'    },
    urgent: { label: 'Khẩn',   color: 'bg-red-50 text-red-700 border-red-200'             },
  }

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* ── Contact channels ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            ),
            title: 'Hotline',
            value: '1800 1234',
            sub: 'Miễn phí · 8:00–22:00',
            color: 'bg-green-50 border-green-100',
            iconBg: 'bg-green-600',
            cta: 'Gọi ngay',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
            title: 'Email',
            value: 'support@techgadget.vn',
            sub: 'Phản hồi trong 24 giờ',
            color: 'bg-gray-50 border-gray-200',
            iconBg: 'bg-gray-700',
            cta: 'Gửi email',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h7l4 4 4-4h3a2 2 0 002-2V5a2 2 0 00-2-2z" />
              </svg>
            ),
            title: 'Live Chat',
            value: 'Chat trực tuyến',
            sub: 'Phản hồi dưới 5 phút',
            color: 'bg-orange-50 border-orange-100',
            iconBg: 'bg-[#E8420A]',
            cta: 'Bắt đầu chat',
          },
        ].map((c, i) => (
          <div key={i} className={`rounded border p-5 ${c.color} flex flex-col gap-3`}>
            <div className={`w-11 h-11 rounded ${c.iconBg} text-white flex items-center justify-center shadow-sm`}>
              {c.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{c.title}</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
            <button className="w-full text-xs font-bold text-white py-2 rounded transition-colors shadow-sm bg-[#E8420A] hover:bg-[#c93808]">
              {c.cta}
            </button>
          </div>
        ))}
      </div>

      {/* ── Main panel ───────────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center border-b border-gray-200 px-2 pt-2 gap-1">
          {[
            { id: 'faq',     label: 'Câu hỏi thường gặp', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'new',     label: 'Gửi yêu cầu',         icon: 'M12 4v16m8-8H4' },
            { id: 'tickets', label: 'Lịch sử phiếu',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', badge: tickets.filter(t => t.status === 'open' || t.status === 'processing').length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-[#E8420A] text-[#E8420A]' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.icon} />
              </svg>
              {t.label}
              {t.badge > 0 && (
                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${tab === t.id ? 'bg-orange-100 text-[#E8420A]' : 'bg-orange-100 text-orange-700'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── FAQ TAB ─────────────────────────────────────────── */}
        {tab === 'faq' && (
          <div>
            {/* Category pills */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto">
              {FAQ_DATA.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCat(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded text-xs font-bold transition-colors ${
                    faqCat === cat.id
                      ? 'bg-[#E8420A] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Accordion */}
            {activeFaq && <FaqAccordion items={activeFaq.items} />}

            {/* Bottom CTA */}
            <div className="px-6 py-5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Không tìm thấy câu trả lời bạn cần?</p>
              <button
                onClick={() => setTab('new')}
                className="text-sm font-bold text-[#E8420A] hover:text-[#c93808] flex items-center gap-1.5 transition-colors"
              >
                Gửi yêu cầu hỗ trợ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── NEW TICKET TAB ──────────────────────────────────── */}
        {tab === 'new' && (
          <div className="p-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-gray-900">Đã gửi yêu cầu!</h3>
                <p className="text-sm text-gray-500 mt-2">Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
                <p className="text-xs text-gray-400 mt-1">Đang chuyển đến lịch sử phiếu...</p>
              </div>
            ) : (
              <div className="space-y-5 max-w-2xl">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Tiêu đề yêu cầu <span className="text-red-500">*</span></label>
                  <input
                    value={form.subject}
                    onChange={setF('subject')}
                    placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải..."
                    className={`w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${formErrors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  {formErrors.subject && <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>}
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                    <select
                      value={form.category}
                      onChange={setF('category')}
                      className={`w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${formErrors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {SUPPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Mức độ ưu tiên</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: 'low', l: 'Thấp' }, { v: 'medium', l: 'Trung bình' },
                        { v: 'high', l: 'Cao' }, { v: 'urgent', l: 'Khẩn' },
                      ].map(p => (
                        <label key={p.v} className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all text-xs font-bold ${
                          form.priority === p.v
                            ? priorityStyle[p.v].color + ' ring-1 ring-offset-1 ' + (p.v === 'urgent' ? 'ring-red-400' : p.v === 'high' ? 'ring-orange-400' : p.v === 'medium' ? 'ring-[#E8420A]/40' : 'ring-gray-400')
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                          <input type="radio" name="priority" value={p.v} checked={form.priority === p.v} onChange={setF('priority')} className="hidden" />
                          <span className={`w-2 h-2 rounded-full ${form.priority === p.v ? (p.v === 'urgent' ? 'bg-red-500' : p.v === 'high' ? 'bg-orange-500' : p.v === 'medium' ? 'bg-[#E8420A]' : 'bg-gray-400') : 'bg-gray-300'}`} />
                          {p.l}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Nội dung chi tiết <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.message}
                    onChange={setF('message')}
                    rows={6}
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải: thời gian xảy ra, mã đơn hàng liên quan (nếu có), các bước đã thực hiện..."
                    className={`w-full border rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors resize-none leading-relaxed ${formErrors.message ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {formErrors.message
                      ? <p className="text-xs text-red-500">{formErrors.message}</p>
                      : <p className="text-xs text-gray-400">Tối thiểu 20 ký tự</p>
                    }
                    <p className={`text-xs font-medium ${form.message.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>{form.message.length} ký tự</p>
                  </div>
                </div>

                {/* File attach hint */}
                <div className="border-2 border-dashed border-gray-200 rounded px-5 py-4 flex items-center gap-4 hover:border-[#E8420A]/40 hover:bg-orange-50/20 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Đính kèm ảnh / video</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, MP4 — tối đa 20MB mỗi file (tối đa 5 file)</p>
                  </div>
                </div>

                {/* Rating (optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Đánh giá trải nghiệm gần đây <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setF('rating')(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <svg className={`w-7 h-7 transition-colors ${star <= (hoverStar || form.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                    {form.rating > 0 && (
                      <span className="text-sm font-semibold text-amber-600 ml-2">
                        {['', 'Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'][form.rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-400">Chúng tôi sẽ phản hồi qua email <span className="font-semibold text-gray-600">alex@example.com</span></p>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TICKETS TAB ─────────────────────────────────────── */}
        {tab === 'tickets' && (
          <div>
            {/* Filter bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto">
              {[
                { id: 'all',        label: 'Tất cả', count: tickets.length },
                { id: 'open',       label: 'Mới',    count: tickets.filter(t => t.status === 'open').length },
                { id: 'processing', label: 'Đang xử lý', count: tickets.filter(t => t.status === 'processing').length },
                { id: 'resolved',   label: 'Đã giải quyết', count: tickets.filter(t => t.status === 'resolved').length },
                { id: 'closed',     label: 'Đã đóng', count: tickets.filter(t => t.status === 'closed').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTicketFilter(f.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition-colors ${
                    ticketFilter === f.id ? 'bg-[#E8420A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${ticketFilter === f.id ? 'bg-white/20 text-white' : 'bg-white text-gray-500'}`}>{f.count}</span>
                </button>
              ))}
              <button
                onClick={() => setTab('new')}
                className="shrink-0 flex items-center gap-1.5 ml-auto px-4 py-2 text-xs font-bold text-[#E8420A] border border-orange-200 hover:bg-orange-50 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tạo phiếu mới
              </button>
            </div>

            {/* Ticket list */}
            {filtTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-600">Không có phiếu nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtTickets.map(ticket => {
                  const st = TICKET_STATUS[ticket.status]
                  const pr = priorityStyle[ticket.priority]
                  return (
                    <div key={ticket.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Status indicator */}
                        <div className={`w-2 h-2 rounded-full ${st.dot} mt-2 shrink-0`} />

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs font-black text-gray-400 font-mono">{ticket.id}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.text} ${st.bg}`}>{st.label}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${pr.color}`}>{pr.label}</span>
                          </div>

                          {/* Subject */}
                          <p className="text-sm font-bold text-gray-900 leading-snug">{ticket.subject}</p>

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {ticket.category}
                            </span>
                            <span>·</span>
                            <span>Tạo: {ticket.created}</span>
                            <span>·</span>
                            <span>Cập nhật: {ticket.lastReply}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h7l4 4 4-4h3a2 2 0 002-2V5a2 2 0 00-2-2z" />
                              </svg>
                              {ticket.messages} tin nhắn
                            </span>
                          </div>
                        </div>

                        {/* View button */}
                        <button className="shrink-0 text-xs font-bold text-[#E8420A] border border-orange-200 hover:bg-orange-50 px-4 py-2 rounded transition-colors">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── AddressSection ──────────────────────────────────────────── */

const ADDR_BLANK = { name: '', phone: '', province: '', district: '', ward: '', detail: '', type: 'home', isDefault: false }

function AddressModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? ADDR_BLANK)
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm(prev => {
    const next = { ...prev, [k]: e.target.value }
    if (k === 'province') { next.district = ''; next.ward = '' }
    if (k === 'district') { next.ward = '' }
    return next
  })

  const availableDistricts = DISTRICTS[form.province] ?? []
  const availableWards     = WARDS[form.district]    ?? []

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Vui lòng nhập họ tên'
    if (!form.phone.trim())    e.phone    = 'Vui lòng nhập số điện thoại'
    if (!form.province)        e.province = 'Vui lòng chọn tỉnh/thành phố'
    if (!form.district)        e.district = 'Vui lòng chọn quận/huyện'
    if (!form.ward)            e.ward     = 'Vui lòng chọn phường/xã'
    if (!form.detail.trim())   e.detail   = 'Vui lòng nhập địa chỉ cụ thể'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (validate()) onSave(form)
  }

  const inputCls = (key) =>
    `w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition-colors ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t z-10">
          <div>
            <h2 className="text-base font-black text-gray-900">{initial ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin để đặt hàng chính xác</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <div className="px-7 py-6 space-y-5">

          {/* Họ tên + SĐT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" className={inputCls('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input value={form.phone} onChange={set('phone')} placeholder="0901234567" maxLength={10} className={inputCls('phone')} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Tỉnh/Thành */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tỉnh / Thành phố <span className="text-red-500">*</span>
            </label>
            <select value={form.province} onChange={set('province')} className={inputCls('province')}>
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
          </div>

          {/* Quận/Huyện + Phường/Xã */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Quận / Huyện <span className="text-red-500">*</span>
              </label>
              <select value={form.district} onChange={set('district')} disabled={!form.province} className={inputCls('district') + (!form.province ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">-- Chọn quận/huyện --</option>
                {availableDistricts.length > 0
                  ? availableDistricts.map(d => <option key={d} value={d}>{d}</option>)
                  : form.province && <option value={form.district || '_custom'}>{form.district || '(Nhập tay bên dưới)'}</option>
                }
              </select>
              {availableDistricts.length === 0 && form.province && (
                <input value={form.district} onChange={set('district')} placeholder="Nhập quận/huyện" className={`${inputCls('district')} mt-2`} />
              )}
              {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Phường / Xã <span className="text-red-500">*</span>
              </label>
              <select value={form.ward} onChange={set('ward')} disabled={!form.district} className={inputCls('ward') + (!form.district ? ' opacity-50 cursor-not-allowed' : '')}>
                <option value="">-- Chọn phường/xã --</option>
                {availableWards.length > 0
                  ? availableWards.map(w => <option key={w} value={w}>{w}</option>)
                  : form.district && <option value={form.ward || '_custom'}>{form.ward || '(Nhập tay bên dưới)'}</option>
                }
              </select>
              {availableWards.length === 0 && form.district && (
                <input value={form.ward} onChange={set('ward')} placeholder="Nhập phường/xã" className={`${inputCls('ward')} mt-2`} />
              )}
              {errors.ward && <p className="text-xs text-red-500 mt-1">{errors.ward}</p>}
            </div>
          </div>

          {/* Địa chỉ cụ thể */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <input
              value={form.detail}
              onChange={set('detail')}
              placeholder="Số nhà, tên đường, tên tòa nhà..."
              className={inputCls('detail')}
            />
            {errors.detail && <p className="text-xs text-red-500 mt-1">{errors.detail}</p>}
          </div>

          {/* Loại địa chỉ */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Loại địa chỉ</label>
            <div className="flex gap-3">
              {[
                { v: 'home',   l: 'Nhà riêng',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { v: 'office', l: 'Công ty',     icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { v: 'other',  l: 'Khác',        icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
              ].map(t => (
                <label key={t.v} className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded border cursor-pointer transition-all ${
                  form.type === t.v
                    ? 'border-[#E8420A] bg-orange-50 text-[#E8420A]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input type="radio" name="addrType" value={t.v} checked={form.type === t.v} onChange={set('type')} className="hidden" />
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.icon} />
                  </svg>
                  <span className="text-sm font-semibold">{t.l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Đặt làm mặc định */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                form.isDefault ? 'bg-[#E8420A] border-[#E8420A]' : 'border-gray-300 hover:border-[#E8420A]'
              }`}
            >
              {form.isDefault && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Đặt làm địa chỉ mặc định</p>
              <p className="text-xs text-gray-400 mt-0.5">Địa chỉ này sẽ được chọn tự động khi đặt hàng</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50/60 rounded-b sticky bottom-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
            Huỷ bỏ
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors">
            {initial ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddressSection() {
  const [addresses, setAddresses]   = useState(ADDRESSES_INIT)
  const [modal, setModal]           = useState(null)   // null | 'add' | { editId }
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast]           = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleSave = (form) => {
    if (modal === 'add') {
      const newAddr = { ...form, id: Date.now(), isDefault: form.isDefault || addresses.length === 0 }
      setAddresses(prev => {
        const list = form.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev
        return [...list, newAddr]
      })
      showToast('Thêm địa chỉ thành công!')
    } else {
      setAddresses(prev => {
        let list = form.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev
        return list.map(a => a.id === modal.editId ? { ...form, id: a.id } : a)
      })
      showToast('Cập nhật địa chỉ thành công!')
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    setAddresses(prev => {
      const remaining = prev.filter(a => a.id !== id)
      if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
        remaining[0].isDefault = true
      }
      return remaining
    })
    setDeletingId(null)
    showToast('Đã xoá địa chỉ.')
  }

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
    showToast('Đã đặt làm địa chỉ mặc định!')
  }

  const typeInfo = {
    home:   { label: 'Nhà riêng', color: 'bg-orange-50 text-[#E8420A] border-orange-200', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    office: { label: 'Công ty',   color: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    other:  { label: 'Khác',      color: 'bg-gray-50 text-gray-600 border-gray-200',   icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  }

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-3 rounded shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Sổ địa chỉ</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {addresses.length === 0 ? 'Chưa có địa chỉ nào' : `${addresses.length} địa chỉ đã lưu`}
            </p>
          </div>
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Thêm địa chỉ mới
          </button>
        </div>

        {/* Address list */}
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-t border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-600">Bạn chưa có địa chỉ nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm địa chỉ để đặt hàng nhanh hơn</p>
            <button
              onClick={() => setModal('add')}
              className="mt-5 flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {addresses.map(addr => {
              const ti = typeInfo[addr.type] ?? typeInfo.other
              const fullAddr = [addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')
              return (
                <div
                  key={addr.id}
                  className={`px-6 py-5 transition-colors ${addr.isDefault ? 'bg-orange-50/40' : 'hover:bg-gray-50/60'}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded border flex items-center justify-center shrink-0 ${ti.color}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ti.icon} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{addr.name}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{addr.phone}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ti.color}`}>{ti.label}</span>
                        {addr.isDefault && (
                          <span className="text-xs font-black text-[#E8420A] bg-orange-100 border border-orange-200 px-2 py-0.5 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{fullAddr}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-3">
                        <button
                          onClick={() => setModal({ editId: addr.id })}
                          className="text-xs font-semibold text-[#E8420A] hover:text-[#c93808] hover:bg-orange-50 border border-orange-200 px-3 py-1.5 rounded transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded transition-colors"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingId(addr.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded transition-colors ml-1"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete confirm inline */}
                  {deletingId === addr.id && (
                    <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded px-4 py-3">
                      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm font-semibold text-red-700 flex-1">Xác nhận xoá địa chỉ này?</p>
                      <button onClick={() => setDeletingId(null)} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-white border border-gray-200 transition-colors">Huỷ</button>
                      <button onClick={() => handleDelete(addr.id)} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded transition-colors">Xoá</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Địa chỉ <span className="font-black">mặc định</span> sẽ được tự động chọn khi bạn đặt hàng. Bạn vẫn có thể thay đổi địa chỉ giao hàng ở bước xác nhận đơn.
        </p>
      </div>

      {/* Modal */}
      {modal && (
        <AddressModal
          initial={modal !== 'add' ? addresses.find(a => a.id === modal.editId) : null}
          onClose={() => { setModal(null); setDeletingId(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

/* ── Field component dùng chung trong AccountSection ─────────── */
function Field({ label, value, editing, children, verified }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <p className="w-44 text-sm font-semibold text-gray-500 shrink-0 pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {editing ? (
          children
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">{value}</p>
            {verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Đã xác minh
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AccountSection() {
  const fileRef = useRef(null)
  const [avatarSrc, setAvatarSrc] = useState(null)

  /* ── Personal info state ──────────────────────────────────── */
  const INIT = {
    firstName: 'Alex',
    lastName:  'Johnson',
    phone:     '0961234535',
    email:     'alex@example.com',
    dob:       '1998-06-01',
    gender:    'male',
    bio:       '',
  }
  const [info, setInfo]       = useState(INIT)
  const [draft, setDraft]     = useState(INIT)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]     = useState(false)

  const handleSave = () => {
    setInfo(draft)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  const handleCancel = () => {
    setDraft(info)
    setEditing(false)
  }
  const set = (k) => (e) => setDraft(prev => ({ ...prev, [k]: e.target.value }))

  /* ── Password state ────────────────────────────────────────── */
  const [pwSection, setPwSection] = useState(false)
  const [pw, setPw]               = useState({ current: '', next: '', confirm: '' })
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false })
  const [pwSaved, setPwSaved]     = useState(false)
  const [pwError, setPwError]     = useState('')

  const setPwField = (k) => (e) => setPw(prev => ({ ...prev, [k]: e.target.value }))
  const togglePwVisible = (k) => setPwVisible(prev => ({ ...prev, [k]: !prev[k] }))

  const handleSavePw = () => {
    if (!pw.current) { setPwError('Vui lòng nhập mật khẩu hiện tại.'); return }
    if (pw.next.length < 8) { setPwError('Mật khẩu mới phải có ít nhất 8 ký tự.'); return }
    if (pw.next !== pw.confirm) { setPwError('Mật khẩu xác nhận không khớp.'); return }
    setPwError('')
    setPwSaved(true)
    setPw({ current: '', next: '', confirm: '' })
    setTimeout(() => { setPwSaved(false); setPwSection(false) }, 2000)
  }

  /* ── 2FA state ─────────────────────────────────────────────── */
  const [twoFa, setTwoFa] = useState(true)

  /* ── Avatar upload ─────────────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarSrc(url)
  }

  const genderLabel = { male: 'Nam', female: 'Nữ', other: 'Khác' }
  const dobDisplay  = info.dob
    ? new Date(info.dob).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  /* ── Strength meter ────────────────────────────────────────── */
  const strength = (() => {
    const v = pw.next
    if (!v) return 0
    let s = 0
    if (v.length >= 8)           s++
    if (/[A-Z]/.test(v))         s++
    if (/[0-9]/.test(v))         s++
    if (/[^A-Za-z0-9]/.test(v)) s++
    return s
  })()
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

  return (
    <div className="space-y-5">

      {/* ── Avatar + name hero ────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {/* Top strip */}
        <div className="h-24 bg-gradient-to-r from-[#E8420A] to-[#c93808]" />

        <div className="px-8 pb-6 -mt-12 flex items-end gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden bg-gradient-to-br from-[#E8420A] to-[#c93808] flex items-center justify-center">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-white text-3xl font-black">AJ</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#E8420A] hover:bg-[#c93808] text-white rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name block */}
          <div className="flex-1 pt-14">
            <h2 className="text-xl font-black text-gray-900">{info.firstName} {info.lastName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{info.email}</p>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex items-center gap-2 pt-14">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Đã lưu
              </span>
            )}
            {editing ? (
              <>
                <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">Huỷ</button>
                <button onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded transition-colors shadow-sm">Lưu thay đổi</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-300 hover:border-[#E8420A] hover:text-[#E8420A] rounded transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal information ───────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Thông tin cá nhân</h3>
            <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>
          {editing && (
            <span className="text-xs font-semibold text-[#E8420A] bg-orange-50 border border-orange-200 px-3 py-1 rounded">Đang chỉnh sửa</span>
          )}
        </div>

        <div className="px-8 py-2">
          {/* Họ */}
          <Field label="Họ" value={info.firstName} editing={editing}>
            <input
              value={draft.firstName}
              onChange={set('firstName')}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A]"
              placeholder="Nhập họ"
            />
          </Field>

          {/* Tên */}
          <Field label="Tên" value={info.lastName} editing={editing}>
            <input
              value={draft.lastName}
              onChange={set('lastName')}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A]"
              placeholder="Nhập tên"
            />
          </Field>

          {/* Số điện thoại */}
          <Field
            label="Số điện thoại"
            value={info.phone.replace(/^(\d{3})\d{4}(\d{2})$/, '$1·····$2')}
            editing={editing}
            verified
          >
            <div className="flex gap-2">
              <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2.5 bg-gray-50 text-sm text-gray-600 shrink-0">
                <span className="text-base">🇻🇳</span>
                <span>+84</span>
              </div>
              <input
                value={draft.phone}
                onChange={set('phone')}
                className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A]"
                placeholder="Số điện thoại"
                maxLength={10}
              />
            </div>
          </Field>

          {/* Email */}
          <Field label="Email" value={info.email} editing={editing} verified>
            <div className="flex gap-2">
              <input
                value={draft.email}
                onChange={set('email')}
                type="email"
                className="flex-1 border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A]"
                placeholder="Địa chỉ email"
              />
              <button className="text-sm font-semibold text-[#E8420A] border border-orange-200 hover:bg-orange-50 px-4 rounded transition-colors shrink-0">
                Xác minh
              </button>
            </div>
          </Field>

          {/* Ngày sinh */}
          <Field label="Ngày sinh" value={dobDisplay} editing={editing}>
            <input
              value={draft.dob}
              onChange={set('dob')}
              type="date"
              className="border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A]"
            />
          </Field>

          {/* Giới tính */}
          <Field label="Giới tính" value={genderLabel[info.gender] ?? '—'} editing={editing}>
            <div className="flex gap-3">
              {[{ v: 'male', l: 'Nam' }, { v: 'female', l: 'Nữ' }, { v: 'other', l: 'Khác' }].map(g => (
                <label key={g.v} className={`flex items-center gap-2 px-4 py-2 rounded border cursor-pointer transition-colors text-sm font-medium ${
                  draft.gender === g.v
                    ? 'border-[#E8420A] bg-orange-50 text-[#E8420A]'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>
                  <input type="radio" name="gender" value={g.v} checked={draft.gender === g.v} onChange={set('gender')} className="hidden" />
                  {draft.gender === g.v
                    ? <span className="w-4 h-4 rounded-full bg-[#E8420A] flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-white" /></span>
                    : <span className="w-4 h-4 rounded-full border-2 border-gray-400" />
                  }
                  {g.l}
                </label>
              ))}
            </div>
          </Field>

          {/* Giới thiệu */}
          <Field label="Giới thiệu" value={info.bio || <span className="text-gray-400 italic">Chưa có thông tin</span>} editing={editing}>
            <textarea
              value={draft.bio}
              onChange={set('bio')}
              rows={3}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] resize-none"
              placeholder="Viết vài dòng giới thiệu về bản thân..."
            />
          </Field>
        </div>

        {/* Bottom action bar — only in edit mode */}
        {editing && (
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between rounded-b">
            <p className="text-xs text-gray-400">Các trường có dấu <span className="text-green-600 font-bold">Đã xác minh</span> cần xác minh lại nếu thay đổi.</p>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors">Huỷ bỏ</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded transition-colors shadow-sm">Lưu thay đổi</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Password change ────────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setPwSection(v => !v)}
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-gray-50/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Đổi mật khẩu</p>
              <p className="text-xs text-gray-400 mt-0.5">Đổi lần cuối 2 tháng trước</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${pwSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {pwSection && (
          <div className="px-8 pb-6 border-t border-gray-100">
            <div className="pt-5 space-y-4 max-w-md">
              {/* Current password */}
              {[
                { key: 'current', label: 'Mật khẩu hiện tại',  placeholder: 'Nhập mật khẩu hiện tại' },
                { key: 'next',    label: 'Mật khẩu mới',        placeholder: 'Tối thiểu 8 ký tự' },
                { key: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type={pwVisible[f.key] ? 'text' : 'password'}
                      value={pw[f.key]}
                      onChange={setPwField(f.key)}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-300 rounded px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A]"
                    />
                    <button
                      type="button"
                      onClick={() => togglePwVisible(f.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {pwVisible[f.key] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {/* Strength meter */}
              {pw.next && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][strength]}`}>
                    Độ mạnh: {strengthLabel[strength]}
                  </p>
                </div>
              )}

              {pwError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pwError}
                </div>
              )}

              {pwSaved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-3">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Đổi mật khẩu thành công!
                </div>
              )}

              <button
                onClick={handleSavePw}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] rounded transition-colors shadow-sm"
              >
                Xác nhận đổi mật khẩu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2FA & Security ────────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Bảo mật tài khoản</h3>
            <p className="text-xs text-gray-400 mt-0.5">Bảo vệ tài khoản của bạn với lớp xác thực bổ sung</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 2FA toggle */}
          <div className="flex items-center justify-between p-4 rounded bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded flex items-center justify-center ${twoFa ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg className={`w-5 h-5 ${twoFa ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2v-1a7 7 0 00-14 0v1a2 2 0 002 2zM12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Xác thực 2 bước (2FA)</p>
                <p className={`text-xs font-bold mt-0.5 ${twoFa ? 'text-green-600' : 'text-gray-400'}`}>{twoFa ? 'Đang bật — Xác thực qua SMS' : 'Chưa bật'}</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFa(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${twoFa ? 'bg-[#E8420A]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${twoFa ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Login devices */}
          <div className="p-4 rounded bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Thiết bị đang đăng nhập</p>
              <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Đăng xuất tất cả</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Chrome · Windows 11', loc: 'Hà Nội, Việt Nam', time: 'Hiện tại', current: true },
                { name: 'Safari · iPhone 15',  loc: 'TP. Hồ Chí Minh',  time: '2 ngày trước', current: false },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.loc} · {d.time}</p>
                  </div>
                  {d.current
                    ? <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Thiết bị này</span>
                    : <button className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">Đăng xuất</button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Linked accounts ────────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Tài khoản liên kết</h3>
        <p className="text-xs text-gray-400 mb-5">Đăng nhập nhanh hơn bằng tài khoản mạng xã hội</p>
        <div className="space-y-3">
          {[
            {
              name: 'Google', linked: true, email: 'alex@gmail.com',
              icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              ),
            },
            {
              name: 'Facebook', linked: false, email: null,
              icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              ),
            },
          ].map(acc => (
            <div key={acc.name} className="flex items-center gap-4 p-4 rounded border border-gray-200 bg-gray-50/50">
              <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                {acc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{acc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{acc.linked ? acc.email : 'Chưa liên kết'}</p>
              </div>
              {acc.linked ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">Đã liên kết</span>
                  <button className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 border border-transparent hover:border-red-100">Huỷ</button>
                </div>
              ) : (
                <button className="text-sm font-bold text-[#E8420A] border border-orange-200 hover:bg-orange-50 px-4 py-1.5 rounded transition-colors">
                  Liên kết
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function MembershipSection() {
  const currentTier = MEMBERSHIP_TIERS[3]           // Elite
  const nextTier    = MEMBERSHIP_TIERS[4]           // Elite+
  const spend       = 21875000
  const nextTarget  = nextTier.min                  // 100 000 000
  const pct         = Math.round((spend / nextTarget) * 100)
  const remaining   = nextTarget - spend
  const [histTab, setHistTab] = useState('all')

  const filteredHist = histTab === 'all' ? POINTS_HISTORY
    : POINTS_HISTORY.filter(h => h.type === histTab)

  return (
    <div className="space-y-5">

      {/* ── Current tier hero card ───────────────────────────── */}
      <div className="rounded overflow-hidden shadow-sm border border-gray-200">
        <div className="bg-gradient-to-br from-[#0D0F14] via-gray-800 to-gray-900 px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white/70 mb-1">Hạng thành viên hiện tại</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-black text-white">Elite</span>
                <span className="px-3 py-1 bg-white/20 border border-white/30 text-white text-xs font-black rounded-full">T-MEM</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black text-white">1.250</span>
                <span className="text-lg font-semibold text-white/70">điểm</span>
              </div>
              <p className="text-sm text-white/60 mt-1">Tổng chi tiêu tích lũy: <span className="font-bold text-white">21.875.000đ</span></p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white/80">Tiến trình lên hạng <span className="text-white font-black">Elite+</span></p>
              <span className="text-sm font-black text-white">{pct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-white/60 mt-2">
              Cần thêm <span className="font-black text-white">{remaining.toLocaleString('vi-VN')}đ</span> chi tiêu để lên hạng Elite+
            </p>
          </div>
        </div>

        {/* Benefits summary strip */}
        <div className="bg-white px-8 py-4 flex items-center gap-6 border-t border-gray-200">
          {[
            { icon: '3x', label: 'Nhân điểm' },
            { icon: '🚀', label: 'Giao hỏa tốc' },
            { icon: 'VIP', label: 'Hỗ trợ 24/7' },
            { icon: '🎁', label: 'Quà tháng' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#E8420A] font-semibold">
              <span className="w-9 h-9 rounded bg-orange-50 border border-orange-100 flex items-center justify-center text-xs font-black">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tier roadmap ─────────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-5">Lộ trình hạng thành viên</h3>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
          <div className="flex items-start justify-between relative z-10">
            {MEMBERSHIP_TIERS.map((tier, i) => {
              const isActive  = tier.id === 'elite'
              const isPast    = i < 3
              const isFuture  = i > 3
              return (
                <div key={tier.id} className="flex flex-col items-center gap-2 w-1/5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2
                    ${isActive ? `${tier.color} text-white border-transparent ring-4 ${tier.ring} shadow-md`
                      : isPast  ? `${tier.color} text-white border-transparent opacity-80`
                      : 'bg-white border-gray-300 text-gray-400'}`}
                  >
                    {isPast || isActive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs font-bold text-center ${isActive ? tier.text : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                    {tier.label}
                  </span>
                  {tier.min > 0 && (
                    <span className="text-[10px] text-gray-400 text-center leading-tight">
                      {(tier.min / 1000000).toFixed(0)}tr đ
                    </span>
                  )}
                  {isActive && <span className="text-[10px] font-black text-[#E8420A] bg-orange-50 px-1.5 py-0.5 rounded">Của bạn</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Benefits grid for current tier ───────────────────── */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Quyền lợi hạng Elite</h3>
          <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-[#E8420A] rounded">6 quyền lợi</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TIER_BENEFITS.elite.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded bg-orange-50/50 border border-orange-100">
              <div className="w-6 h-6 rounded-full bg-[#E8420A] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-800 leading-snug">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Elite+ preview */}
        <div className="mt-4 p-4 rounded bg-gray-50 border border-gray-200">
          <p className="text-xs font-bold text-gray-700 mb-2">Thêm quyền lợi khi lên hạng Elite+ ✨</p>
          <div className="flex flex-wrap gap-2">
            {TIER_BENEFITS.eliteplus.slice(4).map((b, i) => (
              <span key={i} className="text-xs bg-white border border-gray-300 text-gray-700 font-semibold px-2.5 py-1 rounded">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Points history ───────────────────────────────────── */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Lịch sử điểm thưởng</h3>
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'earn', label: 'Tích điểm' },
              { id: 'redeem', label: 'Đổi điểm' },
              { id: 'bonus', label: 'Thưởng' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setHistTab(t.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  histTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredHist.map(h => (
            <div key={h.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                h.type === 'earn'   ? 'bg-green-100' :
                h.type === 'redeem' ? 'bg-orange-100' : 'bg-purple-100'
              }`}>
                {h.type === 'earn' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ) : h.type === 'redeem' ? (
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{h.desc}</p>
                <p className="text-xs text-gray-400 mt-0.5">{h.date}</p>
              </div>
              <span className={`text-base font-black ${h.points > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                {h.points > 0 ? '+' : ''}{h.points} điểm
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CouponsSection() {
  const [tab, setTab]       = useState('active')
  const [copied, setCopied] = useState(null)

  const filtered = tab === 'all' ? COUPONS_DATA : COUPONS_DATA.filter(c => c.status === tab)

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  const valueLabel = (c) => {
    if (c.type === 'percent') return `Giảm ${c.value}%`
    if (c.type === 'flat')    return `Giảm ${c.value.toLocaleString('vi-VN')}đ`
    if (c.type === 'ship')    return 'Miễn ship'
    if (c.type === 'points')  return `x${c.value} điểm`
    return ''
  }

  return (
    <div className="space-y-5">

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mã còn hiệu lực', value: COUPONS_DATA.filter(c => c.status === 'active').length, color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Mã đã sử dụng',   value: COUPONS_DATA.filter(c => c.status === 'used').length,    color: 'bg-gray-50 border-gray-200 text-gray-600'   },
          { label: 'Mã hết hạn',       value: COUPONS_DATA.filter(c => c.status === 'expired').length, color: 'bg-gray-50 border-gray-200 text-gray-500'   },
        ].map((s, i) => (
          <div key={i} className={`rounded border px-5 py-4 text-center ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coupon list */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 px-2 pt-2 gap-1">
          {[
            { id: 'active',  label: 'Còn hiệu lực' },
            { id: 'used',    label: 'Đã dùng'       },
            { id: 'expired', label: 'Hết hạn'        },
            { id: 'all',     label: 'Tất cả'          },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-[#E8420A] text-[#E8420A]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {t.id === 'all' ? COUPONS_DATA.length : COUPONS_DATA.filter(c => c.status === t.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Không có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 gap-4">
            {filtered.map(coupon => {
              const isInactive = coupon.status !== 'active'
              return (
                <div
                  key={coupon.id}
                  className={`rounded overflow-hidden border transition-shadow ${
                    isInactive ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex">
                    {/* Left gradient strip */}
                    <div className={`bg-gradient-to-b ${coupon.color} w-3 shrink-0 ${isInactive ? 'opacity-40' : ''}`} />

                    {/* Content */}
                    <div className="flex-1 flex items-stretch">
                      {/* Main info */}
                      <div className="flex-1 px-5 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-black px-2.5 py-1 rounded ${coupon.badge}`}>
                            {valueLabel(coupon)}
                          </span>
                          {coupon.status === 'used'    && <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Đã dùng</span>}
                          {coupon.status === 'expired' && <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded">Hết hạn</span>}
                        </div>
                        <p className="text-sm font-bold text-gray-900 leading-snug">{coupon.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{coupon.desc}</p>
                        <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
                          {coupon.minOrder > 0 && (
                            <span>Đơn tối thiểu: <span className="font-semibold text-gray-600">{coupon.minOrder.toLocaleString('vi-VN')}đ</span></span>
                          )}
                          <span>HSD: <span className="font-semibold text-gray-600">{coupon.exp}</span></span>
                        </div>
                      </div>

                      {/* Divider + code */}
                      <div className="flex items-center">
                        <div className="h-full w-px border-l border-dashed border-gray-200 mx-1" />
                        <div className="px-5 py-4 flex flex-col items-center justify-center gap-2.5 min-w-[120px]">
                          <span className="font-mono text-sm font-black text-gray-800 tracking-widest">{coupon.code}</span>
                          {!isInactive ? (
                            <button
                              onClick={() => handleCopy(coupon.code)}
                              className={`text-xs font-bold px-4 py-1.5 rounded transition-all ${
                                copied === coupon.code
                                  ? 'bg-green-500 text-white'
                                  : 'bg-[#E8420A] hover:bg-[#c93808] text-white'
                              }`}
                            >
                              {copied === coupon.code ? '✓ Đã sao chép' : 'Sao chép'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Không khả dụng</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer note */}
        {tab === 'active' && filtered.length > 0 && (
          <div className="px-5 pb-5">
            <p className="text-xs text-gray-400 text-center bg-gray-50 rounded py-3">
              Mã giảm giá sẽ được áp dụng tự động hoặc nhập thủ công tại trang <span className="font-semibold">Xác nhận đặt hàng</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────── WISHLIST SECTION ─────────────────── */

const CATEGORY_STYLE = {
  'Laptop':         { bg: 'from-slate-600 to-slate-800' },
  'Điện thoại':     { bg: 'from-slate-600 to-slate-800' },
  'Tai nghe':       { bg: 'from-purple-500 to-violet-600' },
  'Màn hình':       { bg: 'from-teal-500 to-cyan-600' },
  'Máy tính bảng':  { bg: 'from-orange-400 to-amber-500' },
}

function ProductThumb({ category }) {
  const bg = CATEGORY_STYLE[category]?.bg || 'from-gray-400 to-gray-600'
  const icons = {
    'Laptop': <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 3a2 2 0 000 4h6a2 2 0 000-4M9 3h6M3 19h18" />,
    'Điện thoại': <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    'Tai nghe': <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />,
    'Màn hình': <><rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" /></>,
    'Máy tính bảng': <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${bg} flex items-center justify-center`}>
      <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        {icons[category] || <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />}
      </svg>
    </div>
  )
}

function WishlistSection() {
  const [items, setItems] = useState(() => WISHLIST_DATA)
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('grid')
  const [toast, setToast] = useState('')
  const [removing, setRemoving] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }
  const fmt = (n) => n.toLocaleString('vi-VN') + '₫'
  const getDiscount = (item) => item.original ? Math.round((1 - item.price / item.original) * 100) : 0

  const removeItem = (id) => {
    setRemoving(id)
    setTimeout(() => {
      setItems(prev => prev.filter(p => p.id !== id))
      setRemoving(null)
      showToast('Đã xóa khỏi danh sách yêu thích')
    }, 280)
  }

  const sorted = [...items].sort((a, b) => {
    if (sort === 'price_asc')  return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'discount')   return getDiscount(b) - getDiscount(a)
    return b.id - a.id
  })

  const StockBadge = ({ stock }) => {
    const map = { in_stock: ['bg-green-500', 'text-green-600', 'Còn hàng'], low: ['bg-orange-400', 'text-orange-600', 'Sắp hết'], out: ['bg-red-400', 'text-red-600', 'Hết hàng'] }
    const [dot, text, label] = map[stock] || map.in_stock
    return <span className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${dot}`} /><span className={`text-[11px] font-medium ${text}`}>{label}</span></span>
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-3 rounded shadow-2xl">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {toast}
        </div>
      )}

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sản phẩm yêu thích</h2>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} sản phẩm đang theo dõi</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded overflow-hidden">
              {[['grid', <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>],
                ['list', <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>]
              ].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-2 transition-colors ${view === v ? 'bg-[#E8420A] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                </button>
              ))}
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 cursor-pointer">
              <option value="newest">Mới thêm</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
              <option value="discount">Giảm nhiều nhất</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {items.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-bold text-lg">Chưa có sản phẩm yêu thích</p>
                <p className="text-gray-400 text-sm mt-1 max-w-xs">Thêm sản phẩm vào danh sách để dễ dàng theo dõi giá và mua sau</p>
              </div>
              <button className="mt-1 px-6 py-2.5 bg-[#E8420A] hover:bg-[#c93808] text-white text-sm font-semibold rounded transition-colors">
                Khám phá sản phẩm
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {sorted.map(item => {
                const disc = getDiscount(item)
                return (
                  <div key={item.id}
                    className={`border border-gray-100 rounded overflow-hidden hover:border-[#E8420A]/30 hover:shadow-md transition-all duration-300 ${removing === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    {/* Thumb */}
                    <div className="relative aspect-[4/3]">
                      <ProductThumb category={item.category} />
                      {disc > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">-{disc}%</span>
                      )}
                      <button onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow transition-colors group">
                        <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-bold text-[#E8420A] bg-orange-50 px-1.5 py-0.5 rounded">{item.brand}</span>
                        <span className="text-[10px] text-gray-400">{item.category}</span>
                      </div>
                      <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[36px]">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-yellow-400 text-xs leading-none">{'★'.repeat(Math.floor(item.rating))}</span>
                        <span className="text-[10px] text-gray-400">({item.reviews})</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-[15px] font-bold text-[#E8420A]">{fmt(item.price)}</p>
                        {item.original && <p className="text-[11px] text-gray-400 line-through">{fmt(item.original)}</p>}
                      </div>
                      <div className="mt-1.5"><StockBadge stock={item.stock} /></div>
                      <button disabled={item.stock === 'out'}
                        className={`mt-3 w-full py-2 text-[12px] font-semibold rounded transition-colors ${item.stock === 'out' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#E8420A] hover:bg-[#c93808] text-white'}`}>
                        {item.stock === 'out' ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map(item => {
                const disc = getDiscount(item)
                return (
                  <div key={item.id}
                    className={`flex gap-4 border border-gray-100 rounded p-4 hover:border-[#E8420A]/30 hover:shadow-sm transition-all duration-300 ${removing === item.id ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
                    {/* Thumb */}
                    <div className="w-24 h-24 rounded overflow-hidden shrink-0 relative">
                      <ProductThumb category={item.category} />
                      {disc > 0 && <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">-{disc}%</span>}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-[#E8420A] bg-orange-50 px-1.5 py-0.5 rounded">{item.brand}</span>
                            <span className="text-[10px] text-gray-400">{item.category}</span>
                          </div>
                          <p className="text-[14px] font-semibold text-gray-800 leading-snug line-clamp-2">{item.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-400 text-xs">{'★'.repeat(Math.floor(item.rating))}</span>
                            <span className="text-[11px] text-gray-400">({item.reviews})</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors group">
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <p className="text-[16px] font-bold text-[#E8420A]">{fmt(item.price)}</p>
                          {item.original && <p className="text-[11px] text-gray-400 line-through">{fmt(item.original)}</p>}
                          <div className="mt-1"><StockBadge stock={item.stock} /></div>
                        </div>
                        <button disabled={item.stock === 'out'}
                          className={`px-4 py-2 text-[12px] font-semibold rounded transition-colors ${item.stock === 'out' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#E8420A] hover:bg-[#c93808] text-white'}`}>
                          {item.stock === 'out' ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OverviewSection({ banners, onDismiss, onNavigate }) {
  return (
    <div className="space-y-5">
      {/* Banners */}
      {/* Banners */}
      {banners.map(b => (
        <div key={b.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 transition-all duration-200"
          style={{ boxShadow: '0 4px 12px rgba(232,66,10,0.05)' }}>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-800">{b.text}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <button
              onClick={() => b.action && onNavigate(b.action)}
              className="text-xs font-black text-white px-4 py-2 transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(232,66,10,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              {b.cta}
            </button>
            <button onClick={() => onDismiss(b.id)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Recent orders */}
      <div className="bg-white overflow-hidden"
        style={{ border: '1.5px solid var(--cb)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Đơn hàng gần đây</h2>
          <button onClick={() => onNavigate('orders')} className="text-sm text-[#E8420A] hover:text-[#c93808] font-bold transition-all cursor-pointer flex items-center gap-1">
            Xem tất cả
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {OVERVIEW_ORDERS.map(order => (
            <div key={order.id} className="px-6 py-5 flex items-center gap-5 hover:bg-gray-50/50 transition-colors">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0 text-xs font-extrabold text-gray-500 border border-gray-200 shadow-sm">
                {order.img}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-black text-gray-800">{order.id}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs font-semibold text-gray-500">{order.date}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug truncate">{order.product}</p>
                {order.extra && <p className="text-xs text-gray-400 mt-1">{order.extra}</p>}
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full border"
                  style={{ backgroundColor: order.status === 'Đã nhận hàng' ? 'rgba(34,197,94,0.06)' : 'rgba(232,66,10,0.06)', color: order.status === 'Đã nhận hàng' ? '#15803d' : '#E8420A', borderColor: order.status === 'Đã nhận hàng' ? '#bbf7d0' : '#fed7aa' }}>
                  {order.status}
                </span>
                <p className="text-base font-black text-[#E8420A]">{fmt(order.total)}</p>
                <button onClick={() => onNavigate('invoice')} className="text-xs text-gray-500 hover:text-[#E8420A] font-bold transition-all cursor-pointer flex items-center gap-0.5 ml-auto">
                  Chi tiết <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wishlist */}
      <div className="bg-white overflow-hidden"
        style={{ border: '1.5px solid var(--cb)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Sản phẩm yêu thích</h2>
          <button className="text-sm text-[#E8420A] hover:text-[#c93808] font-bold transition-all cursor-pointer flex items-center gap-1">
            Xem tất cả <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-px bg-gray-100">
          {WISHLIST.map((item, i) => (
            <div key={i} className="bg-white px-4 py-4 hover:bg-orange-50/30 cursor-pointer transition-colors group">
              <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center text-xs text-gray-400 font-extrabold border border-gray-200 shadow-sm group-hover:border-orange-200 transition-colors">IMG</div>
              <p className="text-xs text-gray-800 font-bold leading-snug line-clamp-2 min-h-[2.5rem]">{item.name}</p>
              <p className="text-sm font-black text-[#E8420A] mt-2">{fmt(item.price)}</p>
              {item.original && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-gray-400 line-through">{fmt(item.original)}</p>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                    -{Math.round((1 - item.price / item.original) * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrdersSection({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ALL_ORDERS.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
      {/* Filter tabs */}
      <div className="flex items-center border-b border-gray-200 overflow-x-auto">
        {ORDER_FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#E8420A] text-[#E8420A]'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & date bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <span className="text-sm font-semibold text-gray-700 shrink-0">Lịch sử mua hàng</span>
        <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white text-sm text-gray-600 shadow-sm">
          <span>01/01/2025</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span>09/06/2026</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Order list */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {filtered.map(order => {
            const st = ORDER_STATUS[order.status]
            return (
              <div key={order.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                {/* Order header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{order.date}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${st.text} ${st.bg}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${st.dot} mr-1.5 align-middle`} />
                    {st.label}
                  </span>
                </div>

                {/* Product row */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500 border border-gray-200">
                    {order.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{order.product}</p>
                    <p className="text-sm text-gray-500 mt-1">{fmt(order.price)}</p>
                    {order.extra && <p className="text-xs text-gray-400 mt-1">{order.extra}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Tổng thanh toán</p>
                    <p className="text-xl font-black text-[#E8420A]">{fmt(order.total)}</p>
                    <button
                      onClick={() => onNavigate('invoice')}
                      className="mt-2.5 text-sm font-bold text-white bg-[#E8420A] hover:bg-[#c93808] px-4 py-1.5 rounded transition-colors flex items-center gap-1 ml-auto"
                    >
                      Xem chi tiết
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-600">Không có đơn hàng nào</p>
          <p className="text-sm text-gray-400 mt-1">Hãy mua sắm ngay để xem lịch sử đơn hàng</p>
          <button onClick={() => onNavigate('list')} className="mt-5 bg-[#E8420A] hover:bg-[#c93808] text-white text-sm font-bold px-6 py-2.5 rounded transition-colors">
            Mua sắm ngay
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────── */

export default function UserProfilePage() {
  const onNavigate = useNav()
  const [activeSection, setActiveSection] = useState('overview')
  const [banners, setBanners] = useState(BANNERS_INIT)

  const handleSidebarClick = (item) => {
    if (item.action) onNavigate(item.action)
    else setActiveSection(item.id)
  }

  const handleViewAllOrders = (sectionId) => setActiveSection(sectionId)

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8">

          {/* Profile row */}
          <div className="flex items-center gap-8 py-7">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8420A] to-[#c93808] flex items-center justify-center text-white text-3xl font-black ring-4 shadow-lg" style={{ ringColor: 'rgba(255,255,255,0.15)' }}>
                AJ
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>

            {/* Name + meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>Hồ sơ thành viên</p>
              </div>
              <h1 className="text-2xl font-black leading-tight" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>Alex Johnson</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>096·····35 · alex@example.com</p>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="px-3 py-1 text-xs font-black rounded" style={{ backgroundColor: 'rgba(232,66,10,0.15)', color: 'var(--accent)', border: '1px solid rgba(232,66,10,0.3)' }}>T-MEM</span>
                <span className="px-3 py-1 text-xs font-black text-white rounded" style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>Elite</span>
                <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>Đã xác minh</span>
              </div>
            </div>

            {/* Edit button */}
            <button className="ml-auto flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded transition-colors shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'var(--t2)', backgroundColor: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--t2)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa hồ sơ
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 pb-6">
            {/* Orders count */}
            <div className="rounded px-5 py-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(232,66,10,0.1)', border: '1px solid rgba(232,66,10,0.2)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>15</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(232,66,10,0.7)' }}>Tổng đơn hàng</p>
              </div>
            </div>

            {/* Spend */}
            <div className="rounded px-5 py-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#16a34a' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-black leading-none" style={{ color: '#4ade80', fontFamily: 'Syne, sans-serif' }}>21.875.000đ</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(74,222,128,0.7)' }}>Tổng tiền tích lũy</p>
              </div>
            </div>

            {/* Points */}
            <div className="rounded px-5 py-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS.star} />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black leading-none" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>1.250</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'var(--t3)' }}>Điểm thành viên</p>
              </div>
            </div>

            {/* Level progress */}
            <div className="rounded px-5 py-4" style={{ backgroundColor: 'rgba(232,66,10,0.1)', border: '1px solid rgba(232,66,10,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Tiến trình lên hạng Elite+</span>
                <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>43.75%</span>
              </div>
              <div className="w-full rounded-full h-2.5 mb-2" style={{ backgroundColor: 'rgba(232,66,10,0.2)' }}>
                <div className="h-2.5 rounded-full" style={{ width: '43.75%', backgroundColor: 'var(--accent)' }} />
              </div>
              <p className="text-xs" style={{ color: 'rgba(232,66,10,0.8)' }}>Cần thêm <span className="font-black">28.125.000đ</span> để lên hạng tiếp</p>
            </div>
          </div>

          {/* Quick nav tabs */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            {QUICK_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.action ? onNavigate(tab.action) : setActiveSection(tab.id)}
                className="shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
                style={{
                  borderBottomColor: activeSection === tab.id ? 'var(--accent)' : 'transparent',
                  color: activeSection === tab.id ? 'var(--accent)' : 'var(--t3)',
                }}
                onMouseEnter={e => { if (activeSection !== tab.id) { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)' } }}
                onMouseLeave={e => { if (activeSection !== tab.id) { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderBottomColor = 'transparent' } }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto w-full px-8 py-7">
        <div className="grid grid-cols-[280px_1fr_300px] gap-6 items-start">

          {/* Left sidebar */}
          <aside className="overflow-hidden sticky top-24" style={{ backgroundColor: 'var(--card)', border: '1.5px solid var(--cb)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <ul className="py-3">
              {SIDEBAR_ITEMS.map((item, i) => {
                if (!item) return <li key={i} className="my-2 mx-4" style={{ borderTop: '1px solid var(--cb)' }} />
                const isActive = activeSection === item.id && !item.action
                const isLogout = item.id === 'logout'
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSidebarClick(item)}
                      className="w-full flex items-center gap-3.5 text-sm transition-all text-left"
                      style={isActive
                        ? { backgroundColor: 'rgba(232,66,10,0.06)', color: 'var(--accent)', fontWeight: '700', borderLeft: '3px solid var(--accent)', paddingLeft: '17px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }
                        : isLogout
                          ? { color: 'var(--err)', padding: '12px 20px' }
                          : { color: 'var(--ct2)', padding: '12px 20px' }
                      }
                      onMouseEnter={e => { if (!isActive && !isLogout) { e.currentTarget.style.backgroundColor = 'var(--page)'; e.currentTarget.style.color = 'var(--ct1)' } }}
                      onMouseLeave={e => { if (!isActive && !isLogout) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--ct2)' } }}
                    >
                      <SvgIcon
                        name={item.icon}
                        className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#E8420A]' : isLogout ? 'text-red-400' : 'opacity-60'}`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <svg className="w-4 h-4 text-[#E8420A] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Center content */}
          <div className={`min-w-0 ${['orders','wishlist','membership','coupons','account','address','payment','support'].includes(activeSection) ? 'col-span-2' : ''}`}>
            {activeSection === 'orders' ? (
              <OrdersSection onNavigate={onNavigate} />
            ) : activeSection === 'wishlist' ? (
              <WishlistSection />
            ) : activeSection === 'membership' ? (
              <MembershipSection />
            ) : activeSection === 'coupons' ? (
              <CouponsSection />
            ) : activeSection === 'account' ? (
              <AccountSection />
            ) : activeSection === 'address' ? (
              <AddressSection />
            ) : activeSection === 'payment' ? (
              <PaymentSection />
            ) : activeSection === 'support' ? (
              <SupportSection />
            ) : (
              <OverviewSection
                banners={banners}
                onDismiss={id => setBanners(prev => prev.filter(b => b.id !== id))}
                onNavigate={(key) => {
                  if (['orders', 'address', 'payment'].includes(key)) handleViewAllOrders(key)
                  else onNavigate(key)
                }}
              />
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5 sticky top-24">

            {/* Support tips — chỉ hiện khi ở tab support */}
            {activeSection === 'support' && (
              <div className="space-y-4">
                {/* Working hours */}
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Giờ làm việc</h4>
                  <div className="space-y-3">
                    {[
                      { day: 'Thứ 2 – Thứ 6', time: '8:00 – 22:00', active: true  },
                      { day: 'Thứ 7',           time: '8:00 – 20:00', active: true  },
                      { day: 'Chủ nhật',        time: '9:00 – 18:00', active: false },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">{r.day}</span>
                        <span className={`font-bold ${r.active ? 'text-green-600' : 'text-orange-500'}`}>{r.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-green-700">Đang trong giờ làm việc</span>
                  </div>
                </div>

                {/* SLA */}
                <div className="bg-gray-50 border border-gray-200 rounded p-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Cam kết phản hồi</h4>
                  <div className="space-y-2.5">
                    {[
                      { channel: 'Live Chat',  time: '< 5 phút',  icon: '💬' },
                      { channel: 'Hotline',    time: '< 3 phút',  icon: '📞' },
                      { channel: 'Phiếu hỗ trợ', time: '< 24 giờ', icon: '🎫' },
                      { channel: 'Email',      time: '< 48 giờ', icon: '📧' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 font-medium flex items-center gap-1.5">
                          <span>{s.icon}</span>{s.channel}
                        </span>
                        <span className="font-black text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Useful links */}
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Liên kết hữu ích</h4>
                  <div className="space-y-2">
                    {[
                      'Chính sách đổi trả',
                      'Chính sách bảo hành',
                      'Hướng dẫn mua hàng',
                      'Điều khoản sử dụng',
                    ].map((link, i) => (
                      <button key={i} className="w-full flex items-center justify-between text-sm text-[#E8420A] hover:text-[#c93808] font-medium py-1 transition-colors text-left">
                        {link}
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment tips — chỉ hiện khi ở tab payment */}
            {activeSection === 'payment' && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Phương thức được chấp nhận</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Visa / Mastercard / JCB', desc: 'Thẻ tín dụng & ghi nợ quốc tế', color: 'bg-gray-50 border-gray-200' },
                      { name: 'MoMo & ZaloPay',           desc: 'Ví điện tử phổ biến',          color: 'bg-pink-50 border-pink-100'  },
                      { name: 'VNPay',                    desc: 'Thanh toán qua QR code',       color: 'bg-red-50 border-red-100'    },
                      { name: 'COD',                      desc: 'Thanh toán khi nhận hàng',     color: 'bg-green-50 border-green-100'},
                    ].map((m, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded border ${m.color}`}>
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-5">
                  <h4 className="text-sm font-bold text-amber-800 mb-2">Lưu ý bảo mật</h4>
                  <ul className="space-y-2">
                    {[
                      'Không chia sẻ thông tin thẻ với bất kỳ ai',
                      'Luôn kiểm tra địa chỉ website trước khi nhập thẻ',
                      'Bật thông báo giao dịch từ ngân hàng',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                        <span className="mt-0.5 shrink-0">⚠️</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Address tips — chỉ hiện khi ở tab address */}
            {activeSection === 'address' && (
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Lưu ý về địa chỉ</h4>
                <ul className="space-y-3">
                  {[
                    { icon: '📍', text: 'Tối đa 5 địa chỉ có thể lưu trong sổ địa chỉ' },
                    { icon: '⭐', text: 'Địa chỉ mặc định sẽ được tự động chọn khi đặt hàng' },
                    { icon: '✏️', text: 'Bạn có thể thay đổi địa chỉ giao hàng ngay tại trang xác nhận đơn' },
                    { icon: '🔒', text: 'Thông tin địa chỉ được bảo mật và chỉ dùng cho giao hàng' },
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="shrink-0 mt-0.5">{tip.icon}</span>
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Hỗ trợ giao hàng</p>
                  <div className="space-y-1.5">
                    {['Giao hàng toàn quốc 63 tỉnh thành', 'Giao hỏa tốc nội thành HN & HCM', 'Miễn phí ship đơn từ 500.000đ'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account tips — chỉ hiện khi ở tab account */}
            {activeSection === 'account' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-800">Gợi ý bảo mật</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      'Sử dụng mật khẩu dài ít nhất 8 ký tự, kết hợp chữ và số',
                      'Bật xác thực 2 bước để bảo vệ tài khoản',
                      'Không chia sẻ mật khẩu với người khác',
                      'Kiểm tra thiết bị đăng nhập thường xuyên',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Độ hoàn chỉnh hồ sơ</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Ảnh đại diện', done: true  },
                      { label: 'Họ và tên',     done: true  },
                      { label: 'Số điện thoại', done: true  },
                      { label: 'Email',          done: true  },
                      { label: 'Ngày sinh',      done: true  },
                      { label: 'Giới thiệu bản thân', done: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {item.done && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${item.done ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Mức độ hoàn chỉnh</span>
                      <span className="font-bold text-green-600">83%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Membership card */}
            {activeSection !== 'orders' && activeSection !== 'wishlist' && activeSection !== 'membership' && activeSection !== 'coupons' && activeSection !== 'account' && activeSection !== 'address' && activeSection !== 'payment' && activeSection !== 'support' && (
              <div className="rounded overflow-hidden shadow-sm border border-gray-200">
                <div className="bg-[#0D0F14] px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white/90">Hạng thành viên</span>
                    <span className="text-xs font-black px-3 py-1 bg-white/20 text-white rounded border border-white/30">Elite</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-black text-white">1.250</span>
                    <span className="text-sm font-semibold text-white/70">điểm</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                    <div className="bg-[#E8420A] h-2.5 rounded-full" style={{ width: '62.5%' }} />
                  </div>
                  <p className="text-xs text-white/70">Còn <span className="font-black text-white">750 điểm</span> để lên hạng tiếp theo</p>
                </div>
                <div className="bg-white px-5 py-3">
                  <button className="w-full py-2.5 text-sm font-bold text-[#E8420A] border border-orange-200 rounded hover:bg-orange-50 transition-colors">
                    Xem quyền lợi thành viên
                  </button>
                </div>
              </div>
            )}

            {/* Deals */}
            {activeSection !== 'orders' && activeSection !== 'wishlist' && activeSection !== 'membership' && activeSection !== 'coupons' && activeSection !== 'account' && activeSection !== 'address' && activeSection !== 'payment' && activeSection !== 'support' && (
              <div className="bg-white rounded border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Ưu đãi của bạn</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Giảm 10% cho đơn hàng tiếp theo', exp: 'HSD: 30/06/2026', code: 'ELITE10',  color: 'border-orange-200 bg-orange-50/40' },
                    { label: 'Miễn phí vận chuyển',              exp: 'HSD: 15/06/2026', code: 'FREESHIP', color: 'border-green-200 bg-green-50/40'  },
                    { label: 'Tích thêm 2x điểm cuối tuần',     exp: 'HSD: 08/06/2026', code: null,        color: 'border-orange-200 bg-orange-50/40'},
                  ].map((deal, i) => (
                    <div key={i} className={`border border-dashed rounded p-3.5 ${deal.color}`}>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{deal.label}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{deal.exp}</span>
                        {deal.code && (
                          <span className="text-xs font-black font-mono bg-white border border-orange-200 text-[#E8420A] px-2 py-1 rounded shadow-sm">{deal.code}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  Xem tất cả ưu đãi
                </button>
              </div>
            )}

            {/* Security */}
            {activeSection !== 'orders' && activeSection !== 'wishlist' && activeSection !== 'membership' && activeSection !== 'coupons' && activeSection !== 'account' && activeSection !== 'address' && activeSection !== 'payment' && activeSection !== 'support' && (
              <div className="bg-white rounded border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Bảo mật tài khoản</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Mật khẩu</p>
                      <p className="text-xs text-gray-400 mt-0.5">Đổi lần cuối 2 tháng trước</p>
                    </div>
                    <button className="text-sm font-bold text-[#E8420A] hover:text-[#c93808] transition-colors px-3 py-1 rounded hover:bg-orange-50">Cập nhật</button>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Xác thực 2 bước</p>
                      <p className="text-xs text-green-600 font-bold mt-0.5">Đã bật</p>
                    </div>
                    <div className="w-11 h-6 bg-[#E8420A] rounded-full flex items-center justify-end px-0.5 shadow-inner cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
