// Route params and search params as Next hands them over: possibly repeated, always strings.
export const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export function positiveInt(value: string | undefined): number | null {
  return value !== undefined && /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}
