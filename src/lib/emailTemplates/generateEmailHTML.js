// src/lib/emailTemplates/generateEmailHTML.js

export async function generateEmailHTML (prospect){
    const { firstName, lastName, email } = prospect;
  
    // Exemple simple de contenu — à adapter en fonction du templateId si nécessaire
    const htmlContent = `
     <!DOCTYPE html>
<html lang="fr" dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Chogan By Ikram - Découvrez nos produits</title>
  <!--[if (mso 16)]>
  <style type="text/css">
    a {text-decoration: none;}
  </style>
  <![endif]-->
  <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
  <!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <!--<![endif]-->
  <style type="text/css">
    /* Base styles */
    body {
      font-family: 'Montserrat', Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #f7f7f7;
      color: #333333;
    }
    
    table {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    
    img {
      -ms-interpolation-mode: bicubic;
      display: block;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    
    p, h1, h2, h3 {
      margin: 0;
      padding: 0;
    }
    
    /* Layout */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 3px 10px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    /* Header */
    .header {
      background-color: #ffffff;
      padding: 25px 0;
      text-align: center;
    }
    
    /* Navigation */
    .nav-container {
      background-color: #fff5f5;
      padding: 0;
      border-radius: 8px;
    }
    
    .nav-item {
      padding: 12px 5px;
      text-align: center;
      font-weight: 600;
      font-size: 13px;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }
    
    .nav-item a {
      color: #444444;
      text-decoration: none;
    }
    
    .nav-item:hover {
      border-bottom-color: #ff809c;
    }
    
    .nav-item:hover a {
      color: #ff809c;
    }
    
    /* Content */
    .content-section {
      padding: 20px;
      background-color: #ffffff;
    }
    
    .hero-title {
      color: #ff809c;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .content-image {
      width: 100%;
      max-width: 560px;
      height: auto;
      border-radius: 8px;
      margin: 15px 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .info-box {
      background-color: #ecded5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .info-title {
      color: #333333;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
      text-align: center;
    }
    
    .info-text {
      color: #555555;
      font-size: 16px;
      line-height: 1.6;
    }
    
    /* Footer */
    .footer {
      padding: 20px;
      background-color: #fff5f5;
      text-align: center;
      border-top: 1px solid #ffdad7;
    }
    
    .footer-title {
      color: #ffb406;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 15px;
    }
    
    .social-banner {
      background-color: #ffdad7;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      font-weight: 600;
    }
    
    .social-container {
      margin: 20px 0;
    }
    
    .social-button {
      display: inline-block;
      padding: 10px 25px;
      margin: 10px 0;
      border: 2px solid #ff809c;
      color: #ff809c;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .social-button:hover {
      background-color: #ff809c;
      color: #ffffff;
    }
    
    .social-icons {
      margin: 20px 0;
    }
    
    .social-icon {
      display: inline-block;
      margin: 0 5px;
    }
    
    .footer-info {
      font-size: 12px;
      color: #666666;
      line-height: 1.5;
      margin: 15px 0;
    }
    
    .unsubscribe {
      font-size: 12px;
      color: #888888;
      text-decoration: underline;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0;
      }
      
      .nav-container {
        margin: 0 10px 15px;
      }
      
      .nav-item {
        padding: 10px 2px;
        font-size: 11px;
      }
      
      .content-section {
        padding: 15px;
      }
      
      .hero-title {
        font-size: 20px;
      }
      
      .info-title {
        font-size: 18px;
      }
      
      .info-text {
        font-size: 14px;
      }
      
      .footer-title {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div style="background-color: #f7f7f7; padding: 20px 0;">
    <!-- Main Container -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" valign="top">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <!-- Header -->
            <tr>
              <td class="header">
                <a href="https://chogan-by-ikram.vercel.app/" target="_blank" style="text-decoration:none;">
                  <img src="https://fujclez.stripocdn.email/content/guids/CABINET_2c24e97afd23d91f7dec388776c2c7964532e878da1223d8a41a5bf7df4c04fa/images/by_ikram_logo.png" alt="Chogan By Ikram" width="160" style="display:block; margin:0 auto;">
                </a>
              </td>
            </tr>
            
            <!-- Navigation -->
            <tr>
			  <td align="center" style="padding: 0 20px;">
				<table class="nav-container" width="100%" cellspacing="0" cellpadding="0" border="0">
				  <tr>
					<td width="20%" class="nav-item">
					  <a href="https://chogan-by-ikram.vercel.app/perfumes" target="_blank">Parfums d’Exception</a>
					</td>
					<td width="20%" class="nav-item">
					  <a href="https://chogan-by-ikram.vercel.app/brilhome" target="_blank">Beauté & Soins Quotidiens</a>
					</td>
					<td width="20%" class="nav-item">
					  <a href="https://chogan-by-ikram.vercel.app/peptilux" target="_blank">Cosmétiques Haut de Gamme</a>
					</td>
					<td width="20%" class="nav-item">
					  <a href="https://chogan-by-ikram.vercel.app/brilhome" target="_blank">Maison Propre & Éclatante</a>
					</td>
					<td width="20%" class="nav-item">
					  <a href="https://chogan-by-ikram.vercel.app/parfumerieInterieur" target="_blank">Ambiances Parfumées</a>
					</td>
				  </tr>
				</table>
			  </td>
			</tr>

            
            <!-- Content Section -->
            <tr>
              <td class="content-section">
                <h1 class="hero-title"><strong>Bienvenue chez Chogan By Ikram!</strong></h1>
                
                <!-- First Image -->
				<a href="https://chogan-by-ikram.vercel.app/" target="_blank">
				  <img src="https://fujclez.stripocdn.email/content/guids/CABINET_a4942cb7174952c31a70ca72e80355d6e2d2e4df757c4d74f502b4b8f33a9d97/images/story_instagram_recrutement_entreprise_moderne_minimal_blanc_noir_rose_550_x_550_px112.png" 
					   alt="Produits Chogan" 
					   class="content-image" 
					   width="560" 
					   style="display: block; border: none; outline: none; text-decoration: none;">
				</a>
                
                <!-- Second Image -->
				<a href="https://chogan-by-ikram.vercel.app/" target="_blank">
					<img href="https://chogan-by-ikram.vercel.app/perfumes" src="https://fujclez.stripocdn.email/content/guids/CABINET_a4942cb7174952c31a70ca72e80355d6e2d2e4df757c4d74f502b4b8f33a9d97/images/image_qIK.png"
					 alt="Produits Chogan" 
					   class="content-image" 
					   width="560" 
					   style="display: block; border: none; outline: none; text-decoration: none;">
				</a>
                <!-- Information Box -->
                <div class="info-box">
                  <h3 class="info-title">Pourquoi nos prix sont bas ?</h3>
                  <p class="info-text">
                    Chez Chogan, nous avons optimisé chaque étape de notre chaîne de production et de distribution. 
                    En supprimant les intermédiaires et en privilégiant la vente directe, nous pouvons vous offrir 
                    des produits de qualité à des prix imbattables.
                  </p>
                </div>
                
                <!-- Third Image -->
                <img src="https://fujclez.stripocdn.email/content/guids/CABINET_a4942cb7174952c31a70ca72e80355d6e2d2e4df757c4d74f502b4b8f33a9d97/images/image_Sgd.jpeg" alt="Produits Chogan" class="content-image" width="560">
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td class="footer">
                <h2 class="footer-title">SUIVEZ NOUS!</h2>
                
                <div class="social-banner">
                  On est présents partout, mais pour ne rien rater – actus, coulisses et exclus – c'est sur Instagram que ça se passe !
                </div>
                
                <div class="social-container">
                  <a href="https://www.instagram.com/ikram_nahyl_amir/" target="_blank" class="social-button">
                    Chogan By Ikram
                  </a>
                </div>
                
                <div class="social-icons">
                  <a href="https://www.tiktok.com/@ikrams.chogan" target="_blank" class="social-icon">
                    <img src="https://fujclez.stripocdn.email/content/assets/img/social-icons/logo-colored/tiktok-logo-colored.png" alt="TikTok" width="32" height="32">
                  </a>
                  <a href="https://www.instagram.com/ikram_nahyl_amir/" target="_blank" class="social-icon">
                    <img src="https://fujclez.stripocdn.email/content/assets/img/social-icons/logo-colored/instagram-logo-colored.png" alt="Instagram" width="32" height="32">
                  </a>
                  <a href="https://www.snapchat.com/add/ikramou-anass" target="_blank" class="social-icon">
                    <img src="https://fujclez.stripocdn.email/content/assets/img/messenger-icons/logo-colored/snapchat-logo-colored.png" alt="Snapchat" width="32" height="32">
                  </a>
                  <a href="mailto:choganbyikram.contact@gmail.com?subject=Renseignements%20Produits%20" target="_blank" class="social-icon">
                    <img src="https://fujclez.stripocdn.email/content/assets/img/other-icons/logo-colored/mail-logo-colored.png" alt="Email" width="32" height="32">
                  </a>
                </div>
                
                <p class="footer-info">
                  <strong>Chogan Group S.p.A.</strong> se spécialise dans la production et la distribution de produits cosmétiques et de soins personnels de haute qualité. Actif à l'international, l'entreprise est dynamique et en constante expansion.
                </p>
                
                <a href="#" target="_blank" class="unsubscribe">
                  <strong>Désabonner</strong>
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
  
    return htmlContent;
  };
  