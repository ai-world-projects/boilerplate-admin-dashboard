import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import UsersIcon from '@mui/icons-material/PeopleAltOutlined';
import RecordsIcon from '@mui/icons-material/DescriptionOutlined';
import ApprovalsIcon from '@mui/icons-material/FactCheckOutlined';
import ReportsIcon from '@mui/icons-material/AssessmentOutlined';
import AuditIcon from '@mui/icons-material/HistoryOutlined';
import AccessIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import WorkflowIcon from '@mui/icons-material/AccountTreeOutlined';
import SecurityIcon from '@mui/icons-material/LockOutlined';
import BrandingIcon from '@mui/icons-material/PaletteOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { PermissionKey } from '@/auth/permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: SvgIconComponent;
  /** Permission required to see this item and enter its route. */
  permission: PermissionKey;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

/** Grouped, permission-tagged sidebar navigation. */
export const navGroups: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon, permission: 'dashboard:view' },
      { label: 'Notifications', href: '/notifications', icon: NotificationsIcon, permission: 'notifications:view' },
    ],
  },
  {
    heading: 'Management',
    items: [
      { label: 'Users', href: '/users', icon: UsersIcon, permission: 'users:read' },
      { label: 'Records', href: '/records', icon: RecordsIcon, permission: 'records:read' },
      { label: 'Approvals', href: '/approvals', icon: ApprovalsIcon, permission: 'approvals:read' },
    ],
  },
  {
    heading: 'Insights',
    items: [
      { label: 'Reports', href: '/reports', icon: ReportsIcon, permission: 'reports:view' },
      { label: 'Audit Log', href: '/audit', icon: AuditIcon, permission: 'audit:read' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'Access (RBAC)', href: '/settings/access', icon: AccessIcon, permission: 'settings:rbac' },
      { label: 'Workflow', href: '/settings/workflow', icon: WorkflowIcon, permission: 'settings:workflow' },
      { label: 'Security', href: '/settings/security', icon: SecurityIcon, permission: 'settings:security' },
      { label: 'Branding', href: '/settings/branding', icon: BrandingIcon, permission: 'settings:branding' },
    ],
  },
];

/** Flat list of all nav items (for route-permission lookups). */
export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

/**
 * Resolve the permission required for a given pathname by longest-prefix match
 * against the nav config. Returns undefined for routes with no gate (e.g. profile).
 */
export function permissionForPath(pathname: string): PermissionKey | undefined {
  const match = allNavItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.permission;
}

export const DRAWER_WIDTH = 256;
export const COLLAPSED_WIDTH = 76;
