import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si l'URL ou la clé est manquante, une erreur sera levée
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour récupérer les abonnés d'un segment spécifique avec pagination
export const getSubscribersInSegment = async (segmentId) => {
  const fetchSize = 10000;  // Nombre d'abonnés à récupérer par page
  let startIndex = 0;  // Point de départ pour chaque page
  let subscribers = [];  // Tableau pour stocker tous les abonnés récupérés
  let hasMoreData = true;  // Flag pour savoir s'il reste encore des données à récupérer

  try {
    while (hasMoreData) {
      // Effectuer la requête avec pagination
      const { data, error, count } = await supabase
        .from('prospects')
        .select('prenom, nom, email, status', { count: 'exact' })  // Récupère le nombre exact de résultats
        .is('status', null)  // Filtrer par statut null
        .order('created_at', { ascending: false })  // Trier par date de création
        .range(startIndex, startIndex + fetchSize - 1);  // Limiter les résultats à la page actuelle

      // Si une erreur survient lors de la récupération des données
      if (error) {
        throw new Error(error.message);
      }

      // Ajouter les abonnés récupérés à la liste totale
      subscribers = [...subscribers, ...data];

      // Si le nombre total de données récupérées atteint la limite, arrêter la boucle
      if (subscribers.length >= count) {
        hasMoreData = false;  // Aucune donnée supplémentaire à récupérer
      } else {
        // Mettre à jour le point de départ pour la prochaine page
        startIndex += fetchSize;
      }
    }

    // Retourner tous les abonnés récupérés
    return subscribers;
  } catch (err) {
    console.error('Erreur lors de la récupération des abonnés:', err.message);
    throw err;  // Propager l'erreur si nécessaire
  }
};