import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  const { query } = req.query;

  // Vérification si la requête est présente et non vide
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Aucune requête de recherche fournie' });
  }

  try {
    // Recherche dans la table 'parfums' avec des conditions 'OR' pour les colonnes recherchées
    const { data, error } = await supabase
      .from('parfums')
      .select('*')
      .or(`nom_produit.ilike.%${query}%,code.ilike.%${query}%,genre.ilike.%${query}%,nom_marque.ilike.%${query}%`);

    // Gestion des erreurs Supabase
    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ error: 'Erreur interne de la base de données' });
    }

    // Si pas de résultats, renvoyer un tableau vide
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Renvoyer les résultats de la recherche
    return res.status(200).json(data);

  } catch (error) {
    // Gestion des erreurs générales
    console.error('Erreur de recherche:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
}
