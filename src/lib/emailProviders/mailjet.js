// lib/emailProviders/mailjet.js
import mailjet from 'node-mailjet';

/**
 * Crée un client Mailjet pour l'envoi d'emails
 * @param {Object} options - Options de configuration
 * @returns {Object} - Client Mailjet configuré
 */
export function mailjetProvider({ apiKey, secretKey, fromEmail }) {
  // Log d'environnement
  console.log(`[ENV CHECK] NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`[ENV CHECK] MAILJET_API_KEY=${apiKey ? 'Défini (longueur: ' + apiKey.length + ')' : 'Non défini'}`);
  console.log(`[ENV CHECK] MAILJET_SECRET_KEY=${secretKey ? 'Défini (longueur: ' + secretKey.length + ')' : 'Non défini'}`);
  console.log(`[ENV CHECK] FROM_EMAIL=${fromEmail || 'Non défini'}`);
  
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
        
        // LOG DÉTAILLÉ DE LA REQUÊTE
        console.log(`[MAILJET DEBUG] Tentative d'envoi d'email à ${to} via Mailjet`);
        console.log(`[MAILJET DEBUG] De: ${from}, Sujet: ${subject}`);
        console.log(`[MAILJET DEBUG] Clé API utilisée: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
        console.log(`[MAILJET DEBUG] Corps de la requête:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
        
        const response = await client.post('send', { version: 'v3.1' }).request(data);
        
        // LOG DÉTAILLÉ DE LA RÉPONSE
        console.log(`[MAILJET SUCCESS] Email envoyé à ${to}`);
        console.log(`[MAILJET DEBUG] Status code:`, response.response?.status);
        console.log(`[MAILJET DEBUG] Réponse:`, JSON.stringify(response.body).substring(0, 500) + '...');
        
        // VÉRIFICATION APPROFONDIE DE LA RÉPONSE
        if (!response.body.Messages || !response.body.Messages.length) {
          console.warn('[MAILJET WARNING] Réponse inattendue: aucun message confirmé');
        }
        
        return {
          success: true,
          messageId: response.body.Messages?.[0]?.To?.[0]?.MessageID,
          provider: 'mailjet',
          statusCode: response.response?.status
        };
      } catch (error) {
        console.error('[MAILJET ERROR] Erreur lors de l\'envoi:', error.message);
        
        // LOG DÉTAILLÉ DE L'ERREUR
        if (error.response) {
          console.error(`[MAILJET ERROR] Status: ${error.statusCode || error.response?.status}`);
          console.error(`[MAILJET ERROR] Body:`, error.response?.body);
        }
        
        // Gérer le cas particulier du code 429 (trop de requêtes)
        if (error?.statusCode === 429 || error?.response?.status === 429) {
          console.warn('[MAILJET WARNING] Rate limit atteint (429)');
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