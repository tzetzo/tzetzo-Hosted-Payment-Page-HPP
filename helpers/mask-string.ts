export function maskString(string: string): string {
  if (!string) return "";
  return `${string.slice(0, 7)}...${string.slice(-6)}`;
}
