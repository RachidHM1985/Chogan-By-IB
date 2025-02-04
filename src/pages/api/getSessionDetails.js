import Stripe from 'stripe';

// Initialize Stripe with the secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', // Ensure you are using the correct version
});

export default async function handler(req, res) {
  const { session_id } = req.query;

  // Check if session_id is provided
  if (!session_id) {
    return res.status(400).json({ message: 'session_id manquant' });
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'], // Expanding relevant fields like line items
    });
console.log('session: ', session)
    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    // Format the cart items from the session's line_items
    const cartItems = session.line_items?.data.map(item => ({
      nom_produit: item.price_data.products.name,  // Product name/description
      prix: item.amount_total / 100,  // Total amount in euros (converted from cents)
      quantity: item.quantity,       // Quantity of the product
    })) || [];

    console.log("Cart items formatés :", cartItems);  // Affiche les articles du panier

    // Création d'un objet de session avec les données nécessaires
    const sessionData = {
      cart: cartItems.map(item => {
        return session.metadata.products.map(product => {
          return {
            nom_produit: item.nom_produit,  // Nom du produit
            prix: item.prix / 100,           // Prix total (en euros, conversion des centimes)
            quantity: item.quantity,         // Quantité du produit
            code: product.code || '',        // Code du produit (si présent dans le produit)
            size: product.size || '',        // Taille du produit (si présent dans le produit)
          };
        });
      }),
      
        totalPriceWithDiscount: session.metadata.totalPriceWithDiscount || 0, // Prix total avec remise, si disponible
        deliveryFee: session.metadata.deliveryFee || 0, // Frais de livraison depuis les metadata
        customerEmail: session.customer_details.email || '',  // Email du client
        customerName: session.customer_details.name || '',    // Nom du client
        address: session.metadata.address || '',  // Adresse du client depuis les metadata
        phone: session.metadata.phone || '',      // Téléphone du client depuis les metadata
      };
      
        console.log('sessionData :',sessionData)
    // Return the session data in the response
    return res.status(200).json(sessionData);

  } catch (error) {
    console.error('Erreur lors de la récupération de la session Stripe:', error);

    // Handle various types of errors gracefully
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ message: 'Données invalides envoyées à Stripe', error: error.message });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({ message: 'Erreur de l\'API Stripe', error: error.message });
    } else {
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la session', error: error.message });
    }
  }
}
