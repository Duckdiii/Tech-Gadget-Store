export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

export function validatePhone(phone) {
  const re = /^(0|84)[3|5|7|8|9][0-9]{8}$/
  return re.test(String(phone))
}
