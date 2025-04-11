/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si l'email est valide
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email);
}

/**
 * Valide les paramètres d'une newsletter
 * @param {Object} payload - Données de la newsletter
 * @returns {string|null} - Message d'erreur ou null si valide
 */
export function validateNewsletterPayload(payload) {
  const { newsletterId, segmentId, templateId } = payload;
 
  if (!newsletterId) return 'newsletterId est requis';
  if (!segmentId) return 'segmentId est requis';
  if (!templateId) return 'templateId est requis';
 
  return null;
}