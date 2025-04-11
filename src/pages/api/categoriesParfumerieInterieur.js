import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // Récupération des catégories depuis la table 'parfumerie_interieur'
    const { data, error } = await supabase
      .from('parfumerie_interieur')
      .select('categorie');

    // Gestion des erreurs
    if (error) {
      console.error('Erreur Supabase:', error.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }

    // Vérification que data est bien un tableau
    const categories = data && Array.isArray(data) 
      ? [...new Set(data.map(row => row.categorie))] 
      : [];

    // Retourner les catégories distinctes
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
