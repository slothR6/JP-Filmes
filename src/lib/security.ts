export const sanitizeText = (value: string, maxLength = 280): string =>
  value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);

export const isValidRoomId = (value: string): boolean => /^[a-zA-Z0-9_-]{3,60}$/.test(value);
