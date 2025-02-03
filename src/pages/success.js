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
    const { session_id, payment_intent, status } = router.query;

    // Attente que les données soient disponibles avant de continuer
    if (!payment_intent || !status) {
      return; // Ne rien faire si les données sont incomplètes
    }

    console.log("status : ", status);
    console.log("payment_intent : ", payment_intent);
    console.log("session_id : ", session_id);

    if (status === 'succeeded') {
      setLoading(false); // Si le paiement est réussi, arrête le chargement
    } else {
      setError('Le paiement a échoué.'); // Met un message d'erreur si le paiement échoue
      router.push('/echec?status=failed'); // Redirige vers la page d'échec
    }
  }, [router.query]);

  return (
    <>
      <Header />
      <div>
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
    </>
  );
};

export default Success;
