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

      // Renvoyer tous les résultats de la table 'parfums'
      return res.status(200).json(data);
    }

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
      return res.status(404).json({ message: 'Aucun parfum trouvé' });
    }

    // Renvoyer les résultats de la recherche
    return res.status(200).json(data);

  } catch (error) {
    // Gestion des erreurs générales
    console.error('Erreur de recherche:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
}
