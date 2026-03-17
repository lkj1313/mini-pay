export const SESSION_COOKIE_NAME = 'session_id';
export const SESSION_IDLE_TTL_SECONDS = 60 * 10;
export const SESSION_IDLE_TTL_MS = SESSION_IDLE_TTL_SECONDS * 1000;
export const SESSION_ABSOLUTE_TTL_MS = 1000 * 60 * 60 * 6;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_IDLE_TTL_MS,
};
