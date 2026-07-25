// Lọc nav item theo quyền của role hiện tại. allowedPages === null nghĩa là không giới hạn (hiện hết).
// alwaysShow: danh sách NAV_TARGETS luôn hiển thị bất kể quyền (vd 'login').
export function filterByAllowedPages(items, navTargets, allowedPages, alwaysShow = []) {
  const alwaysShowSet = new Set(alwaysShow)
  return items.filter((item) => {
    const target = navTargets[item.id]
    return !target || allowedPages === null || alwaysShowSet.has(target) || allowedPages.has(target)
  })
}
