import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { formData, lineItems, deliveryFee, amountPromo, totalPrice } = req.body;

      console.log('Données reçues:', { formData, lineItems, deliveryFee, amountPromo, totalPrice });

      // Sanitize amountPromo: si vide, on le définit sur 0
      const promoAmount = amountPromo ? parseFloat(amountPromo) : 0;

      // Vérifier s'il manque des données
      if (!formData || !lineItems || lineItems.length === 0 || totalPrice == null) {
        return res.status(400).json({ error: 'Données de commande manquantes ou invalides.' });
      }

      // Appliquer la remise au prix total
      let discountedTotal = totalPrice - promoAmount;
      if (discountedTotal < 0) discountedTotal = 0;

      // Mapper les éléments de ligne pour vérifier que toutes les données nécessaires sont présentes
      const stripeLineItems = lineItems.map(item => {
        const productData = item.price_data?.product_data; // Accès sécurisé

        // Vérifier si les informations du produit sont manquantes ou invalides
        if (!productData || !productData.name || !item.price_data.unit_amount) {
          console.error('Informations produit manquantes ou invalides:', item);
          throw new Error('Informations produit manquantes ou invalides');
        }

        // Utiliser unit_amount comme prix de l'article (il inclut déjà le prix pour la taille)
        const originalPrice = item.price_data.unit_amount / 100; // Convertir les centimes en euros

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productData.name,              
            },
            unit_amount: originalPrice * 100, // Montant en centimes
          },
          quantity: item.quantity,
        };
      });

      // Ajouter des frais de livraison comme élément séparé si nécessaire
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
      
 
      const prixTotal = discountedTotal + deliveryFee
      // Créer la session de paiement avec Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: finalLineItems,
        mode: 'payment',
        success_url: `https://chogan-by-ikram.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`,
        cancel_url: `https://chogan-by-ikram.vercel.app/echec?status=failed`,
        metadata: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          deliveryFee: deliveryFee,
          discountAmount: promoAmount,
          totalPriceWithDiscount: prixTotal.toFixed(2),
          // Ajout des informations sur les produits dans les métadonnées
          products: JSON.stringify(lineItems.map(item => ({
            name: item.price_data?.product_data?.name,
            code: item.price_data?.product_data?.code,
            size: item.price_data?.product_data?.size,
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
