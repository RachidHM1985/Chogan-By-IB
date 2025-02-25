import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { formData, lineItems, deliveryFee, amountPromo, totalPrice } = req.body;

      console.log('Données reçues:', { formData, lineItems, deliveryFee, amountPromo, totalPrice });

      const promoAmount = amountPromo ? parseFloat(amountPromo) : 0;
      const fraisLivraison = totalPrice > 80 ? 0 : deliveryFee;

      if (!formData || !lineItems || lineItems.length === 0 || totalPrice == null) {
        return res.status(400).json({ error: 'Données de commande manquantes ou invalides.' });
      }

      let discountedTotal = totalPrice - promoAmount;
      if (discountedTotal < 0) discountedTotal = 0;

      const stripeLineItems = lineItems.map(item => {
        const productData = item.price_data?.product_data;

        if (!productData || !productData.name || !item.price_data.unit_amount) {
          console.error('Informations produit manquantes ou invalides:', item);
          throw new Error('Informations produit manquantes ou invalides');
        }

        const originalPrice = item.price_data.unit_amount / 100;

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productData.name,
              description: `Taille: ${productData.size}`, // Ajout de la taille dans la description
            },
            unit_amount: Math.round(originalPrice * 100),
          },
          quantity: item.quantity,
        };
      });

      const finalLineItems = [
        ...stripeLineItems,
        ...(deliveryFee && discountedTotal < 80 ? [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Frais de livraison',
              description: 'Frais de livraison',
            },
            unit_amount: Math.round(deliveryFee * 100),
          },
          quantity: 1,
        }] : []),
      ];
      
      const prixTotal = discountedTotal;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: finalLineItems,
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`,
        cancel_url: `${process.env.BASE_URL}/echec?status=failed`,
        metadata: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          deliveryFee: fraisLivraison,
          discountAmount: promoAmount,
          totalPriceWithDiscount: prixTotal.toFixed(2),
          // Ajout des informations sur les produits dans les métadonnées
          products: JSON.stringify(lineItems.map(item => ({
            name: item.price_data?.product_data?.name,
            code: item.price_data?.product_data?.code,
            size: item.price_data?.product_data.size || "Non spécifié", // Ajout de la taille
          }))),
        },
      });

      res.status(200).json({ sessionId: session.id, status: "succeeded" });
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);

      if (error.message.includes('Informations produit manquantes')) {
        res.status(400).json({ error: 'Un produit manque des informations nécessaires' });
      } else if (error.type === 'StripeInvalidRequestError') {
        res.status(400).json({ error: 'Données invalides envoyées à Stripe' });
      } else {
        res.status(500).json({ error: 'Erreur interne lors de la création de la session' });
      }
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
