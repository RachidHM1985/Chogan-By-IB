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

    const subscribers = await step.run('get-subscribers', () => getSubscribersInSegment(segmentId));

    if (!subscribers?.length) {
      logger.info('Aucun abonné à traiter.');
      return;
    }

    const batch = subscribers.slice(0, batchSize);
    const providers = ['sendgrid', 'brevo', 'mailjet'];
    const totalStats = [];

    for (const [index, provider] of providers.entries()) {
      const client = await step.run(`get-client-${provider}`, () => getEmailProviderClient());

      const maskedKey = client.apiKey
        ? client.apiKey.slice(0, 4) + '...' + client.apiKey.slice(-4)
        : 'Non disponible';

      const logProviderInfo = `[${provider}] Clé API utilisée : ${maskedKey}`;
      logger.info(logProviderInfo);

      const prospectsForProvider = batch.filter((_, idx) => idx % providers.length === providers.indexOf(provider));
      const stats = { provider, success: 0, failed: 0 };

      try {
        for (let i = 0; i < prospectsForProvider.length; i += 10) {
          const lot = prospectsForProvider.slice(i, i + 10);

          const sendBatchResults = await step.run(`send-batch-${provider}-${i}`, () =>
            sendNewsletterBatch({
              subscribers: lot,
              newsletterId,
              provider,
              logger,
            })
          );

          stats.success += sendBatchResults.sentCount;
          stats.failed += sendBatchResults.failedCount;

          const status = sendBatchResults.failedCount > 0 ? 'failed' : 'sent';

          await step.run(`update-db-${provider}-${i}`, async () => {
            const updates = lot.map((prospect) => ({
              email: prospect.email,
              status,
              last_sent: new Date().toISOString(),
              provider,
              last_newsletter_id: newsletterId,
              segment_id: segmentId,
              updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase.from('prospects').upsert(updates, {
              onConflict: ['email'],
            });

            if (error) {
              logger.error('Erreur lors de la mise à jour des prospects:', error.message);
            }
          });

          const lotInfo = `[${provider}] Lot de ${lot.length} : ${sendBatchResults.sentCount} envoyés, ${sendBatchResults.failedCount} échoués.`;
          logger.info(lotInfo);

          if (i + 10 < prospectsForProvider.length) {
            logger.info(`⏳ Attente de 10 minutes avant le prochain lot pour ${provider}...`);
            await step.sleep(`wait-batch-${provider}-${i}`, '10m');
          }
        }

        totalStats.push(stats);

        if (index < providers.length - 1) {
          logger.info(`⏳ Attente de 10 minutes avant de passer au fournisseur suivant...`);
          await step.sleep(`wait-next-provider-${index}`, '10m');
        }
      } catch (err) {
        logger.error(`[${provider}] Erreur lors de l'envoi de la newsletter : ${err.message}`);
      }
    }

    logger.info('📊 Résumé global des envois :');
    totalStats.forEach((stat) => {
      logger.info(`${stat.provider} → ✅ ${stat.success} envoyés / ❌ ${stat.failed} échoués`);
    });

    return { stats: totalStats };
  }
);
