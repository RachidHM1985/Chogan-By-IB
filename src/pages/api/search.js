import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { query } = req.query;
  try {
    // Si aucun paramètre de recherche n'est fourni, on récupère quelques produits de chaque table
    if (!query || query.trim().length === 0) {
      // Récupérer des échantillons de chaque table
      const [parfumsData, aurodheaData, brilhomeData, parfumerieInterieurData, peptiluxData] = await Promise.all([
        supabase.from('parfums').select('*').limit(10),
        supabase.from('aurodhea').select('*').limit(5),
        supabase.from('brilhome').select('*').limit(5),
        supabase.from('parfumerie_interieur').select('*').limit(5),
        supabase.from('peptilux').select('*').limit(5)
      ]);

      // Gérer les erreurs potentielles
      const errorCheck = [parfumsData, aurodheaData, brilhomeData, parfumerieInterieurData, peptiluxData]
        .find(result => result.error);
      
      if (errorCheck) {
        console.error('Erreur Supabase:', errorCheck.error);
        return res.status(500).json({ error: 'Erreur interne de la base de données' });
      }

      // Normaliser les résultats pour un format cohérent
      const results = [
        ...normalizeParfums(parfumsData.data || []),
        ...normalizeAurodhea(aurodheaData.data || []),
        ...normalizeBrilhome(brilhomeData.data || []),
        ...normalizeParfumerieInterieur(parfumerieInterieurData.data || []),
        ...normalizePeptilux(peptiluxData.data || [])
      ];

      return res.status(200).json(results);
    }

    // Recherche avec une requête spécifique
    const cleanQuery = query.trim();
    
    const [parfumsData, aurodheaData, brilhomeData, parfumerieInterieurData, peptiluxData] = await Promise.all([
      supabase
        .from('parfums')
        .select('*')
        .or(`nom_produit.ilike.%${cleanQuery}%,code_produit.ilike.%${cleanQuery}%,nom_marque.ilike.%${cleanQuery}%,genre.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(20),
      
      supabase
        .from('aurodhea')
        .select('*')
        .or(`code_produit.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,categorie.ilike.%${cleanQuery}%`)
        .limit(10),
      
      supabase
        .from('brilhome')
        .select('*')
        .or(`nom_produit.ilike.%${cleanQuery}%,code_produit.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,categorie.ilike.%${cleanQuery}%`)
        .limit(10),
      
      supabase
        .from('parfumerie_interieur')
        .select('*')
        .or(`nom_produit.ilike.%${cleanQuery}%,code_produit.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,categorie.ilike.%${cleanQuery}%`)
        .limit(10),
      
      supabase
        .from('peptilux')
        .select('*')
        .or(`nom_produit.ilike.%${cleanQuery}%,code_produit.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,categorie.ilike.%${cleanQuery}%`)
        .limit(10)
    ]);

    // Gérer les erreurs potentielles
    const errorCheck = [parfumsData, aurodheaData, brilhomeData, parfumerieInterieurData, peptiluxData]
      .find(result => result.error);
    
    if (errorCheck) {
      console.error('Erreur Supabase:', errorCheck.error);
      return res.status(500).json({ error: 'Erreur interne de la base de données' });
    }

    // Normaliser et combiner les résultats
    const results = [
      ...normalizeParfums(parfumsData.data || []),
      ...normalizeAurodhea(aurodheaData.data || []),
      ...normalizeBrilhome(brilhomeData.data || []),
      ...normalizeParfumerieInterieur(parfumerieInterieurData.data || []),
      ...normalizePeptilux(peptiluxData.data || [])
    ];

    // Si pas de résultats, renvoyer un message
    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun produit trouvé' });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Erreur de recherche:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
}

// Fonctions pour normaliser les données des différentes tables
function normalizeParfums(data) {
  return data.map(item => ({
    id: item.id,
    type: 'parfum',
    nom_produit: item.nom_produit,
    code_produit: item.code_produit,
    nom_marque: item.nom_marque || '',
    genre: item.genre || '',
    prix_30ml: item.prix_30ml,
    prix_50ml: item.prix_50ml,
    prix_70ml: item.prix_70ml,
    prix_15ml: item.prix_15ml,
    description: item.description || '',
    image_url: item.photo_url || '/images/products/${item.code_produit}.jpg',
    note: item.note,
    category: 'Parfums',
    details: {
      notes_tete: item.notes_tete,
      notes_coeur: item.notes_coeur,
      notes_fond: item.notes_fond
    }
  }));
}

function normalizeAurodhea(data) {
  return data.map(item => ({
    id: item.id,
    type: 'aurodhea',
    nom_produit: item.gamme || 'Produit Aurodhea',
    code_produit: item.code_produit,
    nom_marque: 'Aurodhea',
    genre: item.categorie || '',
    prix_30ml: null,
    prix_50ml: null,
    prix_70ml: null,
    prix: item.prix,
    description: item.description || '',
    image_url: '/images/products/${item.code_produit}.jpg',
    category: item.categorie || 'Aurodhea',
    contenance: item.contenance,
    details: {
      ingredients: item.ingredients,
      benefice: item.benefice
    }
  }));
}

function normalizeBrilhome(data) {
  return data.map(item => ({
    id: item.id,
    type: 'brilhome',
    nom_produit: item.nom_produit || 'Produit Brilhome',
    code_produit: item.code_produit,
    nom_marque: 'Brilhome',
    genre: '',
    prix: item.prix,
    description: item.description || '',
    image_url: '/images/products/${item.code_produit}.jpg',
    category: item.categorie || 'Entretien',
    contenance: item.contenance,
    details: {
      ingredients: item.ingredients,
      presentation: item.presentation
    }
  }));
}

function normalizeParfumerieInterieur(data) {
  return data.map(item => ({
    id: item.id,
    type: 'parfumerie_interieur',
    nom_produit: item.nom_produit || 'Parfum d\'intérieur',
    code_produit: item.code_produit,
    nom_marque: 'Parfumerie d\'intérieur',
    genre: '',
    prix: item.prix,
    description: item.description || '',
    image_url: '/images/products/${item.code_produit}.jpg',
    category: item.categorie || 'Parfumerie d\'intérieur',
    contenance: item.contenance,
    details: {
      notes_tete: item.notes_tete,
      notes_coeur: item.notes_coeur,
      notes_fond: item.notes_fond,
      presentation: item.presentation
    }
  }));
}

function normalizePeptilux(data) {
  return data.map(item => ({
    id: item.id,
    type: 'peptilux',
    nom_produit: item.nom_produit || 'Produit Peptilux',
    code_produit: item.code_produit,
    nom_marque: 'Peptilux',
    genre: '',
    prix: item.prix,
    description: item.description || '',
    image_url: '/images/products/${item.code_produit}.jpg',
    category: item.categorie || 'Soin',
    sous_categorie: item.sous_categorie,
    contenance: item.contenance,
    details: {
      ingredients: item.ingredients,
      benefice: item.benefice,
      presentation: item.presentation
    }
  }));
}