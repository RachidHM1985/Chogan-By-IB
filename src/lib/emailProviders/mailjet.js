// lib/emailProviders/mailjet.js
import mailjet from 'node-mailjet';

/**
 * Crée un client Mailjet pour l'envoi d'emails
 * @param {Object} options - Options de configuration
 * @returns {Object} - Client Mailjet configuré
 */
export function mailjetProvider({ apiKey, secretKey, fromEmail }) {
  const client = mailjet.apiConnect(apiKey, secretKey);
  
  return {
    id: 'mailjet',
    name: 'Mailjet',

    /**
     * Envoie un email via Mailjet
     * @param {Object} options - Options d'envoi
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async send({ to, subject, html, from = fromEmail, replyTo, trackingId }) {
      try {
        const data = {
          Messages: [
            {
              From: {
                Email: from
              },
              To: [
                {
                  Email: to
                }
              ],
              Subject: subject,
              HTMLPart: html,
              CustomID: trackingId || undefined
            }
          ]
        };

        if (replyTo) {
          data.Messages[0].ReplyTo = { Email: replyTo };
        }

        const response = await client.post('send', { version: 'v3.1' }).request(data);

        return {
          success: true,
          messageId: response.body.Messages[0].To[0].MessageID,
          provider: 'mailjet'
        };

      } catch (error) {
        console.error('Erreur Mailjet:', error);

        // Gérer le cas particulier du code 429 (trop de requêtes)
        if (error?.statusCode === 429 || error?.response?.status === 429) {
          return {
            success: false,
            warning: true,
            statusCode: 429,
            reason: 'Too Many Requests',
            provider: 'mailjet'
          };
        }

        // Pour toute autre erreur, on lève une exception
        throw new Error(`Erreur Mailjet: ${error.message}`);
      }
    }
  };
}
