/**
 * Builds a wa.me share URL. Kept isolated so the share mechanism can later
 * swap to the WhatsApp Business API without touching call sites.
 */
export function buildWhatsAppShareUrl(text, phone = '') {
  const encoded = encodeURIComponent(text);
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encoded}`;
}

export function openWhatsAppShare(text, phone = '') {
  const url = buildWhatsAppShareUrl(text, phone);
  window.open(url, '_blank', 'noopener,noreferrer');
}
