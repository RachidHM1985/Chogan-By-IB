import { serve } from 'inngest/next';
import { inngest } from '../../inngest/client';
// Importez toutes vos fonctions Inngest ici
import { sendNewsletter } from '../../inngest/fonctions/sendNewsletter';

// Cette fonction crée un handler qui reçoit les webhooks d'Inngest
// et exécute les fonctions correspondantes
export default serve({
  client: inngest,
  functions: [sendNewsletter], // Ajoutez toutes vos fonctions dans ce tableau
});