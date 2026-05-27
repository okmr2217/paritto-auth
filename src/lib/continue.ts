export function validateContinueUrl(
  continueUrl: string | undefined | null,
  betterAuthUrl: string,
  trustedOrigins: string[]
): string | null {
  if (!continueUrl) return null;
  try {
    const url = new URL(continueUrl, betterAuthUrl);
    const authOrigin = new URL(betterAuthUrl).origin;
    if (url.origin === authOrigin) return url.toString();
    if (trustedOrigins.includes(url.origin)) return url.toString();
    return null;
  } catch {
    return null;
  }
}
