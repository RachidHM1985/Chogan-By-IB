import { selectBestProvider, updateProviderUsage, markProviderAsErrored } from './utils/providerRotation';
import { logProviderUsage, getEmailProviderClient } from './emailProviders';
import { validateEmail } from './utils/validation';
import { generateEmailHTML } from '../lib/emailTemplates/generateEmailHTML';
import { inngest, EVENTS } from '../inngest/client';
import { handleEmailProviderResponse } from '../lib/utils/emailProviderHandler';
import { supabase } from '../lib/supabaseClient';

/**
 * Envoie un email en tentant un fournisseur disponible (hors blacklist globale).
 * @param {Object} subscriber - Abonné destinataire
 * @param {string} newsletterId - Identifiant de la newsletter
 * @param {Object} logger - Instance de logger
 * @param {Set<string>} globalExcludedProviders - Set des providerKeys à exclure
 * @returns {Promise<Object>} - { success: boolean, messageId?: string, error?: string }
 */

async function sendEmailWithAutoRotation(subscriber, newsletterId, logger, globalExcludedProviders) {
  try {
    // Sélection d'un provider non exclu
    const providerInfo = await selectBestProvider({
      emailCount: 1,  // On précise bien emailCount=1
      excludeProviders: Array.from(globalExcludedProviders),
      logger
    });

    if (!providerInfo) {
      logger?.warn(`[EMAIL] Aucun fournisseur disponible pour ${subscriber.email}`);
      return { success: false, error: 'Aucun fournisseur disponible' };
    }

    const providerKey = `${providerInfo.providerName}-${providerInfo.accountId}`;
    logger?.info(`[EMAIL] Tentative d'envoi via ${providerKey} pour ${subscriber.email}`);
    try {
    // Initialisation du client provider
    const provider = await getEmailProviderClient(providerInfo, logger);
    const result = await provider.send({
      to: subscriber.email,
      subject: `Découvrez la beauté accessible avec Chogan 🌸`,
      html: await generateEmailHTML(subscriber),
      trackingId: `newsletter-${newsletterId}-${subscriber.id}`,
    });

    // Utiliser handleEmailProviderResponse pour gérer le succès
    handleEmailProviderResponse({
      providerName: providerInfo.providerName,
      accountId: providerInfo.accountId,
      sentCount: 1,
      logger
    });
    
    return { 
      success: true, 
      messageId: result.messageId, 
      providerInfo, 
      providerKey // Pour le tracking
    };
  } catch (sendError) {
    // Enrichir l'erreur avec les infos du provider pour la gestion d'erreur
    sendError.providerInfo = providerInfo;
    throw sendError;
  }
} catch (error) {
  // Extraction des infos provider depuis l'erreur
  const providerName = error.providerInfo?.providerName;
  const accountId = error.providerInfo?.accountId;
  const providerKey = providerName && accountId ? `${providerName}-${accountId}` : null;

  // Utiliser handleEmailProviderResponse pour les erreurs
  if (providerName && accountId) {
    handleEmailProviderResponse({
      providerName,
      accountId,
      error,
      logger
    });
    
    // Ajouter à la blacklist pour ce batch
    globalExcludedProviders.add(providerKey);
  }

    const status = error.statusCode || error.status || error.response?.status;
    const msg = status === 401
      ? 'Accès refusé (401)'
      : status === 429
        ? 'Limite de débit atteinte (429)'
        : error.message || 'Erreur inconnue';

    logger?.error(`[EMAIL] ❌ Échec envoi ${subscriber.email} : ${msg}`);
    
    // Si on a identifié le provider en erreur, on peut réessayer avec un autre
    if (providerKey && globalExcludedProviders.size < 3) {
      logger?.info(`[EMAIL] 🔄 Réessai avec un autre provider pour ${subscriber.email}`);
      return sendEmailWithAutoRotation(subscriber, newsletterId, logger, globalExcludedProviders);
    }
    
    return { success: false, error: msg };
  }
}

/**
 * Envoie une newsletter à un lot d'abonnés,
 * en excluant définitivement les providers en erreur.
 *
 * @param {Object} options
 * @param {Array} options.subscribers - Liste des abonnés
 * @param {string} options.newsletterId
 * @param {string} options.templateId
 * @param {Object} options.logger
 * @returns {Promise<Object>} - { sentCount, failedCount }
 */
export async function sendNewsletterBatch({ subscribers, newsletterId, templateId, logger }) {
  const results = { 
    sentCount: 0, 
    failedCount: 0,
    providerStats: {} // Statistiques par provider pour monitoring
  };
  
  // Blacklist globale des providers pour ce batch
  const globalExcludedProviders = new Set();

  logger?.info(`[NEWSLETTER] Début envoi à ${subscribers.length} abonnés.`);

  for (const subscriber of subscribers) {
    // Validation de l'email
    if (!validateEmail(subscriber.email)) {
      logger?.warn(`[NEWSLETTER] Email invalide ignoré: ${subscriber.email}`);
      results.failedCount++;
      continue;
    }

    // Envoi avec rotation et blacklist globale
    const sendResult = await sendEmailWithAutoRotation(
      subscriber, newsletterId, logger, globalExcludedProviders
    );

    if (sendResult.success) {
      results.sentCount++;
      
      if (sendResult.providerKey) {
        results.providerStats[sendResult.providerKey] = (results.providerStats[sendResult.providerKey] || 0) + 1;
      }
    
      // ✅ Mise à jour dans la table prospects (email, status, last_sent, provider)
      await supabase
        .from('prospects')
        .update({
          email: subscriber.email,
          status: 'sent',
          last_sent: new Date().toISOString(),
          provider: sendResult.providerInfo?.providerName
        })
        .eq('id', subscriber.id);
    } else {
      results.failedCount++;
    
      // ❌ Mise à jour même en cas d’échec
      await supabase
        .from('prospects')
        .update({
          email: subscriber.email,
          status: 'failed',
          last_sent: new Date().toISOString(),
          provider: null
        })
        .eq('id', subscriber.id);
    
      logger?.warn(`[NEWSLETTER] Échec pour ${subscriber.email}: ${sendResult.error}`);
    }
    
    // Pause courte entre les envois pour éviter les rate limits
    if (subscribers.length > 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  logger?.info(
    `[NEWSLETTER] Terminé. Envoyés: ${results.sentCount}, Échecs: ${results.failedCount}`
  );
  
  // Log des statistiques par provider
  if (Object.keys(results.providerStats).length > 0) {
    logger?.info(`[NEWSLETTER] Distribution par provider: ${JSON.stringify(results.providerStats)}`);
  }

  // Mettre à jour les stats (recommandé: sauvegarder en DB)
  await updateNewsletterStats(newsletterId, results);

  const providerDistribution = Object.entries(results.providerStats).map(([key, count]) => {
    const [provider, accountId] = key.split('-');
    return `${provider}:${accountId} (${count})`;
  }).join(', ');
  
  logger?.info(`[NEWSLETTER] Distribution: ${providerDistribution}`);
  
  // Pour le debug, ajouter un log sur les providers exclus
  if (globalExcludedProviders.size > 0) {
    logger?.warn(`[NEWSLETTER] Providers exclus: ${Array.from(globalExcludedProviders).join(', ')}`);
  }

  return results;
}

/**
 * Met à jour les statistiques de la newsletter
 * Recommandation: remplacer par un appel à un service ou DB
 */
async function updateNewsletterStats(newsletterId, results) {
  const { sentCount, failedCount, providerStats } = results;
  console.log(`Stats newsletter ${newsletterId} — envoyés: ${sentCount}, échecs: ${failedCount}`);
  
  if (providerStats && Object.keys(providerStats).length > 0) {
    console.log(`Distribution par provider:`, providerStats);
  }

  // Exemple: appel à un microservice ou mise à jour en base de données
  // await newsletterService.updateStats(newsletterId, { sentCount, failedCount, providerStats });

  // Envoi d'un événement pour monitoring si nécessaire
  if (failedCount > 0) {
    await inngest.send({
      name: EVENTS.EMAIL_FAILED,
      data: {
        newsletterId,
        sentCount,
        failedCount,
        providerStats,
        timestamp: new Date().toISOString(),
      }
    }).catch(err => {
      console.error(`Erreur lors de l'envoi de l'événement Inngest:`, err);
    });
  }
}