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

    // Récupérer uniquement les abonnés pour ce lot (pagination)
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

    const providers = ['sendgrid', 'brevo'];
    const providerStats = {};
    providers.forEach(p => {
      providerStats[p] = { success: 0, failed: 0 };
    });

    // ⚠️ ENVOI des mini-batches EN DEHORS DU step.run
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
        delay: `${miniBatchIndex * 10}s` // 0s, 10s, 20s...
      });
    }

    // Enregistrer les résultats de ce lot
    await step.run('save-batch-results', async () => {
      await supabase.from('newsletter_batch_stats').insert({
        task_id: taskId,
        batch_index: batchIndex,
        processed_at: new Date().toISOString(),
        stats: providerStats
      });

      return { saved: true };
    });

    // Si ce n'est pas le dernier lot, déclencher le traitement du lot suivant
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
        nextBatch: batchIndex + 1,
        remaining: totalBatches - batchIndex - 1
      };
    }

    return {
      status: 'all_completed',
      batchesProcessed: totalBatches
    };
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