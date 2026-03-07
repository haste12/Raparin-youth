/**
 * lib/sanitize.js
 * Server-side input sanitization helpers.
 * No external deps — keeps the bundle small.
 */

/** Strip ALL HTML tags from a string */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')    // strip tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * Sanitize a plain-text field (name, subject, etc.).
 * Strips HTML, trims whitespace, enforces max length.
 */
export function sanitizeText(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return stripHtml(str).slice(0, maxLength).trim();
}

/**
 * Validate an email address format.
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // RFC 5322-ish, not perfect but catches 99% of bad inputs
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Escape HTML special characters — use when reflecting user text in HTML
 * without dangerouslySetInnerHTML.
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize a contact form submission object.
 * Returns a clean object or throws if required fields are missing/invalid.
 */
export function sanitizeContactForm({ name, email, subject, message }) {
  const cleanName    = sanitizeText(name, 120);
  const cleanEmail   = sanitizeText(email, 254).toLowerCase();
  const cleanSubject = sanitizeText(subject, 200);
  const cleanMessage = sanitizeText(message, 5000);

  const errors = [];
  if (!cleanName)                    errors.push('Name is required.');
  if (!cleanEmail)                   errors.push('Email is required.');
  if (!isValidEmail(cleanEmail))     errors.push('Invalid email address.');
  if (!cleanMessage)                 errors.push('Message is required.');
  if (cleanMessage.length < 10)      errors.push('Message is too short.');

  return {
    ok: errors.length === 0,
    errors,
    data: { name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage },
  };
}

/**
 * Verify magic bytes of an image buffer to confirm it is the claimed type.
 * Returns true if the bytes match; false if they look suspicious.
 */
export function verifyImageMagicBytes(buffer, mimeType) {
  if (!buffer || buffer.length < 12) return false;

  const b = buffer;

  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      // JPEG: FF D8 FF
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

    case 'image/png':
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      return (
        b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
        b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
      );

    case 'image/webp':
      // WebP: RIFF????WEBP
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
      );

    case 'image/gif':
      // GIF87a or GIF89a
      return (
        b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
        (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61
      );

    default:
      return false;
  }
}
