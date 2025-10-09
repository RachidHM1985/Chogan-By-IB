// src/lib/emailTemplates/generateEmailHTML.js

export async function generateEmailHTML (prospect){
    const { firstName, lastName, email } = prospect;

    const name = [firstName, lastName].filter(Boolean).join(" ");
    // 🔗 Lien de désinscription avec email encodé
  const unsubscribeLink = `https://chogan-by-ikram.vercel.app/api/unsubscribe?email=${encodeURIComponent(email)}`;

  
    // Variables de personnalisation
    const personalizedGreeting = `Bonjour ${name || 'Cher amateur de belles senteurs'},`;
  
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre abonnement - By Ikram</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            padding: 30px 20px;
            background-color: #ffffff;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .title {
            font-size: 24px;
            color: #000000;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .text {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
            margin-bottom: 25px;
        }
        .product-grid {
            display: table;
            width: 100%;
            margin: 30px 0;
        }
        .product-row {
            display: table-row;
        }
        .product-cell {
            display: table-cell;
            width: 33.33%;
            padding: 10px;
            vertical-align: top;
        }
        .product-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        .button-container {
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #000000;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin: 10px;
        }
        .button-secondary {
            background-color: #ffffff;
            color: #000000;
            border: 2px solid #000000;
        }
        .benefits {
            background-color: #f9f9f9;
            padding: 25px;
            margin: 30px 0;
            border-radius: 8px;
            text-align: left;
        }
        .benefits-title {
            font-size: 18px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 15px;
            text-align: center;
        }
        .benefit-item {
            font-size: 14px;
            color: #555555;
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .benefit-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #000000;
            font-weight: bold;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px 20px;
            text-align: center;
            font-size: 12px;
            color: #999999;
        }
        .unsubscribe {
            color: #000000;
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .product-cell {
                display: block;
                width: 100%;
                padding: 15px 0;
            }
            .button {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <a href="https://chogan-by-ikram.vercel.app/">
                <img src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/by_ikram_logo.png" alt="By Ikram Logo" class="logo">
            </a>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="title">Souhaitez-vous continuer à recevoir nos offres exclusives ?</h1>
            
            <p class="text">
                Bonjour,<br><br>
                Nous sommes ravis de votre intérêt pour nos parfums de luxe à prix abordables. 
                Pour continuer à vous envoyer nos meilleures offres et nouveautés, nous avons besoin de votre confirmation.
            </p>

            <!-- Product Images -->
            <div class="product-grid">
                <div class="product-row">
                    <div class="product-cell">
                        <img src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/homme.png" alt="Parfum Homme" class="product-image">
                    </div>
                    <div class="product-cell">
                        <img src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/femme.png" alt="Parfum Femme" class="product-image">
                    </div>
                    <div class="product-cell">
                        <img src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/brume.jpg" alt="Brume Cheveux" class="product-image">
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="benefits">
                <div class="benefits-title">En restant abonné(e), vous bénéficierez de :</div>
                <div class="benefit-item">Offres exclusives et promotions réservées à nos abonnés</div>
                <div class="benefit-item">Découverte en avant-première de nos nouvelles fragrances</div>
                <div class="benefit-item">Conseils personnalisés pour trouver votre parfum idéal</div>
                <div class="benefit-item">Réductions spéciales sur votre première commande</div>
            </div>

            <p class="text" style="font-weight: bold; color: #000000;">
                Confirmez-vous votre accord pour recevoir nos communications commerciales ?
            </p>

            <!-- Buttons -->
            <div class="button-container">
                <a href="https://chogan-by-ikram.vercel.app/confirm-subscription" class="button">
                    Oui, je confirme mon abonnement
                </a>
                <br>
                <a href="https://chogan-by-ikram.vercel.app/unsubscribe" class="button button-secondary">
                    Non, me désinscrire
                </a>
            </div>

            <p class="text" style="font-size: 14px; color: #888888;">
                Conformément au RGPD, vos données sont protégées et utilisées uniquement pour vous envoyer nos offres. 
                Vous pouvez vous désinscrire à tout moment.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                © 2025 Chogan By Ikram. Tous droits réservés.<br>
                Vous recevez cet email pour confirmer votre consentement.<br>
                <a href="https://chogan-by-ikram.vercel.app/unsubscribe" class="unsubscribe">Me désinscrire définitivement</a>
            </p>
        </div>
    </div>
</body>
</html>
`;
  
    return htmlContent;
}