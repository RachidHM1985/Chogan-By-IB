import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  try {
    // Interroger la table 'aurodhea' pour récupérer les catégories
    const { data, error } = await supabase
      .from('aurodhea')
      .select('categorie');

    if (error) throw error;

    // Utiliser un Set pour filtrer les valeurs uniques
    const categories = [...new Set(data.map(row => row.categorie))];
    // Retourner les catégories distinctes dans la réponse JSON
    res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
}
