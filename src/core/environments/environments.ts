export const FRONTEND_URL = process.env.FRONTEND_URL;
export const BACKEND_URL = process.env.BACKEND_URL;
export const ALLOWED_URLS: string[] = JSON.parse(process.env.ALLOWED_URLS || '[]');
