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

    // Check if session exists
    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    console.log("Session récupérée :", session);  // Ajout d'une ligne de log pour déboguer

    // Format the cart items from the session's line_items
    const cartItems = session.line_items?.data.map(item => ({
      nom_produit: item.description || item.price_data.product_data.name,  // Product name/description
      prix: item.amount_total / 100,  // Total amount in euros (converted from cents)
      quantity: item.quantity,       // Quantity of the product
    })) || [];

    console.log("Cart items formatés :", cartItems);  // Affiche les articles du panier

    // Création d'un objet de session avec les données nécessaires
    const sessionData = {
      cart: cartItems,                           // Cart items formatted
      totalPriceWithDiscount: session.metadata.totalPriceWithDiscount || 0, // Total price (with discount, if available)
      deliveryFee: session.metadata.deliveryFee || 0, // Delivery fee from metadata
      customerEmail: session.customer_details.email || '',  // Customer email from customer_details
      customerName: session.customer_details.name || '',    // Customer name from customer_details
      address: session.metadata.address || '',  // Address from metadata
      phone: session.metadata.phone || '',      // Customer phone from metadata
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
