import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01', // Ensure you're using the most recent version of the API
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Verifying the received data
      const { formData, cartItems, amountPromo, totalPrice } = req.body;

      if (!formData || !cartItems || cartItems.length === 0 || !totalPrice) {
        return res.status(400).json({ error: 'Missing or invalid order data.' });
      }

      // Apply the discount to the total price
      let discountedTotal = totalPrice - amountPromo;
      if (discountedTotal < 0) discountedTotal = 0; // Ensure the total doesn't go below 0

      // Create the payment session with Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map(item => {
          if (!item.product.nom_produit || !item.size || !item.product[`prix_${item.size}`]) {
            throw new Error('Missing or invalid product information');
          }

          // Calculate the discounted price for each item
          const originalPrice = item.product[`prix_${item.size}`];
          const discountedPrice = item.discountedPrice || originalPrice - (amountPromo / cartItems.length); // Distribute the discount evenly among items

          return {
            price_data: {
              currency: 'eur', // Currency (e.g., EUR)
              product_data: {
                name: item.product.nom_produit,
                description: item.size,
              },
              unit_amount: Math.round(discountedPrice * 100), // Amount in cents (1 € = 100 cents)
            },
            quantity: item.quantity,
          };
        }),
        mode: 'payment',
        success_url: `https://chogan-by-ikram.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`, // Redirect to success page
        cancel_url: `https://chogan-by-ikram.vercel.app/echec?status=failed`,
        metadata: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          discountAmount: amountPromo || '0', // Add promo discount amount here if applicable
          totalPriceWithDiscount: discountedTotal, // The total after the discount
        },
      });

      // Return the session ID to the frontend
      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating Stripe session:', error);

      // Handle Stripe errors
      if (error.type === 'StripeCardError') {
        res.status(400).json({ error: 'Payment information error' });
      } else if (error.type === 'StripeInvalidRequestError') {
        res.status(400).json({ error: 'Invalid data sent to Stripe' });
      } else if (error.message.includes('Missing product information')) {
        res.status(400).json({ error: 'A product is missing necessary information' });
      } else {
        res.status(500).json({ error: 'Internal server error while creating session' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
