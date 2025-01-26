import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button } from '@mui/material';
import Header from '../components/Header.js';
import Footer from '../components/Footer';

const Echec = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifie le statut de l'URL après redirection Stripe
    const { status } = router.query;

    if (status === 'failed') {
      setLoading(false); // Si le paiement a échoué, arrête le chargement.
    }
  }, [router.query]);

  return (
    <>
    <Header />
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      {loading ? (
        <Typography variant="h6" align="center">
          Vérification du paiement...
        </Typography>
      ) : (
        <div className="text-center">
          <Typography variant="h4" align="center" color="error">
            Paiement échoué
          </Typography>
          <Typography variant="h6" align="center">
            Désolé, quelque chose s'est mal passé avec votre paiement. Veuillez réessayer.
          </Typography>
          <div className="mt-4">
            <Button variant="contained" color="secondary" onClick={() => router.push('/')}>
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

export default Echec;
