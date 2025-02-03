import sgMail from '@sendgrid/mail';  // Corrected import

// Charger la clé API de SendGrid depuis l'environnement Vercel
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  // Déstructuration des données envoyées
  const { customer_email, customer_name, amount_total, shipping, metadata, cart } = req.body;

  // Vérifier les données
  if (!customer_email || !customer_name || !cart || !amount_total) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  // Email à l'utilisateur
  const userMailOptions = {
    to: customer_email,
    from: 'choganbyikram.contact@gmail.com',  // Utilisez un email validé dans SendGrid
    subject: 'Confirmation de votre commande Chogan',
    text: `Bonjour ${customer_name},\n\nMerci pour votre commande ! Voici les détails :\n\n${cart.map(item => `${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${amount_total}€.\n\nNous allons traiter votre commande et nous reviendrons vers vous pour vous indiquer les modalités de paiement et de livraison.\n\nCordialement,\n\nIkram B.`,
    html: `
      <h1>Confirmation de votre commande</h1>
      <p>Bonjour ${customer_name},</p>
      <p>Merci pour votre commande ! Voici les détails :</p>
      <ul>
        ${cart.map(item => `<li>${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total : ${amount_total}€</strong></p>
      <p>Nous vous confirmons que nous avons enregistré votre commande et que nous allons la traiter.<br>Prochainement, nous allons vous contacter pour vous indiquer les modalités de paiement et de livraison.</p>
      <p>Cordialement,<br>Ikram B.</p>
    `,
  };

  // Email à l'administrateur
  const adminMailOptions = {
    to: 'choganbyikram.contact@gmail.com',  // L'email de l'administrateur
    from: 'hachem.rach@gmail.com',
    subject: `Nouvelle commande de ${customer_name}`,
    text: `Nouvelle commande reçue :\n\nNom: ${customer_name}\nEmail: ${customer_email}\n\nDétails de la commande:\n${cart.map(item => `${item.code} - ${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${amount_total}€.\n\nMerci de traiter cette commande.`,
  };

  try {
    // Envoi des emails
    await sgMail.send(userMailOptions);
    await sgMail.send(adminMailOptions);
    return res.status(200).json({ message: 'Emails envoyés avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email', error);
    return res.status(500).json({ message: 'Erreur d\'envoi de l\'email', error: error.message });
  }
};
