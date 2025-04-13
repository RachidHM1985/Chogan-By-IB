import { serve } from 'inngest/next';
import { inngest } from '../../inngest/client';
// Importez toutes vos fonctions Inngest ici
import { sendNewsletter } from '../../inngest/fonctions/sendNewsletter';

export default serve({
  client: inngest,
  functions: [sendNewsletter],
});