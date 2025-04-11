// lib/emailProviders/sendgrid.js
import sgMail from '@sendgrid/mail';

/**
 * Crée un client SendGrid pour l'envoi d'emails
 * @param {Object} options - Options de configuration
 * @returns {Object} - Client SendGrid configuré
 */
export function sendgridProvider({ apiKey, fromEmail }) {
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
        
        const response = await sgMail.send(msg);
        return {
          success: true,
          messageId: response[0]?.headers['x-message-id'],
          provider: 'sendgrid'
        };
      } catch (error) {
        console.error('Erreur SendGrid:', error);
        throw new Error(`Erreur SendGrid: ${error.message}`);
      }
    }
  };
}