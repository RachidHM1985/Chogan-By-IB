import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si l'URL ou la clé est manquante, une erreur sera levée
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour récupérer les abonnés avec pagination optimisée
export const getSubscribersInSegment = async () => {
  let processedCount = 0;  // Variable pour suivre le nombre total de prospects traités
  const dailyLimit = 1500;  // Limite de 1500 prospects par jour
  let hasMoreData = true;
  let lastId = 0;  // ID du dernier prospect traité pour la pagination
  let subscribers = [];  // Liste des abonnés traités

  try {
    while (hasMoreData) {
      // Effectuer la requête en utilisant la pagination par curseur (basée sur 'id')
      const remainingProspects = dailyLimit - processedCount;
      const fetchSize = remainingProspects < 100 ? remainingProspects : 100;  // Ne pas dépasser la limite restante, maximum 100 par page
    
      // Effectuer la requête avec pagination par curseur (basée sur 'id')
      const { data, error, count } = await supabase
        .from('prospects')
        .select('prenom, nom, email, status, id', { count: 'exact' })  // Récupérer l'ID pour pagination
        .is('status', null)  // Filtrer par statut null
        .gt('id', lastId)  // Utiliser l'ID pour la pagination (plus efficace)
        .order('id', { ascending: true })  // Trier par ID croissant pour un ordre logique
        .limit(fetchSize);  // Limiter les résultats à la taille de la page
    
      // Si une erreur survient lors de la récupération des données
      if (error) {
        throw new Error(error.message);
      }
    
      // Ajouter les abonnés récupérés à la liste totale
      subscribers = [...subscribers, ...data];
    
      // Mettre à jour le nombre total de prospects traités
      processedCount += data.length;
    
      // Si moins de résultats sont récupérés que le fetchSize, on a atteint la fin
      if (data.length < fetchSize) {
        hasMoreData = false;
      } else {
        // Mettre à jour le dernier ID pour la pagination
        lastId = data[data.length - 1].id;
      }
    
      // Si la limite de 1500 prospects est atteinte, arrêter la boucle
      if (processedCount >= dailyLimit) {
        hasMoreData = false;
      }
    }

    // Retourner tous les abonnés récupérés
    return subscribers;
  } catch (err) {
    console.error('Erreur lors de la récupération des abonnés:', err.message);
    throw err;  // Propager l'erreur si nécessaire
  }
};
