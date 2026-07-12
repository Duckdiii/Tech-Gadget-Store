export function getFieldCls(error) {
  return `field-dark w-full px-3.5 py-3 text-[13px]${error ? ' field-error' : ''}`
}
