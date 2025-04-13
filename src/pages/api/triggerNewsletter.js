// pages/api/triggerNewsletter.ts

import { inngest, EVENTS } from '../../inngest/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { newsletterId, segmentId = 1, batchSize = 100 } = req.body;

    if (!newsletterId) {
      return res.status(400).json({ error: 'newsletterId manquant' });
    }

    await inngest.send({
      name: EVENTS.NEWSLETTER_TRIGGER,
      data: {
        newsletterId,
        segmentId,
        batchSize,
      },
    });

    return res.status(200).json({ message: 'Événement Inngest envoyé avec succès' });
  } catch (err) {
    console.error('Erreur Inngest API :', err);
    return res.status(500).json({ error: 'Erreur serveur Inngest' });
  }
}
