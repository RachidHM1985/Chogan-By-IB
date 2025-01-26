import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SearchBar from '../components/SearchBar'; // Barre de recherche si nécessaire
import SearchResults from '../components/SearchResults'; // Résultats de la recherche

const SearchPage = () => {
  const router = useRouter();
  const { query } = router.query; // Récupère la query depuis l'URL
  const [results, setResults] = useState([]); // Stocker les résultats de la recherche
  const [loading, setLoading] = useState(false); // Pour afficher un message de chargement
  const [error, setError] = useState(null); // Gérer les erreurs

  useEffect(() => {
    // Vérifier si query existe et est non vide
    if (query && query.trim().length > 0) {
      const fetchResults = async () => {
        setLoading(true); // Commence le chargement des données
        setError(null); // Réinitialise l'erreur

        try {
          const response = await fetch(`/api/search?query=${query}`);
          if (!response.ok) {
            throw new Error('Erreur lors de la recherche');
          }
          const data = await response.json();
          setResults(data); // Met à jour les résultats de la recherche
        } catch (error) {
          setError(error.message); // Gérer l'erreur si la requête échoue
        } finally {
          setLoading(false); // Fin du chargement
        }
      };

      fetchResults(); // Lance la fonction pour récupérer les résultats
    }
  }, [query]); // Ne s'exécute que lorsque `query` change

  return (
    <div>
      <SearchBar /> {/* Barre de recherche */}
      {loading && <p>Chargement des résultats...</p>} {/* Afficher pendant le chargement */}
      {error && <p style={{ color: 'red' }}>Erreur: {error}</p>} {/* Afficher l'erreur si elle survient */}
      {results.length > 0 ? (
        <SearchResults results={results} /> // Passer les résultats à SearchResults
      ) : (
        <p>Aucun résultat trouvé pour "{query}".</p> // Si pas de résultats
      )}
    </div>
  );
};

export default SearchPage;
