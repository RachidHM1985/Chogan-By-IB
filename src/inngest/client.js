// inngest/client.js
import { Inngest } from 'inngest';

// Initialiser le client Inngest
export const inngest = new Inngest({ 
  id: 'newsletter-batch-sending',
  eventKey: process.env.INNGEST_EVENT_KEY 
});

// Constantes pour les événements
export const EVENTS = {
  NEWSLETTER_TRIGGER: 'newsletter/trigger',
  BATCH_PROCESSED: 'newsletter/batch.processed',
  EMAIL_SENT: 'newsletter/email.sent',
  EMAIL_FAILED: 'newsletter/email.failed'
};