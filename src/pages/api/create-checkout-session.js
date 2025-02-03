import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', // Assurez-vous d'utiliser la version la plus récente de l'API
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Vérification des données reçues
      const { formData, cartItems, amountPromo, totalPrice } = req.body;

      if (!formData || !cartItems || cartItems.length === 0 || !totalPrice) {
        return res.status(400).json({ error: 'Données de commande manquantes ou invalides.' });
      }

      // Créez une session de paiement avec Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map(item => {
          if (!item.product.nom_produit || !item.size || !item.product[`prix_${item.size}`]) {
            throw new Error('Informations produit manquantes ou invalides');
          }

          return {
            price_data: {
              currency: 'eur', // Devise (ex: EUR)
              product_data: {
                name: item.product.nom_produit,
                description: item.size,
              },
              unit_amount: item.product[`prix_${item.size}`] * 100, // Montant en centimes (1 € = 100 centimes)
            },
            quantity: item.quantity,
          };
        }),
        mode: 'payment',
        success_url: `https://chogan-by-ikram.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`, // Rediriger vers success.js
        cancel_url: `https://chogan-by-ikram.vercel.app/echec?status=failed`,
        metadata: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          discountAmount: amountPromo || '0', // Ajoutez le montant du code promo ici, si applicable
        },
      });

      // Renvoie l'ID de la session Stripe au frontend
      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);

      // Gérer les erreurs liées à Stripe
      if (error.type === 'StripeCardError') {
        res.status(400).json({ error: 'Erreur avec les informations de paiement' });
      } else if (error.type === 'StripeInvalidRequestError') {
        res.status(400).json({ error: 'Données invalides envoyées à Stripe' });
      } else if (error.message.includes('Informations produit manquantes')) {
        res.status(400).json({ error: 'Un produit manque des informations nécessaires' });
      } else {
        res.status(500).json({ error: 'Erreur interne du serveur lors de la création de la session' });
      }
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
