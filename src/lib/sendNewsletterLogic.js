/**
 * newsletterSender.js
 *
 * Envoi de newsletters avec rotation automatique des fournisseurs
 * et exclusion définitive des fournisseurs en erreur.
 *
 * Actions :
 *  - Validation des emails
 *  - Sélection et rotation des providers
 *  - Gestion des échecs et blacklist globale
 *  - Logging et statistiques
 *  - Envoi d'événements Inngest en cas d'erreur critique
 *
 * Recommandations :
 *  - Surveiller régulièrement les logs pour détecter les providers en panne
 *  - Mettre en place des alertes pour Inngest EVENT.EMAIL_FAILED
 *  - Adapter le selectBestProvider pour tenir compte des quotas et latences
 *  - Externaliser updateNewsletterStats dans un service métier ou une base de données
 */

import { selectBestProvider, updateProviderUsage } from './utils/providerRotation';
import { logProviderUsage, getEmailProviderClient } from './emailProviders';
import { validateEmail } from './utils/validation';
import { generateEmailHTML } from '../lib/emailTemplates/generateEmailHTML';
import { inngest, EVENTS } from '../inngest/client';

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
      emailCount: 1,
      excludeProviders: Array.from(globalExcludedProviders)
    });

    if (!providerInfo) {
      logger?.warn(`[EMAIL] Aucun fournisseur disponible pour ${subscriber.email}`);
      return { success: false, error: 'Aucun fournisseur disponible' };
    }

    const providerKey = `${providerInfo.providerName}-${providerInfo.accountId}`;

    // Initialisation du client provider
    const provider = await getEmailProviderClient(providerInfo, logger);
    const result = await provider.send({
      to: subscriber.email,
      subject: `Découvrez la beauté accessible avec Chogan 🌸`,
      html: await generateEmailHTML(subscriber),
      trackingId: `newsletter-${newsletterId}-${subscriber.id}`,
    });

    // Mise à jour des compteurs et logging
    updateProviderUsage(providerInfo.providerName, providerInfo.accountId, 1);
    logProviderUsage(provider, 1);
    logger?.info(`[EMAIL] ✅ Email envoyé à ${subscriber.email} via ${providerInfo.providerName}`);

    return { success: true, messageId: result.messageId };

  } catch (error) {
    // Extraction des infos provider si disponibles
    const providerName = error.providerInfo?.providerName;
    const accountId    = error.providerInfo?.accountId;
    const providerKey  = providerName && accountId ? `${providerName}-${accountId}` : null;

    // Exclusion définitive du provider en erreur
    if (providerKey) {
      globalExcludedProviders.add(providerKey);
      logger?.warn(`[EMAIL] Exclusion du provider ${providerKey} pour ce batch.`);
    }

    const status = error.statusCode;
    const msg = status === 401
      ? 'Accès refusé (401)'
      : error.message || 'Erreur inconnue';

    logger?.error(`[EMAIL] ❌ Échec envoi ${subscriber.email} : ${msg}`);
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
  const results = { sentCount: 0, failedCount: 0 };
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
    } else {
      results.failedCount++;
      logger?.warn(`[NEWSLETTER] Échec pour ${subscriber.email}: ${sendResult.error}`);
    }
  }

  logger?.info(
    `[NEWSLETTER] Terminé. Envoyés: ${results.sentCount}, Échecs: ${results.failedCount}`
  );

  // Mettre à jour les stats (recommandé: sauvegarder en DB)
  await updateNewsletterStats(newsletterId, results.sentCount, results.failedCount);

  return results;
}

/**
 * Met à jour les statistiques de la newsletter
 * Recommandation: remplacer par un appel à un service ou DB
 */
async function updateNewsletterStats(newsletterId, sentCount, failedCount) {
  console.log(`Stats newsletter ${newsletterId} — envoyés: ${sentCount}, échecs: ${failedCount}`);

  // Exemple: appel à un microservice ou mise à jour en base de données
  // await newsletterService.updateStats(newsletterId, { sentCount, failedCount });

  // Envoi d'un événement pour monitoring si nécessaire
  if (failedCount > 0) {
    await inngest.send({
      name: EVENTS.EMAIL_FAILED,
      data: {
        newsletterId,
        sentCount,
        failedCount,
        timestamp: new Date().toISOString(),
      }
    });
  }
}
