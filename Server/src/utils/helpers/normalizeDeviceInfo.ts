export function normalizeDeviceInfo(userAgent: string): string {
  if (userAgent.includes("iPhone") || userAgent.includes("iOS")) return "iOS";
  if (userAgent.includes("Android")) return "Android";
  return userAgent.split(" ")[0] ?? "Unknown";
}