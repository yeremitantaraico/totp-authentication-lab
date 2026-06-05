export const APP_NAME =
  import.meta.env.VITE_APP_NAME?.trim() || 'TOTP Authentication Lab';

export function formatPageTitle(pageTitle: string): string {
  return `${APP_NAME} - ${pageTitle}`;
}
