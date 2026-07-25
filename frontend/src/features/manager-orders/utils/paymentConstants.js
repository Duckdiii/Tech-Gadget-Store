export const PAY_STATUS = {
  SUCCESS:  { label: 'Thành công', bg: 'bg-green-100',  text: 'text-green-700',  icon: '✓' },
  FAILED:   { label: 'Thất bại',   bg: 'bg-red-100',    text: 'text-red-600',    icon: '✕' },
  REFUNDED: { label: 'Hoàn tiền',  bg: 'bg-purple-100', text: 'text-purple-700', icon: '↩' },
  PENDING:  { label: 'Chờ xử lý',  bg: 'bg-amber-100',  text: 'text-amber-700',  icon: '…' },
}

export const METHOD_COLOR = {
  MOMO:    { bg: 'bg-pink-50',   icon: 'text-pink-600'   },
  VNPAY:   { bg: 'bg-blue-50',   icon: 'text-blue-600'   },
  COD:     { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
  DEFAULT: { bg: 'bg-gray-50',   icon: 'text-gray-600'   },
}
