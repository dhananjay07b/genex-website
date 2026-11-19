import { Outlet, useLocation } from 'react-router-dom'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { WorkspaceShell } from '@/components/gelearn/workspace/WorkspaceShell'
import { STUDIO_TYPES } from './studioTypes'

const NAV = [
  { to: '/studio', label: 'Overview', icon: SpaceDashboardOutlinedIcon, exact: true },
  ...STUDIO_TYPES.map(t => ({ to: `/studio/${t.key}`, label: t.label, icon: t.icon, exact: false })),
  { to: '/studio/courses', label: 'Courses', icon: SchoolOutlinedIcon, exact: false },
  { to: '/studio/team', label: 'Team', icon: GroupsOutlinedIcon, exact: false },
]

/** Company Studio: the shared dashboard frame with the Studio's sections. Company accounts only (see RoleRoute). */
export default function StudioLayout() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '')
  const items = NAV.map(({ exact, ...item }) => ({
    ...item,
    active: exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`),
  }))

  return (
    <WorkspaceShell label="Company Studio" navLabel="Studio" items={items}>
      <Outlet />
    </WorkspaceShell>
  )
}
