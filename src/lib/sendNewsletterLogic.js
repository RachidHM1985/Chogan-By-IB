import { selectBestProvider, updateProviderUsage } from './utils/providerRotation';
import { logProviderUsage, getEmailProviderClient } from './emailProviders';
import { validateEmail } from './utils/validation';
import { generateEmailHTML } from '../lib/emailTemplates/generateEmailHTML'
import { inngest, EVENTS } from '../inngest/client';

/**
 * Génère le contenu HTML de l'email pour un prospect
 * @param {Object} prospect - L'objet prospect contenant les informations nécessaires
 * @param {string} templateId - L'ID du template à utiliser
 * @returns {string} - Le contenu HTML généré
 */

export async function sendNewsletterBatch({ subscribers, newsletterId, templateId, logger }) {
  const results = {
    sentCount: 0,
    failedCount: 0,
    hasMoreSubscribers: false,
  };

  logger?.info(`[NEWSLETTER] Préparation de l'envoi à ${subscribers.length} abonnés.`);

  try {
    for (const subscriber of subscribers) {
      if (!validateEmail(subscriber.email)) {
        logger?.warn(`[NEWSLETTER] ⛔ Email invalide ignoré: ${subscriber.email}`);
        results.failedCount++;
        continue;
      }

      // Sélection dynamique du provider selon les quotas
      const providerInfo = await selectBestProvider(1);
      const provider = await getEmailProviderClient(providerInfo, logger);
      const emailResult = await provider.send({
        to: subscriber.email,
        subject: `Découvrez la beauté accessible avec Chogan 🌸`,
        html: await generateEmailHTML(subscriber),
        trackingId: `newsletter-${newsletterId}-${subscriber.id}`,
      });

      if (emailResult.success && emailResult.messageId) {
        logger?.debug(`[NEWSLETTER] ✅ Envoyé à ${subscriber.email}, messageId: ${emailResult.messageId}`);
        results.sentCount++;
      } else {
        logger?.warn(`[NEWSLETTER] ⚠️ Succès suspect pour ${subscriber.email}, pas de messageId`);
        results.sentCount++;
      }

      // Mettre à jour les quotas utilisés
      updateProviderUsage(providerInfo.providerName, providerInfo.accountId, 1);
      logProviderUsage(provider, 1);
    }

    // Log de fin
    logger?.info(`[NEWSLETTER] ✅ Terminé. Envoyés: ${results.sentCount}, Échecs: ${results.failedCount}`);

    await updateNewsletterStats(newsletterId, results.sentCount, results.failedCount);

    return results;
  } catch (error) {
    logger?.error(`[NEWSLETTER] ❌ Erreur d'envoi: ${error.message}`);

    // Envoi d'un événement Inngest pour marquer l'échec global
    await inngest.send({
      name: EVENTS.EMAIL_FAILED,
      data: {
        message: 'Erreur globale lors de l\'envoi de la newsletter.',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
    });

    return { success: false, message: error.message };
  }
}

async function updateNewsletterStats(newsletterId, sentCount, failedCount) {
  console.log(`Statistiques de la newsletter ${newsletterId}:`);
  console.log(`Nombre d'emails envoyés : ${sentCount}`);
  console.log(`Nombre d'emails échoués : ${failedCount}`);
}

