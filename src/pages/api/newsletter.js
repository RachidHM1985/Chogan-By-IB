// Placer ce fichier dans pages/api/newsletter.js
import { inngest } from '../../inngest/client';
// Importation correcte selon votre structure de dossier

// Définir un nom d'événement constant ici
const SEND_NEWSLETTER_EVENT = 'newsletter/send';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  try {
    // Déclencher l'événement Inngest pour l'envoi de newsletter
    await inngest.send({
      name: SEND_NEWSLETTER_EVENT,
      data: {
        triggered: new Date().toISOString(),
        source: 'admin-panel',
      },
    });
    return res.status(200).json({
      message: 'Envoi de newsletter initié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    return res.status(500).json({
      message: 'Erreur lors de l\'envoi de la newsletter',
      error: error.message
    });
  }
}