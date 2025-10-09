// src/pages/api/unsubscribe.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email manquant ou invalide' });
  }

  try {
    // Vérification de l’existence du prospect
    const { data: existing, error: checkError } = await supabase
      .from('prospects')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (!existing) {
      return res.status(404).json({ message: 'Adresse non trouvée.' });
    }

    // Suppression du prospect
    const { error: deleteError } = await supabase
      .from('prospects')
      .delete()
      .eq('email', email);

    if (deleteError) throw deleteError;

    // ✅ Réponse utilisateur claire
    return res.status(200).json({
      message: 'Vous avez été désinscrit de notre newsletter avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return res.status(500).json({
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    });
  }
}
