/**
 * Color helpers. Centralised so the hex → RGB-triplet conversion the theme needs
 * (branding writes `--rgb-primary` as an "r g b" triplet) and the translucent
 * chip backgrounds used by status chips share one implementation.
 */

/** Normalise a hex string to `#rrggbb`, or return null if it isn't valid hex. */
export function normalizeHex(hex: string): string | null {
  const value = hex.trim();
  const short = /^#?([0-9a-fA-F]{3})$/.exec(value);
  if (short) {
    const [r, g, b] = short[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const full = /^#?([0-9a-fA-F]{6})$/.exec(value);
  if (full) return `#${full[1]}`.toLowerCase();
  return null;
}

/** Parse a hex color into its `[r, g, b]` channel values (0–255). */
export function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const int = parseInt(normalized.slice(1), 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** `#2ea043` → `"46 160 67"`, the space-separated triplet the CSS vars expect. */
export function hexToRgbTriplet(hex: string): string | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgb.join(' ') : null;
}

/** Translucent `rgba(...)` from a hex color, e.g. for tinted chip backgrounds. */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(138, 148, 166, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}
