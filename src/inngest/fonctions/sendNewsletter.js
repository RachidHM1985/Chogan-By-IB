import { inngest, EVENTS } from '../client';
import { getSubscribersInSegment } from '../../lib/supabaseClient';
import { sendNewsletterBatch } from '../../lib/sendNewsletterLogic';
import { getEmailProviderClient } from '../../lib/emailProviders';
import { supabase } from '../../lib/supabaseClient';

// Fonction principale pour l'envoi de newsletter
export const sendNewsletter = inngest.createFunction(
  { id: 'send-newsletter' },
  { event: EVENTS.NEWSLETTER_TRIGGER },
  async ({ event, step, logger }) => {
    const segmentId    = event.data.segmentId  || 1;
    const newsletterId = event.data.newsletterId;
    const batchSize    = event.data.batchSize   || 100;
    const taskId       = `newsletter-${newsletterId}-${Date.now()}`;
    const subscribers  = await getSubscribersInSegment(segmentId);
    const totalBatches = Math.ceil(subscribers.length / batchSize);

    logger.info(`▶️ Lancement newsletter : ${subscribers.length} abonnés, ${totalBatches} lots.`);
    
    // Lot 0 —ÉMISSION IMMÉDIATE via step.sendEvent
    await step.sendEvent('process-batch-0', {
      name: 'newsletter.process.batch',
      data: {
        taskId,
        newsletterId,
        segmentId,
        batchIndex: 0,
        batchSize,
        totalBatches
      }
    });

    return { status: 'started', taskId, totalBatches };
  }
);

// Fonction pour traiter un lot d'abonnés
export const processNewsletterBatch = inngest.createFunction(
  { id: 'process-newsletter-batch' },
  { event: 'newsletter.process.batch' },
  async ({ event, step, logger }) => {
    const { taskId, newsletterId, segmentId, batchIndex, batchSize, totalBatches } = event.data;
    
    logger.info(`🚀 Démarrage lot #${batchIndex}`);

    // 1) On récupère précisément ce lot
    const all = await getSubscribersInSegment(segmentId);
    const batch = all.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
    
    // 2) On appelle ta logique d’envoi
    await step.run(`send-batch-${batchIndex}`, () =>
      sendNewsletterBatch({ subscribers: batch, newsletterId, logger })
    );

    // 3) On sauve les stats du batch
    await step.run('save-batch-results', async () => {
      await supabase.from('newsletter_batch_stats').insert({
        task_id:      taskId,
        batch_index:  batchIndex,
        processed_at: new Date().toISOString(),
      });
      return { saved: true };
    });

    // 4) Planifier le lot suivant, avec délai
    if (batchIndex + 1 < totalBatches) {
      logger.info(`⏱️ Lot #${batchIndex} terminé — planification lot #${batchIndex + 1} dans 30 min`);
      await step.sendEvent(`process-batch-${batchIndex + 1}`, {
        name: 'newsletter.process.batch',
        data: {
          taskId,
          newsletterId,
          segmentId,
          batchIndex: batchIndex + 1,
          batchSize,
          totalBatches
        },
        delay: '30m'
      });
      return { status: 'scheduled', nextBatch: batchIndex + 1 };
    }

    logger.info(`✅ Tous les lots (${totalBatches}) ont été traités.`);
    return { status: 'all_completed' };
  }
);

export const sendMiniNewsletterBatch = inngest.createFunction(
  { id: 'newsletter-send-subbatch' },
  { event: 'newsletter.send.subbatch' },
  async ({ event, step, logger }) => {
    const { taskId, newsletterId, batchIndex, miniBatchIndex, subscribers } = event.data;

    logger.info(`📦 Envoi du mini-lot #${miniBatchIndex} du batch #${batchIndex} (${subscribers.length} abonnés)`);

    try {
      const result = await step.run(`send-mini-batch-${miniBatchIndex}`, async () => {
        return await sendNewsletterBatch({
          subscribers,
          newsletterId,
          logger
        });
      });

      return {
        status: 'mini_batch_sent',
        batchIndex,
        miniBatchIndex,
        sentCount: result.sentCount,
        failedCount: result.failedCount
      };
    } catch (error) {
      logger.error(`❌ Erreur lors du mini-lot #${miniBatchIndex} : ${error.message}`);

      return {
        status: 'failed',
        batchIndex,
        miniBatchIndex,
        error: error.message
      };
    }
  }
);