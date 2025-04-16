// lib/emailProviders/brevo.js
import SibApiV3Sdk from 'sib-api-v3-sdk';

/**
 * Crée un client Brevo (anciennement Sendinblue) pour l'envoi d'emails
 * @param {Object} options - Options de configuration
 * @returns {Object} - Client Brevo configuré
 */
export function brevoProvider({ apiKey, fromEmail }) {
  // Log d'environnement
  console.log(`[ENV CHECK] NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`[ENV CHECK] BREVO_API_KEY=${apiKey ? 'Défini (longueur: ' + apiKey.length + ')' : 'Non défini'}`);
  console.log(`[ENV CHECK] FROM_EMAIL=${fromEmail || 'Non défini'}`);
  
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
        
        // LOG DÉTAILLÉ DE LA REQUÊTE
        console.log(`[BREVO DEBUG] Tentative d'envoi d'email à ${to} via Brevo`);
        console.log(`[BREVO DEBUG] De: ${from}, Sujet: ${subject}`);
        console.log(`[BREVO DEBUG] Clé API utilisée: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
        
        // Convertir l'objet en JSON pour le log (car SendSmtpEmail peut contenir des méthodes)
        const requestData = {
          subject: sendSmtpEmail.subject,
          sender: sendSmtpEmail.sender,
          to: sendSmtpEmail.to,
          replyTo: sendSmtpEmail.replyTo,
          params: sendSmtpEmail.params
        };
        console.log(`[BREVO DEBUG] Corps de la requête:`, JSON.stringify(requestData, null, 2));
        
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        // LOG DÉTAILLÉ DE LA RÉPONSE
        console.log(`[BREVO SUCCESS] Email envoyé à ${to}`);
        console.log(`[BREVO DEBUG] Réponse:`, JSON.stringify(response));
        
        return {
          success: true,
          messageId: response.messageId,
          provider: 'brevo'
        };
      } catch (error) {
        console.error('[BREVO ERROR] Erreur lors de l\'envoi:', error.message);
        
        // LOG DÉTAILLÉ DE L'ERREUR
        if (error.response) {
          console.error(`[BREVO ERROR] Status: ${error.response?.status}`);
          console.error(`[BREVO ERROR] Body:`, error.response?.text);
        }
        
        // Vérifier si c'est une erreur de rate limiting
        if (error.message?.includes('429') || error.response?.status === 429) {
          console.warn('[BREVO WARNING] Rate limit atteint (429)');
          return {
            success: false,
            warning: true,
            statusCode: 429,
            reason: 'Too Many Requests',
            provider: 'brevo'
          };
        }
        
        throw new Error(`Erreur Brevo: ${error.message}`);
      }
    }
  };
}