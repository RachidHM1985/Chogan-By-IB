import sendGridMail from '@sendgrid/mail';

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { name, email, phone, message } = req.body;

    // Validation des données reçues
if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Préparer le message pour SendGrid
   const emailContent = {
      to: 'bakmouabdelaziz@outlook.fr',  // L'email auquel vous voulez envoyer le formulaire
      from: email,                   // L'email de l'utilisateur
      subject: `Nouvelle candidature pour devenir consultant - ${name}`,
      text: `
        Vous avez reçu une nouvelle candidature pour devenir consultant.\n\n
        Nom : ${name}\n
        Email : ${email}\n
        Téléphone : ${phone}\n\n
        Message :\n
        ${message}
      `,
    };

    try {
      // Envoi de l'email via SendGrid
      await sendGridMail.send(emailContent);
      return res.status(200).json({ message: 'Votre message a été envoyé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      
      // Afficher les détails de l'erreur de SendGrid pour mieux comprendre
      if (error.response) {
        console.error('Détails de l\'erreur SendGrid:', error.response.body);
      }

      // Retourner un message d'erreur générique à l'utilisateur
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.' });
    }
  } else {
    // Méthode non autorisée
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
