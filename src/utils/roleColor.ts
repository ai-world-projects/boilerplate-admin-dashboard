/**
 * Deterministic color for a role chip. Because roles are user-created, colors
 * can't be hardcoded — instead we hash the role's name to a fixed palette so the
 * same role always gets the same color across the app.
 */
const PALETTE: { bg: string; fg: string }[] = [
  { bg: '#e8eaf6', fg: '#3949ab' }, // indigo
  { bg: '#e3f2fd', fg: '#1565c0' }, // blue
  { bg: '#e0f2f1', fg: '#00796b' }, // teal
  { bg: '#e8f5e9', fg: '#2e7d32' }, // green
  { bg: '#fff8e1', fg: '#a06a00' }, // amber
  { bg: '#fce4ec', fg: '#c2185b' }, // pink
  { bg: '#f3e5f5', fg: '#8e24aa' }, // purple
  { bg: '#fbe9e7', fg: '#d84315' }, // deep orange
];

export interface RoleColor {
  bg: string;
  fg: string;
}

export function getRoleColor(key: string): RoleColor {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
