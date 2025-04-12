import { inngest, EVENTS } from '../client';
import { getSubscribersInSegment } from '../../lib/supabaseClient';
import { sendNewsletterBatch } from '../../lib/sendNewsletterLogic';
import { getEmailProviderClient } from '../../lib/emailProviders';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

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

    const batch = subscribers.slice(0, batchSize);
    const providers = ['sendgrid', 'brevo', 'mailjet'];
    const totalStats = [];

    // Préparer le fichier log externe
    const logPath = path.join('/tmp', `newsletter-log-${Date.now()}.txt`);
    const appendToFile = (message) => {
      fs.appendFileSync(logPath, `\n${new Date().toISOString()} - ${message}`);
    };

    for (const [index, provider] of providers.entries()) {
      const client = await getEmailProviderClient();
      const maskedKey = client.apiKey
        ? client.apiKey.slice(0, 4) + '...' + client.apiKey.slice(-4)
        : 'Non disponible';

      const logProviderInfo = `[${provider}] Clé API utilisée : ${maskedKey}`;
      logger.info(logProviderInfo);
      appendToFile(logProviderInfo);

      const prospectsForProvider = batch.filter((_, idx) => idx % providers.length === providers.indexOf(provider));
      const stats = { provider, success: 0, failed: 0 };

      try {
        for (let i = 0; i < prospectsForProvider.length; i += 10) {
          const lot = prospectsForProvider.slice(i, i + 10);

          const sendBatchResults = await sendNewsletterBatch({
            subscribers: lot,
            newsletterId,
            provider,
            logger
          });

          stats.success += sendBatchResults.sentCount;
          stats.failed += sendBatchResults.failedCount;

          const status = sendBatchResults.failedCount > 0 ? 'failed' : 'sent';

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
            appendToFile(`Erreur DB - ${error.message}`);
          }

          const lotInfo = `[${provider}] Lot de ${lot.length} : ${sendBatchResults.sentCount} envoyés, ${sendBatchResults.failedCount} échoués.`;
          logger.info(lotInfo);
          appendToFile(lotInfo);

          if (i + 10 < prospectsForProvider.length) {
            const waitMsg = `⏳ Attente de 10 minutes avant le prochain lot pour ${provider}...`;
            logger.info(waitMsg);
            appendToFile(waitMsg);
            await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
          }
        }

        totalStats.push(stats);

        if (index < providers.length - 1) {
          const waitNext = `⏳ Attente de 10 minutes avant de passer au fournisseur suivant...`;
          logger.info(waitNext);
          appendToFile(waitNext);
          await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
        }

      } catch (err) {
        const errMsg = `[${provider}] Erreur lors de l'envoi de la newsletter : ${err.message}`;
        logger.error(errMsg);
        appendToFile(errMsg);
      }
    }

    logger.info('📊 Résumé global des envois :');
    appendToFile('📊 Résumé global des envois :');
    totalStats.forEach(stat => {
      const statLine = `${stat.provider} → ✅ ${stat.success} envoyés / ❌ ${stat.failed} échoués`;
      logger.info(statLine);
      appendToFile(statLine);
    });

    logger.info(`📁 Logs complets enregistrés dans : ${logPath}`);

    return { stats: totalStats, logFile: logPath };
  }
);
