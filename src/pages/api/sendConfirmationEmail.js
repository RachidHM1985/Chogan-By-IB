import sgMail from '@sendgrid/mail';
// Charger la clé API de SendGrid depuis l'environnement Vercel
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (req, res) => {
  const { email, name, prenom, cart, total } = req.body;

  // Vérifier les données
  if (!email || !name || !prenom || !cart || !total) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  // Email à l'utilisateur
  const userMailOptions = {
    to: email,
    from: 'ikram.bakmou@outlook.fr',  // Utilisez un email validé dans SendGrid
    subject: 'Confirmation de votre commande Chogan',
    text: `Bonjour ${prenom} ${name},\n\nMerci pour votre commande ! Voici les détails :\n\n${cart.map(item => `${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${total}€.\n\nNous allons traiter votre commande et nous reviendrons vers vous pour vous indiquer les modalités de paiement et de livraison.\n\nCordialement,\n\nIkram B.`,
    html: `
      <h1>Confirmation de votre commande</h1>
      <p>Bonjour ${prenom} ${name},</p>
      <p>Merci pour votre commande ! Voici les détails :</p>
      <ul>
        ${cart.map(item => `<li>${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}</li>`).join('')}
      </ul>
      <p><strong>Total : ${total}€</strong></p>
      <p>Nous vous confirmons que nous avons enregistré votre commande et que nous allons la traiter.<br>Prochainement, nous allons vous contacter pour vous indiquer les modalités de paiement et de livraison.</p>
      <p>Cordialement,<br>Ikram B.</p>
    `,
  };

  // Email à l'administrateur
  const adminMailOptions = {
    to: 'ikram.bakmou@outlook.fr',  // L'email de l'administrateur
    from: 'hachem.rach@gmail.com',
    subject: `Nouvelle commande de ${prenom} ${name}`,
    text: `Nouvelle commande reçue :\n\nNom: ${prenom} ${name}\nTéléphone: ${req.body.phone}\nEmail: ${email}\n\nDétails de la commande:\n${cart.map(item => `${item.code} - ${item.nom_produit} - ${item.size} - ${item.prix}€ x ${item.quantity}`).join('\n')}\n\nTotal : ${total}€.\n\nMerci de traiter cette commande.`,
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

export default sendEmail;
