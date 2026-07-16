/**
 * Guestbook input caps, shared by the API route (enforcement) and the
 * client form (maxLength + live character count). Kept in a tiny
 * dependency-free module so the client bundle never touches node:fs.
 */
export const NAME_MAX = 40;
export const MESSAGE_MAX = 240;
