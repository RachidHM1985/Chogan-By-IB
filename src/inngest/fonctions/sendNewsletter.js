import { inngest, EVENTS } from '../client';
import { getSubscribersInSegment } from '../../lib/supabaseClient';
import { sendNewsletterBatch } from '../../lib/sendNewsletterLogic';
import { supabase } from '../../lib/supabaseClient';

// ▶️ Fonction principale pour démarrer l'envoi de newsletter
export const sendNewsletter = inngest.createFunction(
  { id: 'send-newsletter' },
  { event: EVENTS.NEWSLETTER_TRIGGER },
  async ({ event, step, logger }) => {
    const segmentId = event.data.segmentId || 1;
    const newsletterId = event.data.newsletterId;
    const batchSize = event.data.batchSize || 100;
    const taskId = `newsletter-${newsletterId}-${Date.now()}`;
    const subscribers = await getSubscribersInSegment(segmentId);
    const totalBatches = Math.ceil(subscribers.length / batchSize);

    logger.info(`▶️ Lancement newsletter : ${subscribers.length} abonnés, ${totalBatches} lots.`);

    // Premier batch immédiat
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

// 📦 Traitement d’un lot de la newsletter
export const processNewsletterBatch = inngest.createFunction(
  { id: 'process-newsletter-batch' },
  { event: 'newsletter.process.batch' },
  async ({ event, step, logger }) => {
    const { taskId, newsletterId, segmentId, batchIndex, batchSize, totalBatches } = event.data;

    const batch = await step.run('get-batch', async () => {
      const allSubscribers = await getSubscribersInSegment(segmentId, {
        limit: batchSize,
        offset: batchIndex * batchSize
      });

      return allSubscribers.map(s => ({
        id: s.id,
        email: s.email,
        first_name: s.first_name || ''
      }));
    });

    logger.info(`📦 Lot #${batchIndex} → ${batch.length} abonnés`);

    // Découpage en mini-lots de 30 abonnés
    for (let i = 0; i < batch.length; i += 30) {
      const miniLot = batch.slice(i, i + 30);
      const miniBatchIndex = i / 30;

      await step.sendEvent(`send-mini-${batchIndex}-${miniBatchIndex}`, {
        name: 'newsletter.send.subbatch',
        data: {
          taskId,
          newsletterId,
          batchIndex,
          miniBatchIndex,
          subscribers: miniLot
        },
        delay: `${miniBatchIndex * 10}s`
      });
    }

    // Stats batch (optionnelles ici)
    await step.run('save-batch-results', async () => {
      await supabase.from('newsletter_batch_stats').insert({
        task_id: taskId,
        batch_index: batchIndex,
        processed_at: new Date().toISOString()
      });
      return { saved: true };
    });

    if (batchIndex + 1 < totalBatches) {
      await inngest.send({
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

      return {
        status: 'batch_completed',
        batchIndex,
        nextBatch: batchIndex + 1
      };
    }

    return { status: 'all_completed', batchesProcessed: totalBatches };
  }
);

// ✉️ Traitement d’un mini-lot de 30 abonnés
export const sendMiniNewsletterBatch = inngest.createFunction(
  { id: 'newsletter-send-subbatch' },
  { event: 'newsletter.send.subbatch' },
  async ({ event, logger }) => {
    const { taskId, newsletterId, batchIndex, miniBatchIndex, subscribers } = event.data;

    logger.info(`📬 Envoi mini-lot #${miniBatchIndex} du lot #${batchIndex} (${subscribers.length} abonnés)`);

    try {
      const result = await sendNewsletterBatch({
        subscribers,
        newsletterId,
        logger
      });

      await supabase.from('newsletter_subbatch_stats').insert({
        task_id: taskId,
        batch_index: batchIndex,
        mini_batch_index: miniBatchIndex,
        sent_count: result.sentCount,
        failed_count: result.failedCount,
        stats: result.providerStats,
        processed_at: new Date().toISOString()
      });

      return {
        status: 'mini_batch_sent',
        batchIndex,
        miniBatchIndex,
        sentCount: result.sentCount,
        failedCount: result.failedCount
      };
    } catch (error) {
      logger.error(`❌ Échec du mini-lot #${miniBatchIndex} : ${error.message}`);
      return {
        status: 'failed',
        batchIndex,
        miniBatchIndex,
        error: error.message
      };
    }
  }
);
