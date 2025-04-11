import { inngest } from '@/lib/inngest';
import { sendNewsletterLogic } from '../lib/sendNewsletterLogic';

export const sendNewsletterWorkflow = inngest.createFunction(
  { id: 'send-newsletter-prospect' },
  { event: 'newsletter/send.prospect' },
  async ({ event, step }) => {
    const result = await step.run('envoi-emails', async () => {
      return await sendNewsletterLogic();
    });

    return {
      message: 'Envoi terminé par Inngest',
      stats: result,
    };
  }
);
