import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { formData, lineItems, deliveryFee, amountPromo, totalPrice } = req.body;

      console.log('Received data:', { formData, lineItems, deliveryFee, amountPromo, totalPrice });

      // Check for missing data
      if (!formData || !lineItems || lineItems.length === 0 || totalPrice == null) {
        return res.status(400).json({ error: 'Missing or invalid order data.' });
      }

      // Apply the discount to the total price
      let discountedTotal = totalPrice + deliveryFee - amountPromo;
      if (discountedTotal < 0) discountedTotal = 0;

      // Log the lineItems before processing
      console.log('Line items before processing:', lineItems);

      // Map over lineItems to ensure all necessary data is present
      const stripeLineItems = lineItems.map(item => {
        const productData = item.price_data?.product_data; // Safe access

        console.log('Product data for item:', productData);

        // Check for missing or invalid product information
        if (!productData || !productData.name || !item.size || !productData.unit_amount) {
          console.log('Missing or invalid product data:', item);
          throw new Error('Missing or invalid product information');
        }

        // Use unit_amount as the price for the item (it already includes the price for the size)
        const originalPrice = item.price_data.unit_amount / 100; // Convert cents to euros

        // Calculate the discounted price
        const discountedPrice = item.discountedPrice || (originalPrice - (amountPromo / lineItems.length));

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productData.name,
              code: productData.code || 'N/A',
              size: item.size,
            },
            unit_amount: Math.round(discountedPrice * 100), // Amount in cents
          },
          quantity: item.quantity,
        };
      });

      // Add delivery fee as a separate line item if applicable
      const finalLineItems = [
        ...stripeLineItems,
        ...(deliveryFee && discountedTotal < 80 ? [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Delivery Fee',
              description: 'Frais de livraison',
            },
            unit_amount: Math.round(deliveryFee * 100),
          },
          quantity: 1,
        }] : []),
      ];

      // Create the payment session with Stripe
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
          discountAmount: amountPromo || '0',
          totalPriceWithDiscount: discountedTotal + deliveryFee,
        },
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating Stripe session:', error);

      if (error.message.includes('Missing product information')) {
        res.status(400).json({ error: 'A product is missing necessary information' });
      } else {
        res.status(500).json({ error: 'Internal server error while creating session' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
