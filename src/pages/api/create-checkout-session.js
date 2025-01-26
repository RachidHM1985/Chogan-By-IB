// pages/api/create-checkout-session.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', // Assurez-vous d'utiliser la dernière version de l'API
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Récupérer les informations de la commande envoyées par le frontend
      const { formData, cartItems, totalPrice } = req.body;

      // Créez une session de paiement avec Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'eur', // Devise (ex: EUR)
            product_data: {
              name: item.product.nom_produit,
              description: item.size,
            },
            unit_amount: item.product[`prix_${item.size}`] * 100, // Montant en centimes (1 € = 100 centimes)
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
       success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`, // Rediriger vers success.js
      cancel_url: `http://localhost:3000/echec?status=failed`,
        metadata: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
        },
      });

      // Renvoie l'ID de la session Stripe au frontend
      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      res.status(500).json({ error: 'Erreur de serveur lors de la création de la session' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
