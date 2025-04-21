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
    const segmentId = event.data.segmentId || 1;
    const newsletterId = event.data.newsletterId;
    const batchSize = event.data.batchSize || 100;

    // Créer un ID de tâche unique pour cette exécution
    const taskId = `newsletter-${newsletterId}-${Date.now()}`;

    // Récupérer le compte des abonnés
    const subscriberCount = await step.run('count-subscribers', async () => {
      const subscribers = await getSubscribersInSegment(segmentId);

      return subscribers?.length || 0;
    });

    // Calculer le nombre de lots
    const totalBatches = Math.ceil(subscriberCount / batchSize);

    // Log initial
    logger.info(`📊 Traitement des abonnés - ${subscriberCount} abonnés à traiter`);

    // Déclencher le traitement du premier lot
    await inngest.send({
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

    // Retourner un résultat minimal
    return {
      status: 'started',
      taskId,
      totalSubscribers: subscriberCount,
      totalBatches
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

      // Enregistrer les stats dans Supabase
      await step.run('save-mini-batch-results', async () => {
        await supabase.from('newsletter_subbatch_stats').insert({
          task_id: taskId,
          batch_index: batchIndex,
          mini_batch_index: miniBatchIndex,
          sent_count: result.sentCount,
          failed_count: result.failedCount,
          stats: result.providerStats,
          processed_at: new Date().toISOString()
        });

        return { saved: true };
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


// Fonction pour traiter un lot d'abonnés
export const processNewsletterBatch = inngest.createFunction(
  { id: 'process-newsletter-batch' },
  { event: 'newsletter.process.batch' },
  async ({ event, step, logger }) => {
    const { taskId, newsletterId, segmentId, batchIndex, batchSize, totalBatches } = event.data;

    // Récupérer uniquement les abonnés pour ce lot
    const batch = await step.run('get-batch', async () => {
      const allSubscribers = await getSubscribersInSegment(segmentId);
      const startIdx = batchIndex * batchSize;
      const endIdx = Math.min(startIdx + batchSize, allSubscribers.length);
      return allSubscribers.slice(startIdx, endIdx).map(s => ({
        id: s.id,
        email: s.email,
        first_name: s.first_name || ''
      }));
    });

    const providers = ['sendgrid', 'brevo'];
    const providerStats = {};

    // Initialiser les statistiques
    providers.forEach(p => {
      providerStats[p] = { success: 0, failed: 0 };
    });

    // Traiter les abonnés par fournisseur de manière optimisée
    await step.run("enqueue-subbatches", async () => {
      for (let i = 0; i < batch.length; i += 30) {
        const miniLot = batch.slice(i, i + 30);
        const miniBatchIndex = i / 30;
    
        await inngest.send({
          name: 'newsletter.send.subbatch',
          data: {
            taskId,
            newsletterId,
            batchIndex,
            miniBatchIndex,
            subscribers: miniLot
          }
        });
      }
    });
    

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
      // Attendre avant d'envoyer le prochain lot
      await inngest.send({
        name: 'newsletter.process.batch',
        data: {
          taskId,
          newsletterId,
          segmentId,
          batchIndex: batchIndex + 1,
          batchSize,
          totalBatches
        }
      });

      return {
        status: 'batch_completed',
        batchIndex,
        nextBatch: batchIndex + 1,
        remaining: totalBatches - batchIndex - 1
      };
    }

    // Retourner un résultat minimal
    return {
      status: 'all_completed',
      batchesProcessed: totalBatches
    };
  }
);
