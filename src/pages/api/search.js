// /pages/api/perfumes.js (API Handler)
import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  const { query } = req.query;

  try {
    // Si aucun paramètre de recherche n'est fourni, on récupère tous les parfums
    if (!query || query.trim().length === 0) {
      const { data, error } = await supabase
        .from('parfums')
        .select('*');

      if (error) {
        console.error('Erreur Supabase:', error);
        return res.status(500).json({ error: 'Erreur interne de la base de données' });
      }

      return res.status(200).json(data); // Renvoyer tous les résultats de la table 'parfums'
    }

    // Recherche sur toutes les colonnes de la table 'parfums'
    const { data, error } = await supabase
      .from('parfums')
      .select('*')
      .or(
        `nom_produit.ilike.%${query}%,code_produit.ilike.%${query}%,nom_marque.ilike.%${query}%,genre.ilike.%${query}%,description.ilike.%${query}%`
      );

    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ error: 'Erreur interne de la base de données' });
    }

    // Si pas de résultats, renvoyer un message
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Aucun parfum trouvé' });
    }

    return res.status(200).json(data); // Renvoyer les résultats de la recherche
  } catch (error) {
    console.error('Erreur de recherche:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
}
