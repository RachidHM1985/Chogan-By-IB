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
      return; // Si les données sont incomplètes, ne fais rien
    }
  
    const handlePaymentSuccess = async () => {
      try {
        const response = await fetch(`/api/getSessionDetails?session_id=${session_id}`);
        const data = await response.json();
  
        if (response.status !== 200) {
          setError('Erreur lors de la récupération des détails de la session.');
          setLoading(false);
          return;
        }
  
        const { customer_email, customer_name, amount_total, shipping, metadata, cart } = data;
  
        const orderData = {
          user_name: customer_name,
          user_email: customer_email,
          user_phone: shipping.phone,
          user_address: shipping.address.line1,
          total_amount: amount_total / 100, // Montant en cents
          delivery_fee: metadata?.deliveryFee || 0,
          order_status: 'completed',
          cart,  // Inclure le panier pour l'email
        };
  
        const apiResponse = await fetch('/api/saveOrderAndSendMail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
  
        if (apiResponse.status === 200) {
          console.log('Commande enregistrée et mail envoyé');
          setLoading(false);
        } else {
          setError('Une erreur est survenue lors de l\'enregistrement de la commande et de l\'envoi du mail.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du paiement:', error);
        setError('Erreur lors du traitement du paiement.');
        setLoading(false);
      }
    };
  
    if (status === 'succeeded') {
      handlePaymentSuccess();
    } else {
      setError('Le paiement a échoué.');
      router.push('/echec?status=failed');
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
