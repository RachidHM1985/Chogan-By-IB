// lib/emailProviders/index.js
import { sendgridProvider } from './sendgrid';
import { brevoProvider } from './brevo';
import { mailjetProvider } from './mailjet';
import { selectBestProvider, updateProviderUsage } from '../utils/providerRotation';
import { emailConfig } from '../../config/emails';

/**
 * Sélectionne et configure le meilleur fournisseur d'email disponible
 * @param {number} emailCount - Nombre d'emails à envoyer
 * @returns {Promise<Object>} - Instance du fournisseur configuré
 */
export async function getEmailProviderClient(emailCount = 1) {
  try {
    // Sélectionner le meilleur fournisseur en fonction des limites et disponibilités
    const provider = await selectBestProvider(emailCount);
    
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
      
      case 'mailjet':
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
        };
      
      default:
        throw new Error(`Fournisseur non pris en charge: ${provider.providerName}`);
    }
  } catch (error) {
    console.error('Erreur lors de la sélection du fournisseur d\'emails:', error);
    throw error;
  }
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
export { sendgridProvider, brevoProvider, mailjetProvider };