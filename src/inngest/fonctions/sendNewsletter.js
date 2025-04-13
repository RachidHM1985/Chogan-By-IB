import { inngest, EVENTS } from '../client';
import { getSubscribersInSegment } from '../../lib/supabaseClient';
import { sendNewsletterBatch } from '../../lib/sendNewsletterLogic';
import { getEmailProviderClient } from '../../lib/emailProviders';
import { supabase } from '../../lib/supabaseClient';

// Fonction principale pour l'envoi de newsletter
export const sendNewsletter = inngest.createFunction(
  { id: 'send-newsletter' },
  { event: EVENTS.NEWSLETTER_TRIGGER },
  async ({ event, step }) => {
    const segmentId = event.data.segmentId || 1;
    const newsletterId = event.data.newsletterId;
    const batchSize = event.data.batchSize || 50;

    // Créer un ID de tâche unique pour cette exécution
    const taskId = `newsletter-${newsletterId}-${Date.now()}`;
    
    // Stocker les paramètres de la tâche dans Supabase
    await step.run('init-task', async () => {
      await supabase.from('newsletter_tasks').insert({
        task_id: taskId,
        newsletter_id: newsletterId,
        segment_id: segmentId,
        status: 'started',
        created_at: new Date().toISOString()
      });
      return { initialized: true };
    });

    // Récupérer le compte des abonnés
    const subscriberCount = await step.run('count-subscribers', async () => {
      const subscribers = await getSubscribersInSegment(segmentId);
      
      // Stocker le nombre total dans la base de données
      await supabase.from('newsletter_tasks').update({
        total_subscribers: subscribers?.length || 0
      }).eq('task_id', taskId);
      
      return subscribers?.length || 0;
    });

    if (subscriberCount === 0) {
      await supabase.from('newsletter_tasks').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: 'no_subscribers'
      }).eq('task_id', taskId);
      
      return { status: 'completed', subscribers: 0 };
    }

    // Calculer le nombre de lots
    const totalBatches = Math.ceil(subscriberCount / batchSize);
    
    // Déclencher le traitement du premier lot
    // CORRECTION: Utiliser le bon format pour envoyer un événement
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
  async ({ event, step }) => {
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
    }, { retain: false });
    
    const providers = ['sendgrid', 'brevo', 'mailjet'];
    const providerStats = {};
    
    // Initialiser les statistiques
    providers.forEach(p => {
      providerStats[p] = { success: 0, failed: 0 };
    });
    
    // Distribuer les abonnés aux différents fournisseurs
    for (const provider of providers) {
      const subscribersForProvider = batch.filter((_, idx) => idx % providers.length === providers.indexOf(provider));
      
      if (subscribersForProvider.length === 0) continue;
      
      // Traiter par mini-lots
      for (let i = 0; i < subscribersForProvider.length; i += 5) {
        const miniLot = subscribersForProvider.slice(i, i + 5);
        
        try {
          // Envoyer les emails
          const result = await step.run(`send-${provider}-${i}`, async () => {
            const client = await getEmailProviderClient(provider);
            const sendResult = await sendNewsletterBatch({
              subscribers: miniLot,
              newsletterId,
              provider,
              logger: { info: () => {}, error: () => {} }
            });
            
            return {
              sent: sendResult.sentCount,
              failed: sendResult.failedCount
            };
          }, { retain: false });
          
          // Mettre à jour les statistiques
          providerStats[provider].success += result.sent;
          providerStats[provider].failed += result.failed;
          
          // Mettre à jour la base de données
          await step.run(`update-db-${i}`, async () => {
            // Mise à jour minimaliste
            await supabase.from('prospects').update({
              status: 'sent',
              last_sent: new Date().toISOString(),
              provider,
              last_newsletter_id: newsletterId
            }).in('email', miniLot.map(s => s.email));
            
            return { updated: true };
          }, { retain: false });
          
          // Courte pause entre les mini-lots
          if (i + 5 < subscribersForProvider.length) {
            await step.sleep(`pause-${i}`, '5s');
          }
        } catch (error) {
          // En cas d'erreur, enregistrer l'échec
          providerStats[provider].failed += miniLot.length;
          
          await supabase.from('newsletter_errors').insert({
            task_id: taskId,
            batch_index: batchIndex,
            provider,
            error_message: error.message.substring(0, 255),
            occurred_at: new Date().toISOString()
          });
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
      // CORRECTION: Utiliser le bon format pour envoyer un événement
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