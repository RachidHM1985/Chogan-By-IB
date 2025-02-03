import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button } from '@mui/material';
import Header from '../components/Header.js';
import Footer from '../components/Footer';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // State pour gérer les erreurs
  const router = useRouter();

  useEffect(() => {
    const { session_id, status } = router.query; // Note que payment_intent peut ne pas être dans l'URL
    
    // Vérifie si les données nécessaires sont présentes
    if (!session_id || !status) {
      return; // Si les données sont incomplètes, ne fais rien
    }
  
    console.log("status : ", status);
    console.log("session_id : ", session_id);
  
    // Vérifie l'état du paiement
    if (status === 'succeeded') {
      setLoading(false); // Si le paiement est réussi, arrête le chargement
    } else {
      setError('Le paiement a échoué.');
      router.push('/echec?status=failed'); // Redirige vers la page d'échec
    }
  }, [router.query]);

  return (
    <>
      <Header />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Garantir que le contenu prend tout l'espace vertical
      }}>
        <div style={{
          flex: 1, // Faire en sorte que le contenu principal prenne toute la hauteur disponible
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '20px',
        }}>
          {loading ? (
            <Typography variant="h6" align="center">
              Vérification du paiement...
            </Typography>
          ) : (
            <div>
              {error ? (  // Si une erreur est présente, affiche un message d'erreur
                <Typography variant="h6" align="center" color="error">
                  {error}
                </Typography>
              ) : (
                <div>
                  <Typography variant="h4" align="center" color="green">
                    Paiement réussi !
                  </Typography>
                  <Typography variant="h6" align="center">
                    Merci pour votre commande, votre paiement a été effectué avec succès. Vous allez recevoir un mail de confirmation.
                  </Typography>
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button variant="contained" color="primary" onClick={() => router.push('/')}>
                  Retour à la page d'accueil
                </Button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Success;
