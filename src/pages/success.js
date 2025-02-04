import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, CircularProgress } from '@mui/material';
import Header from '../components/Header.js';
import Footer from '../components/Footer';

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // State to handle errors
  const router = useRouter();

  useEffect(() => {
    const { session_id, status } = router.query;

    // Ensure session_id and status are available
    if (!session_id || !status) {
      setError('Invalid session details.');
      setLoading(false);
      return;
    }

    // Fetch the Stripe session details
    fetch(`/api/getSessionDetails?session_id=${session_id}`)
      .then(response => response.json())
      .then(async (data) => {
        if (status === 'succeeded') {
          // Prepare the order data to be saved
          const { amount_total, metadata, cart } = data;

          const orderData = {
            email: metadata.email,
            name: metadata.name,
            deliveryFee: metadata.deliveryFee,
            amountPromo: metadata.amountPromo,
            total_amount: amount_total,
            user_phone: metadata.phone,
            user_address: metadata.address,
            cart,
          };

          // Send the order details to save and send email confirmation
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
              setError(result.message || 'Une erreur est survenue lors du traitement de votre commande.');
            }
          } catch (err) {
            console.error('Error while sending order data:', err);
            setError('Erreur lors de l\'envoi des données. Veuillez réessayer.');
          }
        } else {
          setError('Le paiement a échoué.');
          router.push('/echec?status=failed'); // Redirect to the failure page
        }
      })
      .catch((err) => {
        console.error('Error while fetching session details:', err);
        setError('Erreur lors de la récupération des détails de la session de paiement.');
      });
  }, [router.query]);

  return (
    <>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '20px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
                Vérification du paiement...
              </Typography>
            </div>
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