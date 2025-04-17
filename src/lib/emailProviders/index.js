// lib/emailProviders/index.js
import { sendgridProvider } from './sendgrid';
import { brevoProvider } from './brevo';
import { mailjetProvider } from './mailjet';
import { selectBestProvider, updateProviderUsage, markProviderAsErrored } from '../utils/providerRotation';
import { emailConfig } from '../../config/emails';

/**
 * Sélectionne et configure le meilleur fournisseur d'email disponible
 * @param {Object} options - Options pour la sélection du fournisseur
 * @param {Object} options.logger - Logger pour tracer les événements
 * @param {Array} [options.excludedProviders=[]] - Liste des fournisseurs à exclure
 * @returns {Promise<Object>} - Instance du fournisseur configuré
 */
export async function getEmailProviderClient({ logger, excludedProviders = [] } = {}) {
  try {

     // Exclure tous les comptes de Mailjet
     const mailjetAccounts = emailConfig.providers.mailjet?.accounts?.map(acc => `mailjet-${acc.id}`) || [];
     const finalExcludedProviders = [...excludedProviders, ...mailjetAccounts];
    // Sélectionner le meilleur fournisseur en fonction des limites et disponibilités
    const provider = await selectBestProvider({ 
      logger,
      excludedProviders: finalExcludedProviders
    });
    
    if (!provider) {
      logger?.warn?.('❌ Aucun fournisseur disponible. Envoi stoppé.');
      return null;
    }    

    // Configurer le fournisseur sélectionné
    switch (provider.providerName) {
      case 'sendgrid':
        return {
          ...sendgridProvider({
            apiKey: provider.apiKey,
            fromEmail: emailConfig.providers.sendgrid.defaultFromEmail
          }),
          _meta: {
            providerName: provider.providerName,
            accountId: provider.accountId
          }
        };
     
      case 'brevo':
        return {
          ...brevoProvider({
            apiKey: provider.apiKey,
            fromEmail: emailConfig.providers.brevo.defaultFromEmail
          }),
          _meta: {
            providerName: provider.providerName,
            accountId: provider.accountId
          }
        };
     
     /*case 'mailjet':
        return {
          ...mailjetProvider({
            apiKey: provider.apiKey,
            secretKey: provider.secretKey,
            fromEmail: emailConfig.providers.mailjet.defaultFromEmail
          }),
          _meta: {
            providerName: provider.providerName,
            accountId: provider.accountId
          }
        };*/
     
      default:
        throw new Error(`Fournisseur non pris en charge: ${provider.providerName}`);
    }
  } catch (error) {
    console.error('Erreur lors de la sélection du fournisseur d\'emails:', error);
    throw error;
  }
}

/**
 * Envoie un email avec gestion automatique des erreurs et rotation des fournisseurs
 * @param {Object} emailData - Données de l'email à envoyer
 * @param {Object} options - Options d'envoi
 * @param {Object} options.logger - Logger pour tracer les événements
 * @param {number} options.maxRetries - Nombre maximal de tentatives
 * @param {number} options.emailCount - Nombre d'emails à envoyer (pour comptage)
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export async function sendEmailWithRotation(emailData, { logger, maxRetries = 3, emailCount = 1 } = {}) {
  let attemptCount = 0;
  const excludedProviders = [];
  let lastError = null;
  // Exclure tous les comptes de Mailjet
  const mailjetAccounts = emailConfig.providers.mailjet?.accounts?.map(acc => `mailjet-${acc.id}`) || [];
  const finalExcludedProviders = [...excludedProviders, ...mailjetAccounts];

  while (attemptCount < maxRetries) {
    attemptCount++;
    
    try {
      const provider = await getEmailProviderClient({ 
        logger, 
        excludedProviders: finalExcludedProviders
      });
      
      if (!provider) {
        throw new Error('Aucun fournisseur d\'email disponible');
      }

      logger?.info?.(`📧 Tentative d'envoi #${attemptCount} avec ${provider._meta.providerName} (${provider._meta.accountId})`);
      
      // Tenter l'envoi d'email
      const result = await provider.sendEmail(emailData);
      
      // Enregistrer l'utilisation réussie
      updateProviderUsage(provider._meta.providerName, provider._meta.accountId, emailCount);
      
      logger?.info?.(`✅ Email envoyé avec succès via ${provider._meta.providerName}`);
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Analyser l'erreur pour déterminer la stratégie
      if (error.statusCode === 401 || 
          error.message?.includes('authentication') || 
          error.message?.includes('unauthorized') ||
          error.message?.includes('access denied') ||
          error.message?.includes('invalid key')) {
        
        // Erreur d'authentification - problème avec l'API key
        logger?.warn?.(`⚠️ Erreur d'authentification (${error.message || error.statusCode}). Exclusion du fournisseur.`);
        
        if (lastError.provider && lastError.provider._meta) {
          const { providerName, accountId } = lastError.provider._meta;
          excludedProviders.push(`${providerName}-${accountId}`);
          
          // Marquer ce fournisseur comme ayant une erreur d'authentification
          markProviderAsErrored(providerName, accountId, 'auth_error');
        }
      }
      else if (error.statusCode === 429 || 
               error.message?.includes('rate limit') || 
               error.message?.includes('too many requests')) {
        
        // Limite de débit dépassée
        logger?.warn?.(`⚠️ Limite de débit dépassée (${error.message || error.statusCode}). Exclusion du fournisseur.`);
        
        if (lastError.provider && lastError.provider._meta) {
          const { providerName, accountId } = lastError.provider._meta;
          excludedProviders.push(`${providerName}-${accountId}`);
          
          // Marquer ce fournisseur comme ayant atteint sa limite
          markProviderAsErrored(providerName, accountId, 'rate_limit');
        }
      }
      else if (error.statusCode >= 500) {
        // Erreur serveur du fournisseur - tentons avec un autre
        logger?.warn?.(`⚠️ Erreur serveur du fournisseur (${error.message || error.statusCode}). Tentative avec un autre fournisseur.`);
        
        if (lastError.provider && lastError.provider._meta) {
          const { providerName, accountId } = lastError.provider._meta;
          excludedProviders.push(`${providerName}-${accountId}`);
          
          // Marquer temporairement ce fournisseur comme indisponible
          markProviderAsErrored(providerName, accountId, 'server_error');
        }
      }
      else {
        // Autres erreurs - probablement liées au contenu de l'email
        // Pas besoin de changer de fournisseur dans ce cas
        logger?.error?.(`❌ Erreur d'envoi d'email (${error.message || error.statusCode})`);
        throw error;
      }
    }
  }

  // Si on arrive ici, toutes les tentatives ont échoué
  logger?.error?.(`❌ Échec de l'envoi d'email après ${maxRetries} tentatives.`);
  throw lastError || new Error(`Échec de l'envoi d'email après ${maxRetries} tentatives.`);
}

/**
 * Enregistre l'utilisation du fournisseur d'email après envoi
 * @param {Object} provider - Instance du fournisseur utilisé
 * @param {number} sentCount - Nombre d'emails envoyés
 */
export function logProviderUsage(provider, sentCount) {
  if (provider && provider._meta) {
    updateProviderUsage(provider._meta.providerName, provider._meta.accountId, sentCount);
  }
}

// Exporter les fournisseurs individuels pour utilisation directe si nécessaire
export { sendgridProvider, brevoProvider };//export { sendgridProvider, brevoProvider, mailjetProvider };