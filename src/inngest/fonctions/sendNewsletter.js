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
    const batchSize = event.data.batchSize || 50;

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

    const providers = ['sendgrid', 'brevo', 'mailjet'];
    const providerStats = {};

    // Initialiser les statistiques
    providers.forEach(p => {
      providerStats[p] = { success: 0, failed: 0 };
    });

    // Traiter les abonnés par fournisseur de manière optimisée
    for (const provider of providers) {
      const subscribersForProvider = batch.filter((_, idx) => idx % providers.length === providers.indexOf(provider));

      if (subscribersForProvider.length === 0) continue;

      // Diviser par mini-lots pour un envoi plus rapide
      for (let i = 0; i < subscribersForProvider.length; i += 30) {
        const miniLot = subscribersForProvider.slice(i, i + 30);

        try {
          // Envoyer les emails
          const result = await step.run(`send-${provider}-${i}`, async () => {
            const client = await getEmailProviderClient(provider);
            const sendResult = await sendNewsletterBatch({
              subscribers: miniLot,
              newsletterId,
              provider,
              logger
            });

            return {
              sent: sendResult.sentCount,
              failed: sendResult.failedCount
            };
          });

          // Mettre à jour les statistiques
          providerStats[provider].success += result.sent;
          providerStats[provider].failed += result.failed;

          // Mettre à jour la base de données
          await step.run(`update-db-${i}`, async () => {
            await supabase.from('prospects').update({
              status: 'sent',
              last_sent: new Date().toISOString(),
              provider,
            }).in('email', miniLot.map(s => s.email));
            return { updated: true };
          });

          // Pause entre les mini-lots pour ne pas surcharger
          if (i + 5 < subscribersForProvider.length) {
            logger.info(`⏳ Pause entre mini-lots de ${provider}`);
            await step.sleep(`pause-${i}`, '5s');
          }
        } catch (error) {
          logger.error(`[${provider}] Erreur lors de l'envoi des emails : ${error.message}`);
          providerStats[provider].failed += miniLot.length;
        }
      }
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
