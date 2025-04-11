// inngest/index.js
import { serve } from 'inngest/next';
import { sendNewsletter } from '../inngest/fonctions/sendNewsletter'; 

export const { GET, POST, PUT } = serve('send-newsletter', [
    sendNewsletter
  ]);

