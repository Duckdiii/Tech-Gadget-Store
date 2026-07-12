import { Outlet } from 'react-router-dom'
import StaffSidebar from '../components/StaffSidebar'
import { ROLE_PAGES } from '../config/constants'

export default function StaffLayout() {
  const allowedPages = ROLE_PAGES.staff

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar allowedPages={allowedPages} />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
