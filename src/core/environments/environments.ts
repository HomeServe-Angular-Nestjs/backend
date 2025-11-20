const isProd = process.env.NODE_ENV === 'production';

export const FRONTEND_URL = isProd
    ? 'https://homeservenow.online'
    : 'http://localhost:4200';

export const BACKEND_URL = isProd
    ? 'https://jamarion-uncondolatory-olimpia.ngrok-free.dev'
    : 'http://localhost:5000';
