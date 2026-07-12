export const ORDER_STATUS = {
  COMPLETED:             { label: 'Hoàn thành',   bg: 'bg-green-100',  text: 'text-green-700' },
  SHIPPING:              { label: 'Đang giao',    bg: 'bg-purple-100', text: 'text-purple-700'},
  PROCESSING:            { label: 'Đang xử lý',   bg: 'bg-orange-50',  text: 'text-[#C4350A]' },
  AWAITING_CONFIRMATION: { label: 'Chờ xác nhận', bg: 'bg-amber-100',  text: 'text-amber-700' },
  CANCELLED:             { label: 'Đã hủy',       bg: 'bg-red-100',    text: 'text-red-600'   },
  REFUNDED:              { label: 'Đã hoàn tiền', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export const PAY_METHOD = {
  CARD:    { label: 'Thẻ Visa / Master', icon: '💳' },
  MOMO:    { label: 'MoMo',             icon: '📱' },
  COD:     { label: 'Tiền mặt (COD)',   icon: '💵' },
  DEFAULT: { label: 'Thanh toán trực tuyến', icon: '🏦' }
}
