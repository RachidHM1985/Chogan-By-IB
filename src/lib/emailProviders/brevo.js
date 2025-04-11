import SibApiV3Sdk from 'sib-api-v3-sdk';

/**
 * Crée un client Brevo (anciennement Sendinblue) pour l'envoi d'emails
 * @param {Object} options - Options de configuration
 * @returns {Object} - Client Brevo configuré
 */
export function brevoProvider({ apiKey, fromEmail }) {
  // Configurer le client Brevo
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey_auth = defaultClient.authentications['api-key'];
  apiKey_auth.apiKey = apiKey;
 
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
 
  return {
    id: 'brevo',
    name: 'Brevo',
   
    /**
     * Envoie un email via Brevo
     * @param {Object} options - Options d'envoi
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async send({ to, subject, html, from = fromEmail, replyTo, trackingId }) {
      try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
       
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { email: from };
        sendSmtpEmail.to = [{ email: to }];
       
        if (replyTo) {
          sendSmtpEmail.replyTo = { email: replyTo };
        }
       
        if (trackingId) {
          sendSmtpEmail.params = { tracking_id: trackingId };
        }
       
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
       
        return {
          success: true,
          messageId: response.messageId,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('Erreur Brevo:', error);
        throw new Error(`Erreur Brevo: ${error.message}`);
      }
    }
  };
}