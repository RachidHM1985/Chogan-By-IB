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
    console.log('💡 Fonction `sendNewsletter` déclenchée (console.log)');
    
    const segmentId = event.data.segmentId || 1;
    const subscribers = await getSubscribersInSegment(segmentId);

    if (!subscribers?.length) {
      logger.info('Aucun abonné à traiter.');
      return;
    }

    // Diviser les prospects par fournisseur d’envoi
    const providers = ['sendgrid', 'brevo', 'mailjet'];
    const totalStats = [];

    // Préparer les envois par fournisseur
    for (const provider of providers) {
      const client = getEmailProviderClient(provider);
      const prospectsForProvider = subscribers.filter((_, idx) => idx % providers.length === providers.indexOf(provider));
      const stats = { provider, success: 0, failed: 0 };

      try {
        // Envoyer les newsletters par lots
        const sendBatchResults = await sendNewsletterBatch({
          subscribers: prospectsForProvider,
          newsletterId: event.data.newsletterId,
          provider
        });

        // Mettre à jour les statistiques pour le fournisseur
        stats.success = sendBatchResults.sentCount;
        stats.failed = sendBatchResults.failedCount;

        logger.info(`[${provider}] : ${stats.success} envoyés, ${stats.failed} échoués.`);

        totalStats.push(stats);

        // Mise à jour de l'état global de l'envoi pour chaque abonné
        const status = sendBatchResults.failedCount > 0 ? 'failed' : 'success';

        // Regrouper les mises à jour dans un seul appel pour plus d'efficacité
        const updates = prospectsForProvider.map((prospect) => ({
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
      } catch (err) {
        logger.error(`[${provider}] Erreur lors de l'envoi de la newsletter :`, err.message);
      }
    }

    return { stats: totalStats };
  }
);
