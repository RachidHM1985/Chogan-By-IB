import { inngest, EVENTS } from '../client';
import { getSubscribersInSegment } from '../../lib/supabaseClient';
import { sendNewsletterBatch } from '../../lib/sendNewsletterLogic';
import { getEmailProviderClient } from '../../lib/emailProviders';
import { supabase } from '../../lib/supabaseClient';

export const sendNewsletter = inngest.createFunction(
  { id: 'send-newsletter' },
  { event: EVENTS.NEWSLETTER_TRIGGER },
  async ({ event, step, logger }) => {
    logger.info('💡 Fonction `sendNewsletter` déclenchée !');

    const segmentId = event.data.segmentId || 1;
    const newsletterId = event.data.newsletterId;
    const batchSize = event.data.batchSize || 100;

    const subscribers = await getSubscribersInSegment(segmentId);

    if (!subscribers?.length) {
      logger.info('Aucun abonné à traiter.');
      return;
    }

    // Limiter à batchSize
    const batch = subscribers.slice(0, batchSize);

    // Diviser les prospects par fournisseur d’envoi
    const providers = ['sendgrid', 'brevo', 'mailjet'];
    const totalStats = [];

    // Préparer les envois par fournisseur
    for (const [index, provider] of providers.entries()) {
      const client = await getEmailProviderClient();
      const maskedKey = client.apiKey
        ? client.apiKey.slice(0, 4) + '...' + client.apiKey.slice(-4)
        : 'Non disponible';
      logger.info(`[${provider}] Clé API utilisée : ${maskedKey}`);

      const prospectsForProvider = batch.filter((_, idx) => idx % providers.length === providers.indexOf(provider));
      const stats = { provider, success: 0, failed: 0 };

      try {
        // Découper les prospects en lots de 10
        for (let i = 0; i < prospectsForProvider.length; i += 10) {
          const lot = prospectsForProvider.slice(i, i + 10);

          const sendBatchResults = await sendNewsletterBatch({
            subscribers: lot,
            newsletterId,
            provider
          });

          stats.success += sendBatchResults.sentCount;
          stats.failed += sendBatchResults.failedCount;

          const status = sendBatchResults.failedCount > 0 ? 'failed' : 'success';

          const updates = lot.map((prospect) => ({
            email: prospect.email,
            status,
            last_sent: new Date().toISOString(),
            provider,
          }));

          const { error } = await supabase
            .from('prospects')
            .upsert(updates, { onConflict: ['email'] });

          if (error) {
            logger.error('Erreur lors de la mise à jour des prospects:', error.message);
          }

          logger.info(`[${provider}] Lot de ${lot.length} : ${sendBatchResults.sentCount} envoyés, ${sendBatchResults.failedCount} échoués.`);

          // Attendre 10 minutes entre chaque lot
          if (i + 10 < prospectsForProvider.length) {
            logger.info(`⏳ Attente de 10 minutes avant le prochain lot pour ${provider}...`);
            await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
          }
        }

        totalStats.push(stats);

        // Attendre 10 minutes avant de passer au fournisseur suivant
        if (index < providers.length - 1) {
          logger.info(`⏳ Attente de 10 minutes avant de passer au fournisseur suivant...`);
          await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
        }

      } catch (err) {
        logger.error(`[${provider}] Erreur lors de l'envoi de la newsletter :`, err.message);
      }
    }

    return { stats: totalStats };
  }
);
