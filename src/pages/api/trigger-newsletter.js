import { inngest } from '../../inngest/client';
import { EVENTS } from '../../inngest/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    console.log('Déclenchement de l\'événement Inngest pour l\'envoi de la newsletter...');
    
    // Déclencher l'événement Inngest pour l'envoi de newsletter
    await inngest.send({
      name: EVENTS.NEWSLETTER_TRIGGER,
      data: {
        triggered: new Date().toISOString(),
        source: 'admin-panel',
        // Ajouter ici d'autres données nécessaires pour votre fonction
        segmentId: req.body.segmentId || 1,
        newsletterId: req.body.newsletterId
    
      },
    });

    console.log('Événement Inngest envoyé avec succès.');

    return res.status(200).json({
      message: 'Envoi de newsletter initié avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    
    return res.status(500).json({
      message: 'Erreur lors de l\'envoi de la newsletter',
      error: error.message,
    });
  }
}