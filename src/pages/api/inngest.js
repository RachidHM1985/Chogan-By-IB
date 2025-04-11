// pages/api/inngest.js
import { serve } from 'inngest/next';
import { inngest } from '../../inngest/client';
import { sendNewsletter } from '../../inngest/fonctions/sendNewsletter';

// Regrouper toutes les fonctions Inngest
const functions = [sendNewsletter];

// Servir le point d'entrée Inngest
export default serve(inngest, functions);