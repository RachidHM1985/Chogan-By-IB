import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email manquant' });
    }

    try {
      // Supprimer le prospect de la base de données
      const { data, error } = await supabase
        .from('prospects')
        .delete()
        .eq('email', email);

      if (error) throw error;

      // Répondre que l'utilisateur a été désabonné avec succès
      res.status(200).json({ 
        message: 'Vous avez été désinscrit de notre newsletter avec succès.' 
      });
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      res.status(500).json({ message: 'Erreur lors du désabonnement. Veuillez réessayer plus tard.' });
    }
  } else {
    // Gérer les méthodes autres que GET
    res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
