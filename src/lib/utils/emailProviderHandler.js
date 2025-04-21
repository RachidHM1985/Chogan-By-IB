// lib/utils/emailProviderHandler.js
import { markProviderAsErrored, updateProviderUsage } from './providerRotation';

/**
 * Gère les erreurs des providers d'email et met à jour les compteurs d'utilisation
 * @param {Object} options
 * @param {string} options.providerName - Nom du provider (sendgrid, brevo)
 * @param {string} options.accountId - Identifiant du compte
 * @param {Error|Object} options.error - Erreur rencontrée (optionnel si succès)
 * @param {number} options.sentCount - Nombre d'emails envoyés avec succès
 * @param {Object} options.logger - Logger optionnel
 * @returns {Object} Résultat du traitement
 */
export function handleEmailProviderResponse({ 
  providerName, 
  accountId, 
  error = null, 
  sentCount = 0, 
  logger = console 
}) {
  if (!providerName || !accountId) {
    logger.error('❌ Provider ou accountId manquant');
    return { success: false, reason: 'missing_params' };
  }

  // Cas d'erreur
  if (error) {
    // Traiter les différents types d'erreurs selon le provider
    let errorType = 'server_error'; // Par défaut
    
    // SendGrid
    if (providerName === 'sendgrid') {
      // Codes d'erreur HTTP
      if (error.response?.status === 401 || error.status === 401) {
        errorType = 'auth_error';
        logger.error(`🔒 Erreur d'authentification SendGrid: ${accountId}`);
      } else if (error.response?.status === 429 || error.status === 429) {
        errorType = 'rate_limit';
        logger.error(`⏱️ Rate limit atteint SendGrid: ${accountId}`);
      }
      
      // Erreurs spécifiques de l'API SendGrid
      if (error.response?.body?.errors) {
        const sgErrors = error.response.body.errors;
        const authErrors = sgErrors.filter(e => 
          e.message?.includes('authentication') || 
          e.message?.includes('authorization') ||
          e.message?.includes('api key') ||
          e.message?.includes('credentials')
        );
        
        if (authErrors.length > 0) {
          errorType = 'auth_error';
          logger.error(`🔒 Erreur auth détectée dans les erreurs SendGrid: ${authErrors[0].message}`);
        }
      }
    }
    
    // Brevo/Sendinblue
    else if (providerName === 'brevo') {
      if (error.response?.status === 401 || error.response?.status === 403 || 
          error.status === 401 || error.status === 403) {
        errorType = 'auth_error';
        logger.error(`🔒 Erreur d'authentification Brevo: ${accountId}`);
      } else if (error.response?.status === 429 || error.status === 429) {
        errorType = 'rate_limit';
        logger.error(`⏱️ Rate limit atteint Brevo: ${accountId}`);
      }
    }

    // Marquer le provider comme en erreur
    markProviderAsErrored(providerName, accountId, errorType);
    
    return {
      success: false,
      errorType,
      error: error.message || String(error)
    };
  }
  
  // Cas de succès
  if (sentCount > 0) {
    updateProviderUsage(providerName, accountId, sentCount);
    logger.info(`✅ ${sentCount} emails envoyés via ${providerName}:${accountId}`);
  }
  
  return { 
    success: true, 
    sentCount 
  };
}