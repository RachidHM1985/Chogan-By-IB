// server.js

const express = require('express');
const bodyParser = require('body-parser');
const sendgrid = require('@sendgrid/mail');
const cors = require('cors');

const app = express();

// Configuration de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route pour envoyer le formulaire
app.post('/send-email', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Tous les champs doivent être remplis' });
  }

  const msg = {
    to: 'ikram.bakmou@outlook.fr', // L'email auquel vous voulez envoyer le formulaire
    from: 'hachem.rach@gmail.com', // L'email de l'expéditeur (peut être un email vérifié SendGrid)
    subject: `Nouveau message de ${name} pour renseignements Consultant`,
    text: `
      Nom: ${name}
      Email: ${email}
      Téléphone: ${phone}
      Message: ${message}
    `,
    html: `
      <strong>Nom:</strong> ${name}<br>
      <strong>Email:</strong> ${email}<br>
      <strong>Téléphone:</strong> ${phone}<br>
      <strong>Message:</strong><br><p>${message}</p>
    `,
  };

  sendgrid
    .send(msg)
    .then(() => {
      res.status(200).json({ message: 'Email envoyé avec succès!' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'envoi de l\'email.' });
    });
});

// Lancer le serveur
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
