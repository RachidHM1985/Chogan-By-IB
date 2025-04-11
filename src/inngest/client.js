// inngest/client.js
import { Inngest } from 'inngest';

// Initialiser le client Inngest
export const inngest = new Inngest({ 
  id: 'send-newsletter',
  eventKey: process.env.INNGEST_EVENT_KEY 
});

// Constantes pour les événements
export const EVENTS = {
  EMAIL_SENT: 'email_sent',
  EMAIL_FAILED: 'email_failed',
  NEWSLETTER_TRIGGER: 'newsletter/send'
};