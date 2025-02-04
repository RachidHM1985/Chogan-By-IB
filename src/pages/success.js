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
    const { session_id, status } = router.query;

    if (!session_id || !status) {
      return;
    }

    // Récupération des détails de la session Stripe
    fetch(`/api/getSessionDetails?session_id=${session_id}`)
      .then(response => response.json())
      .then(async (data) => {
        if (data.status === 'succeeded') {
          // Préparer les données de la commande
          const { customer_email, customer_name, amount_total, metadata, cart } = data;

          const orderData = {
            customer_email,
            customer_name,
            total_amount: amount_total,
            user_phone: metadata.phone,
            user_address: metadata.address,
            cart,
          };

          // Envoi des détails vers l'API pour enregistrer la commande et envoyer les emails
          try {
            const response = await fetch('/api/saveOrderAndSendMail', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            });

            const result = await response.json();
            if (response.ok) {
              setLoading(false);
            } else {
              setError(result.message || 'Une erreur est survenue');
            }
          } catch (err) {
            console.error('Erreur lors de l\'envoi des données:', err);
            setError('Erreur lors de l\'envoi des données');
          }
        } else {
          setError('Le paiement a échoué.');
          router.push('/echec?status=failed'); // Redirige vers la page d'échec
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des détails de la session:', err);
        setError('Erreur lors de la récupération des détails de la session.');
      });
  }, [router.query]);

  return (
    <>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '20px' }}>
          {loading ? (
            <Typography variant="h6" align="center">Vérification du paiement...</Typography>
          ) : (
            <div>
              {error ? (
                <Typography variant="h6" align="center" color="error">{error}</Typography>
              ) : (
                <div>
                  <Typography variant="h4" align="center" color="green">Paiement réussi !</Typography>
                  <Typography variant="h6" align="center">Merci pour votre commande, votre paiement a été effectué avec succès. Vous allez recevoir un mail de confirmation.</Typography>
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
