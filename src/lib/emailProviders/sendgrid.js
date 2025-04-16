// lib/emailProviders/sendgrid.js
import sgMail from '@sendgrid/mail';

/**
 * Crée un client SendGrid pour l'envoi d'emails
 * @param {Object} options - Options de configuration
 * @returns {Object} - Client SendGrid configuré
 */
export function sendgridProvider({ apiKey, fromEmail }) {
  // Log d'environnement
  console.log(`[ENV CHECK] NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`[ENV CHECK] SENDGRID_API_KEY=${apiKey ? 'Défini (longueur: ' + apiKey.length + ')' : 'Non défini'}`);
  console.log(`[ENV CHECK] FROM_EMAIL=${fromEmail || 'Non défini'}`);
  
  // Configurer le client SendGrid
  sgMail.setApiKey(apiKey);
  
  return {
    id: 'sendgrid',
    name: 'SendGrid',
    
    /**
     * Envoie un email via SendGrid
     * @param {Object} options - Options d'envoi
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async send({ to, subject, html, from = fromEmail, replyTo, trackingId }) {
      try {
        const msg = {
          to,
          from,
          subject,
          html,
          replyTo,
          customArgs: {
            tracking_id: trackingId
          }
        };
        
        // LOG DÉTAILLÉ DE LA REQUÊTE
        console.log(`[SENDGRID DEBUG] Tentative d'envoi d'email à ${to} via SendGrid`);
        console.log(`[SENDGRID DEBUG] De: ${from}, Sujet: ${subject}`);
        console.log(`[SENDGRID DEBUG] Clé API utilisée: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
        console.log(`[SENDGRID DEBUG] Corps de la requête:`, JSON.stringify(msg, null, 2).substring(0, 500) + '...');
        
        const response = await sgMail.send(msg);
        
        // LOG DÉTAILLÉ DE LA RÉPONSE
        console.log(`[SENDGRID SUCCESS] Email envoyé à ${to}`);
        console.log(`[SENDGRID DEBUG] Status code:`, response[0]?.statusCode);
        console.log(`[SENDGRID DEBUG] Headers:`, JSON.stringify(response[0]?.headers));
        
        // VÉRIFICATION APPROFONDIE DE LA RÉPONSE
        if (!response[0] || response[0].statusCode !== 202) {
          console.warn(`[SENDGRID WARNING] Status code inattendu: ${response[0]?.statusCode || 'inconnu'}`);
        }
        
        return {
          success: true,
          messageId: response[0]?.headers['x-message-id'],
          provider: 'sendgrid',
          statusCode: response[0]?.statusCode
        };
      } catch (error) {
        console.error('[SENDGRID ERROR] Erreur lors de l\'envoi:', error.message);
        
        // LOG DÉTAILLÉ DE L'ERREUR
        if (error.response) {
          console.error(`[SENDGRID ERROR] Code: ${error.code}, Status: ${error.response.status}`);
          console.error(`[SENDGRID ERROR] Body:`, error.response.body);
        }
        
        // Vérifie si c'est une erreur de rate limiting (429)
        if (error.code === 429 || (error.response && error.response.status === 429)) {
          console.warn('[SENDGRID WARNING] Rate limit atteint (429)');
          return {
            success: false,
            warning: true,
            statusCode: 429,
            reason: 'Too Many Requests',
            provider: 'sendgrid'
          };
        }
        
        throw new Error(`Erreur SendGrid: ${error.message}`);
      }
    }
  };
}