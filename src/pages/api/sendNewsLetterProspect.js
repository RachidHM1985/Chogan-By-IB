import axios from 'axios';
import { supabase } from '../../../lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import sendgrid from '@sendgrid/mail';
import { addHours, isBefore } from 'date-fns';

// Initialize API services
sendgrid.setApiKey(process.env.SENDGRID_API_KEY_MAIL);

// Sender emails for each provider (rotating to avoid reputation issues)
const SENDER_EMAILS = [
  'choganbyikram.contact@gmail.com',
]; 

// Rotation indices for API keys and sender emails
const rotation = {
  apiKeys: {
    sendgrid: 0,
    brevo: 0,
    mailjet: 0
  },
  senderEmail: 0 // Fixed: was mailEmail
};

// Counters for rate limiting
const counters = {
  daily: {},
  keys: {},  // Track usage per API key
  hourly: 0,
  lastReset: new Date(),
  emailsSentSinceProviderRotation: 0
};

// Track current provider for rotation
let currentProvider = null;

// Individual sending functions with proper error handling and API key rotation
const sendWithSendGrid = async (email, message, apiKey) => {
  // Set the API key for this specific send
  sendgrid.setApiKey(apiKey);

  const msg = {
    to: email,
    from: message.senderEmail || SENDER_EMAILS[0], // Fixed: was CONFIG.SENDER_EMAIL
    subject: message.subject,
    html: message.html,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    await sendgrid.send(msg);
    return true;
  } catch (error) {
    const statusCode = error.response?.statusCode;
    // Handle specific error codes
    if (statusCode === 429) {
      throw new Error('SendGrid rate limit exceeded. Try again later.');
    } else if (statusCode === 403) {
      throw new Error('SendGrid authentication error or sending restriction.');
    }
    throw error;
  }
};

// Fonction pour envoyer l'email avec Brevo
const sendWithBrevo = async (email, message, apiKey) => {
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { email: message.senderEmail || SENDER_EMAILS[0] }, // Fixed: was CONFIG.SENDER_EMAIL
      to: [{ email }],
      subject: message.subject,
      htmlContent: message.html,
      headers: {
        'X-Mailin-trackclicks': 'on',
        'X-Mailin-trackopens': 'on'
      }
    }, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 secondes de timeout
    });
    
    if (response.status !== 201) {
      throw new Error(`Brevo error: ${response.status} ${JSON.stringify(response.data)}`);
    }

    // Mise à jour des quotas après envoi réussi
    const keyId = apiKey.substring(0, 8);
    // Fixed: was using undefined PROVIDERS and undefined CONFIG.PROVIDERS
    if (!counters.keys.brevo) {
      counters.keys.brevo = {};
    }
    if (!counters.keys.brevo[keyId]) {
      counters.keys.brevo[keyId] = { count: 0 };
    }
    counters.keys.brevo[keyId].count++;

    return true;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      throw new Error('Brevo rate limit exceeded. Try again later.');
    }
    throw error;
  }
};

const sendWithMailjet = async (email, message, credentials) => {
  try {
    console.log("mailjet:",credentials)
    // Assurer que les credentials sont valides
    if (!credentials || !credentials.apiKey || !credentials.secretKey) {
      throw new Error('Invalid Mailjet credentials');
    }

    const response = await axios.post(
      'https://api.mailjet.com/v3.1/send',
      {
        Messages: [
          {
            From: {
              Email: message.senderEmail || SENDER_EMAILS[0], // Fixed: was CONFIG.SENDER_EMAIL
              Name: message.senderName || "Chogan" // Fixed: was CONFIG.SENDER_NAME
            },
            To: [{ Email: email }],
            Subject: message.subject,
            HTMLPart: message.html,
            TrackClicks: 'account_default',
            TrackOpens: 'account_default'
          }
        ]
      },
      {
        auth: {
          username: credentials.apiKey,
          password: credentials.secretKey
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.status !== 200) {
      throw new Error(`Mailjet error: ${response.status} ${JSON.stringify(response.data)}`);
    }

    // Assurez-vous que credentials.apiKey est bien une chaîne de caractères
    if (typeof credentials.apiKey !== 'string') {
      throw new Error('API key is not a valid string');
    }

    // Si l'email a été envoyé avec succès
    console.log(`✓ Email successfully sent to ${email} via mailjet (key: ${credentials.apiKey.substring(0, 8)})`);

    return true;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Mailjet rate limit exceeded. Try again later.');
    }
    throw error;
  }
};

const API_KEYS = {
  sendgrid: [
    process.env.SENDGRID_API_KEY_MAIL,
    process.env.SENDGRID_API_KEY_CAMPAGN_NEWSLETTER
  ].filter(Boolean), // Filter out undefined keys
  
  brevo: [
    process.env.BREVO_API_KEY,
    process.env.BREVO_API_KEY_CHOGANBYIKRAM,
    process.env.BREVO_API_KEY_YAHOO
  ].filter(Boolean),
  
  mailjet: [
    {
      apiKey: process.env.MAILJET_API_KEY_HACHEM_RACH,
      secretKey: process.env.MAILJET_SECRET_KEY_HACHEM_RACH
    },
    {
      apiKey: process.env.MAILJET_API_KEY_CHOGAN,
      secretKey: process.env.MAILJET_SECRET_KEY_CHOGAN
    },
    {
      apiKey: process.env.MAILJET_API_KEY_YAHOO,
      secretKey: process.env.MAILJET_SECRET_KEY_YAHOO
    }
  ].filter(pair => pair.apiKey && pair.secretKey)
};

// Configuration
const CONFIG = {
  BATCH_SIZE: 95,                  // Slightly under 100 to avoid exact quota limits
  BATCH_INTERVAL: 1.5 * 60 * 60 * 1000, // 1.5 hours between batches (in ms)
  HOURLY_LIMIT: 450,               // Max emails per hour (slightly under provider limits)
  EMAIL_INTERVAL: 100,             // 100ms between emails (10 emails per second)
  MAX_RETRIES: 3,                  // Max retries for failed emails
  PROVIDER_ROTATION_INTERVAL: 35,  // Rotate provider every 35 emails
  TEST_MODE: false,
  SENDER_EMAIL: SENDER_EMAILS[0],  // Default sender email
  SENDER_NAME: "Chogan by Ikram",  // Added missing SENDER_NAME
  DEFAULT_SUBJECT: 'Votre Newsletter - Nouveaux parfums disponibles',
  ACTIVE_PROVIDERS: ['sendgrid', 'brevo', 'sender'],
  PROVIDERS: {
    // Order based on cost-effectiveness (cheapest first)
    sendgrid: {
      enabled: API_KEYS.sendgrid.length > 0,
      dailyQuotaPerKey: 100,       // Adjust based on your free tier limits
      send: sendWithSendGrid,      // Fixed: directly assigned the function
    },
    brevo: {
      enabled: API_KEYS.brevo.length > 0,
      dailyQuotaPerKey: 300,       // Ajuster en fonction des limites de ton plan gratuit
      send: sendWithBrevo,         // Fonction d'envoi via Brevo
      apiKeys: API_KEYS.brevo,     // Liste des clés API Brevo
      quotas: {},                  // Stocke le quota quotidien utilisé pour chaque clé
    },
    mailjet: {
      enabled: API_KEYS.mailjet.length > 0,
      dailyQuotaPerKey: 200,       // Adjust based on your free tier limits
      send: sendWithMailjet,       // Fixed: directly assigned the function
    }
  }
};

// Calculate total daily quotas based on number of API keys
Object.keys(CONFIG.PROVIDERS).forEach(provider => {
  if (CONFIG.PROVIDERS[provider].enabled) {
    CONFIG.PROVIDERS[provider].dailyQuota = 
      CONFIG.PROVIDERS[provider].dailyQuotaPerKey * API_KEYS[provider].length;
  }
});

// Fixed: Renamed function to match its purpose
const getNextBrevoApiKey = () => {
  if (API_KEYS.brevo.length === 0) {
    return null;
  }
  
  // Get the next key using round-robin rotation
  const index = rotation.apiKeys.brevo;
  const apiKey = API_KEYS.brevo[index];
  
  // Update rotation index for next time
  rotation.apiKeys.brevo = (index + 1) % API_KEYS.brevo.length;
  
  return apiKey;
};

// Get the next API key for a provider using round-robin rotation
const getNextApiKey = (provider) => {
  if (provider === 'brevo') {
    return getNextBrevoApiKey();
  }
  
  if (provider === 'sendgrid') {
    if (API_KEYS.sendgrid.length === 0) return null;
    
    const index = rotation.apiKeys.sendgrid;
    const apiKey = API_KEYS.sendgrid[index];
    rotation.apiKeys.sendgrid = (index + 1) % API_KEYS.sendgrid.length;
    return apiKey;
  }
  
  if (provider === 'mailjet') {
    if (API_KEYS.mailjet.length === 0) return null;
    
    const index = rotation.apiKeys.mailjet;
    const credentials = API_KEYS.mailjet[index];
    rotation.apiKeys.mailjet = (index + 1) % API_KEYS.mailjet.length;
    return credentials;
  }
  
  return null;
};

// Get the next sender email using round-robin rotation
const getNextSenderEmail = () => {
  const email = SENDER_EMAILS[rotation.senderEmail];
  rotation.senderEmail = (rotation.senderEmail + 1) % SENDER_EMAILS.length;
  return email;
};

// Reset counters if needed
const checkAndResetCounters = () => {
  const now = new Date();
  
  // Reset hourly counter if an hour has passed
  if (isBefore(addHours(counters.lastReset, 1), now)) {
    counters.hourly = 0;
    counters.lastReset = now;
  }
  
  // Reset daily counters if needed (at midnight)
  const today = now.toISOString().split('T')[0];
  Object.keys(CONFIG.PROVIDERS).forEach(provider => {
    // Initialize or reset the daily counter for this provider
    if (!counters.daily[provider] || counters.daily[provider].date !== today) {
      counters.daily[provider] = { count: 0, date: today };
    }
    
    // Initialize counters for each API key
    if (!counters.keys[provider]) {
      counters.keys[provider] = {};
    }
    
    // Reset API key counters if date changed
    if (API_KEYS[provider]) {
      if (Array.isArray(API_KEYS[provider])) {
        API_KEYS[provider].forEach(key => {
          let keyId;

          // Si la clé est un objet (par exemple, pour Mailjet)
          if (typeof key === 'object' && key.apiKey) {
            keyId = key.apiKey.substring(0, 8);  // Utilise apiKey pour Mailjet
          } 
          // Si la clé est une chaîne (par exemple, pour SendGrid ou Brevo)
          else if (typeof key === 'string') {
            keyId = key.substring(0, 8);  // Utilise la chaîne directement
          } 
          else {
            console.error('Invalid key format:', key);
            return;  // Si la clé est invalide, on arrête cette itération
          }

          // Initialize key counter if needed
          if (!counters.keys[provider][keyId] || counters.keys[provider][keyId].date !== today) {
            counters.keys[provider][keyId] = { count: 0, date: today };
          }
        });
      }
    }
  });
};

// Choose the next provider in rotation or best available
const selectNextProvider = (triedProviders = []) => {
  // Get active providers from configuration
  const activeProviders = Array.isArray(CONFIG.ACTIVE_PROVIDERS) ? CONFIG.ACTIVE_PROVIDERS : [];

  // Filter providers that haven't been tried yet and have API keys available
  const availableProviders = activeProviders.filter(p => {
    // Skip if already tried
    if (triedProviders.includes(p)) return false;
    
    // Check if provider is enabled in config
    if (!CONFIG.PROVIDERS[p]?.enabled) return false;
    
    // Check if the provider has any API keys left
    return API_KEYS[p] && (
      // For arrays of API keys (SendGrid, Brevo)
      (Array.isArray(API_KEYS[p]) && API_KEYS[p].length > 0) ||
      // For object arrays (Mailjet)
      (!Array.isArray(API_KEYS[p]) && Object.keys(API_KEYS[p]).length > 0)
    );
  });

  // Log available providers for debugging
  console.log(`Available providers: ${JSON.stringify(availableProviders)}`);
  
  return availableProviders.length > 0 ? availableProviders[0] : null;
};

// Enhanced email validation
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Basic format validation
  const formatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatRegex.test(email)) return false;
  
  // More comprehensive RFC 5322 compliant regex
  const detailedRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!detailedRegex.test(email.toLowerCase())) return false;
  
  // Check for disposable email domains
  const disposableDomains = ['temp-mail.org', 'guerrillamail.com', 'mailinator.com'];
  const domain = email.split('@')[1].toLowerCase();
  if (disposableDomains.some(d => domain.includes(d))) return false;
  
  return true;
};

// Deduplicate emails in the prospect list
const deduplicateProspects = (prospects) => {
  const seen = new Set();
  return prospects.filter(p => {
    // Vérifier si l'email existe et n'est pas vide
    const email = p.email ? p.email.toLowerCase().trim() : null;
    
    // Si l'email est null ou déjà vu, on l'exclut
    if (!email || seen.has(email)) return false;
    
    seen.add(email);
    return true;
  });
};

// Function to generate HTML email content
const generateEmailHTML = (prospect) => {
  return `<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title></title>
    <!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]-->
    <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
    <!--[if !mso]><!-- -->
    <link href="https://fonts.googleapis.com/css?family=Playfair+Display:400,400i,700,700i" rel="stylesheet">
    <!--<![endif]-->
    <!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]-->
    <!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  </head>
  <body class="body">
    <div dir="ltr" class="es-wrapper-color">
      <!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#f3f3f3"></v:fill>
			</v:background>
		<![endif]-->
      <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper">
        <tbody>
          <tr>
            <td valign="top" class="esd-email-paddings">
              <table cellspacing="0" cellpadding="0" align="center" class="es-content es-preheader esd-header-popover">
                <tbody>
                </tbody>
              </table>
              <table cellpadding="0" cellspacing="0" align="center" class="es-header">
                <tbody>
                  <tr>
                    <td align="center" bgcolor="#ffffff" class="esd-stripe" style="background-color:rgb(255, 255, 255)">
                      <table bgcolor="rgba(0, 0, 0, 0)" align="center" cellpadding="0" cellspacing="0" width="600" esd-img-prev-src class="es-header-body">
                        <tbody>
                          <tr>
                            <td align="left" esd-img-prev-src esd-img-prev-position="center top" class="esd-structure es-p20t es-p20r es-p20l" style="background-position:center top">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td width="560" align="center" valign="top" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-image" style="font-size:0">
                                              <a target="_blank" href="https://chogan-by-ikram.vercel.app/">
                                                <img src="https://fujclez.stripocdn.email/content/guids/CABINET_2c24e97afd23d91f7dec388776c2c7964532e878da1223d8a41a5bf7df4c04fa/images/by_ikram_logo.png" alt="" width="190" class="adapt-img" style="display:block">
                                              </a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td align="left" esd-img-prev-src esd-img-prev-position="center top" class="esd-structure es-p20t es-p15b es-p20r es-p20l" style="background-position:center top">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td width="560" align="center" valign="top" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td class="esd-block-menu">
                                              <table cellpadding="0" cellspacing="0" class="es-menu es-table-not-adapt">
                                                <tbody>
                                                  <tr>
                                                    <td align="center" valign="top" width="20.00%" id="esd-menu-id-0" bgcolor="#fef4f3" class="es-p10t es-p10b es-p5r es-p5l esd-block-menu-item" style="padding-bottom:10px;padding-top:10px">
                                                      <div>
                                                        <a target="_blank" href="https://chogan-by-ikram.vercel.app/perfumes" style="font-weight:bold">
                                                          Parfums
                                                        </a>
                                                      </div>
                                                    </td>
                                                    <td align="center" valign="top" width="20.00%" id="esd-menu-id-1" bgcolor="#fef4f3" esdev-border-color="#000000" esdev-border-style="solid" class="es-p10t es-p10b es-p5r es-p5l esd-block-menu-item" style="padding-bottom:10px;padding-top:10px">
                                                      <div>
                                                        <a target="_blank" href="https://chogan-by-ikram.vercel.app/brilhome" style="font-weight:bold">
                                                          Produits De Beauté
                                                        </a>
                                                      </div>
                                                    </td>
                                                    <td align="center" valign="top" width="20.00%" id="esd-menu-id-2" bgcolor="#fef4f3" esdev-border-color="#000000" esdev-border-style="solid" class="es-p10t es-p10b es-p5r es-p5l esd-block-menu-item" style="padding-bottom:10px;padding-top:10px">
                                                      <div>
                                                        <a target="_blank" href="https://chogan-by-ikram.vercel.app/peptilux" style="font-weight:bold">
                                                          Cosmétique de Luxe
                                                        </a>
                                                      </div>
                                                    </td>
                                                    <td align="center" valign="top" width="20.00%" id="esd-menu-id-3" bgcolor="#fef4f3" esdev-border-color="#000000" esdev-border-style="solid" class="es-p10t es-p10b es-p5r es-p5l esd-block-menu-item" style="padding-bottom:10px;padding-top:10px">
                                                      <div>
                                                        <a target="_blank" href="https://chogan-by-ikram.vercel.app/brilhome" style="color:#333333;font-weight:bold">
                                                          Produits Ménager
                                                        </a>
                                                      </div>
                                                    </td>
                                                    <td align="center" valign="top" width="20.00%" id="esd-menu-id-3" bgcolor="#fef4f3" esdev-border-color="#000000" esdev-border-style="solid" class="esd-block-menu-item es-p10t es-p5r es-p10b es-p5l" style="padding-top:10px;padding-bottom:10px">
                                                      <div>
                                                        <a target="_blank" href="https://chogan-by-ikram.vercel.app/parfumerieInterieur" style="color:#333333;font-weight:bold">
                                                          Parfumerie d'Intérieur
                                                        </a>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table cellpadding="0" cellspacing="0" align="center" class="es-content">
                <tbody>
                  <tr>
                    <td align="center" bgcolor="#ffffff" class="esd-stripe esd-checked" style="background-image:url(https://fujclez.stripocdn.email/content/guids/CABINET_3a08bc5dc2724c01f8c13454b8e32bd9/images/17111557817145792.png);background-position:center top;background-repeat:no-repeat;background-color:rgb(255, 255, 255)">
                      <table bgcolor="transparent" align="center" cellpadding="0" cellspacing="0" width="600" class="es-content-body" style="background-color:transparent">
                        <tbody>
                          <tr>
                            <td align="left" bgcolor="transparent" esd-img-prev-src esd-img-prev-position="center top" class="esd-structure es-p15t es-p30b es-p20r es-p20l" style="background-position:center top;background-color:transparent">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td width="560" align="center" valign="top" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p5t es-p10b">
                                              <h2 style="color:#ff809c;font-size:18px">
                                                <strong>Bienvenue ${prospect.prenom || ''} ${prospect.nom || ''}!</strong>
                                              </h2>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p5t">
                                              <h2 style="color: #060606; font-size: 21px">
                                                J'ai un bon plan à te partager... Découvre comment t'offrir des parfums inspirés des grandes marques sans te ruiner!
                                              </h2>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-image es-p30t" style="font-size:0">
                                              <a target="_blank" href="https://viewstripo.email/">
                                                <img src="https://fujclez.stripocdn.email/content/guids/CABINET_a4942cb7174952c31a70ca72e80355d6e2d2e4df757c4d74f502b4b8f33a9d97/images/image_hdJ.jpeg" alt="" width="540" class="adapt-img" style="display: block">
                                              </a>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p5t">
                                              <p style="color: #060606; font-size: 21px">
                                                <strong>
</strong>Déjà adoptés par des milliers de clients, nos parfums inspirés des plus grandes marques n'attendent plus que vous. Explorez toute notre collection et trouvez la fragrance qui vous ressemble, à des prix irrésistibles.
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p20t">
                                              <p style="color: #060606; font-size: 21px; line-height: 180%">
                                                <strong>Vous ne connaissez pas encore Chogan ?</strong><br><span style="line-height: 150%"><strong>Chogan Group</strong> est une marque italienne reconnue pour la qualité de ses produits cosmétiques, parfums et soins inspirés des plus grandes maisons. Fabriqués en Italie avec des ingrédients soigneusement sélectionnés, les produits Chogan allient élégance, efficacité et accessibilité. Leur gamme de parfums, inspirée des grands noms de la parfumerie, séduit déjà des milliers de clients à travers l'Europe.</span>
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table cellspacing="0" cellpadding="0" align="center" class="es-content">
                <tbody>
                </tbody>
              </table>
              <table cellspacing="0" cellpadding="0" align="center" class="es-content">
                <tbody>
                </tbody>
              </table>
              <table cellspacing="0" cellpadding="0" align="center" class="es-content">
                <tbody>
                </tbody>
              </table>
              <table cellspacing="0" cellpadding="0" align="center" class="es-content">
                <tbody>
                  <tr>
                    <td align="center" bgcolor="#ffffff" class="esd-stripe" style="background-color:rgb(255, 255, 255)">
                      <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" width="600" esd-img-prev-src class="es-footer-body" style="background-color:rgb(255, 255, 255)">
                        <tbody>
                          <tr>
                            <td align="left" class="esd-structure">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="left" bgcolor="transparent" class="esd-structure es-p15t es-p20r es-p20l" style="background-color:transparent;background-position:center top">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td width="560" align="center" valign="top" class="esd-container-frame esd-checked">
                                              <table cellpadding="0" cellspacing="0" width="100%" style="background-image:url(https://fujclez.stripocdn.email/content/guids/CABINET_2186a850c3b1616469e9a89f9c4c388a/images/18471556615499706.png);background-position:center top;background-repeat:no-repeat">
                                                <tbody>
                                                  <tr>
                                                    <td align="center" class="esd-block-text es-p20b es-p5t">
                                                      <h1 style="color:#ffb406;font-size:36px;font-family:&#39;playfair display&#39;, georgia, &#39;times new roman&#39;, serif">
                                                        <b>SUIVEZ NOUS!</b>
                                                      </h1>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td align="left" esd-img-prev-src class="esd-structure es-p10b es-p20r es-p20l" style="background-position:center top">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td width="560" align="center" valign="top" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" bgcolor="#ffdad7" class="esd-block-text es-p5t es-p15b">
                                              <p>
                                                <b>
On est présents partout, mais pour ne rien rater – actus, coulisses et exclus – c'est sur Instagram que ça se passe !

</b>
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td align="left" class="esd-structure es-p20r es-p20l" style="background-position:center top">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td width="560" align="center" valign="top" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-button es-p10">
                                              <span class="es-button-border es-button-border-1556615997852" style="border-radius:0px;border-color:rgb(255, 130, 156);border-width:2px;background:rgb(255, 255, 255)">
                                                <a href="https://www.instagram.com/ikram_nahyl_amir/" target="_blank" class="es-button es-button-1556615997839" style="background: rgb(255, 255, 255); border-color: rgb(255, 255, 255); font-size: 13px; color: rgb(255, 130, 156); border-radius: 0px">
                                                  @ikram_nahyl_amir
                                                </a>
                                              </span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td align="left" esd-img-prev-src esd-img-prev-position="center top" class="esd-structure es-p20b es-p20r es-p20l" style="background-position:center top">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td width="560" align="center" valign="top" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-social" style="font-size:0">
                                              <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social">
                                                <tbody>
                                                  <tr>
                                                    <td align="center" valign="top" class="es-p10r">
                                                      <a target="_blank" href="https://www.tiktok.com/@ikrams.chogan">
                                                        <img src="https://fujclez.stripocdn.email/content/assets/img/social-icons/logo-colored/tiktok-logo-colored.png" alt="Tt" title="TikTok" width="31" height="31">
                                                      </a>
                                                    </td>
                                                    <td align="center" valign="top" class="es-p10r">
                                                      <a target="_blank" href="https://www.instagram.com/ikram_nahyl_amir/">
                                                        <img src="https://fujclez.stripocdn.email/content/assets/img/social-icons/logo-colored/instagram-logo-colored.png" alt="Ig" title="Instagram" width="31" height="31">
                                                      </a>
                                                    </td>
                                                    <td align="center" valign="top" class="es-p10r">
                                                      <a target="_blank" href="https://www.snapchat.com/add/ikramou-anass">
                                                        <img src="https://fujclez.stripocdn.email/content/assets/img/messenger-icons/logo-colored/snapchat-logo-colored.png" alt="Snapchat" title="Snapchat" width="31" height="31">
                                                      </a>
                                                    </td>
                                                    <td align="center" valign="top">
                                                      <a target="_blank" href="mailto:choganbyikram.contact@gmail.com?subject=Renseignements%20Produits%20">
                                                        <img src="https://fujclez.stripocdn.email/content/assets/img/other-icons/logo-colored/mail-logo-colored.png" alt="Email" title="Email" width="31" height="31">
                                                      </a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" bgcolor="transparent" class="esd-block-text es-p5t es-p15b">
                                              <p style="font-size:12px">
                                                <b>Chogan Group S.p.A. se spécialise dans la production et la distribution de produits cosmétiques et de soins personnels de haute qualité. Actif à l'international, l'entreprise est dynamique et en constante expansion.</b>
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" bgcolor="transparent" esd-links-color="#333333" class="esd-block-text es-p15b">
                                              <p style="font-size:12px">
                                                <u><b><a target="_blank" href="https://chogan-by-ikram.vercel.app/api/unsubscribe?email=${prospect.email}" style="color:#333333">Désabonner&nbsp;</a></b></u>
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table cellpadding="0" cellspacing="0" align="center" class="es-content esd-footer-popover">
                <tbody>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="position:absolute;left:-9999px;top:-9999px;margin:0px"></div>
    <div style="position:absolute;left:-9999px;top:-9999px;margin:0px;padding:0px;border:0px none;width:1px"></div>
  </body>
</html>`;
};

const monitorProviderStatus = () => {
  console.log("\n--- EMAIL PROVIDER STATUS ---");
  
  // Check each provider
  Object.keys(CONFIG.PROVIDERS).forEach(provider => {
    if (!CONFIG.PROVIDERS[provider].enabled) {
      console.log(`${provider}: DISABLED`);
      return;
    }
    
    // Check available API keys
    const keys = API_KEYS[provider];
    if (!keys || (Array.isArray(keys) && keys.length === 0) || 
        (!Array.isArray(keys) && Object.keys(keys).length === 0)) {
      console.log(`${provider}: NO VALID KEYS`);
      return;
    }
    
    // Show key count and daily usage
    const keyCount = Array.isArray(keys) ? keys.length : Object.keys(keys).length;
    const dailyCount = counters.daily[provider]?.count || 0;
    const quotaPerKey = CONFIG.PROVIDERS[provider].dailyQuotaPerKey;
    const totalQuota = quotaPerKey * keyCount;
    
    console.log(`${provider}: ${keyCount} keys, ${dailyCount}/${totalQuota} emails sent today`);
    
    // Detail per key
    if (counters.keys[provider]) {
      Object.entries(counters.keys[provider]).forEach(([keyId, data]) => {
        if (data.date === new Date().toISOString().split('T')[0]) {
          console.log(`  - Key ${keyId}: ${data.count}/${quotaPerKey} emails sent today`);
        }
      });
    }
  });
  
  console.log(`Hourly usage: ${counters.hourly}/${CONFIG.HOURLY_LIMIT}`);
  console.log("-----------------------------\n");
  
  // Return true if at least one provider is available
  return Object.keys(CONFIG.PROVIDERS).some(provider => {
    return CONFIG.PROVIDERS[provider].enabled && 
           API_KEYS[provider] && 
           ((Array.isArray(API_KEYS[provider]) && API_KEYS[provider].length > 0) ||
            (!Array.isArray(API_KEYS[provider]) && Object.keys(API_KEYS[provider]).length > 0));
  });
};

// Send email using the next provider in rotation
const sendEmailWithNextProvider = async (recipientEmail, message, retryCount = 0, triedProviders = []) => {
  // Select next available provider
  const provider = selectNextProvider(triedProviders);

  if (!provider) {
    console.error(`No available providers left to try for ${recipientEmail} after trying: ${triedProviders.join(', ')}`);
    throw new Error('Tous les fournisseurs ont dépassé leurs quotas ou sont invalides');
  }

  // Add the provider to the tried list before attempting to use it
  triedProviders.push(provider);

  try {
    let result = { provider, success: false };

    if (provider === 'brevo') {
      const apiKey = getNextBrevoApiKey();
      if (!apiKey) {
        console.warn(`No valid Brevo API key available for ${recipientEmail}`);
        // Try another provider
        return sendEmailWithNextProvider(recipientEmail, message, retryCount, triedProviders);
      }
      result.success = await CONFIG.PROVIDERS[provider].send(recipientEmail, message, apiKey);
      result.keyId = apiKey.substring(0, 8);
    } 
    else if (provider === 'mailjet') {
      const credentials = getNextApiKey(provider);
      if (!credentials || !credentials.apiKey) {
        console.warn(`No valid Mailjet credentials available for ${recipientEmail}`);
        // Try another provider
        return sendEmailWithNextProvider(recipientEmail, message, retryCount, triedProviders);
      }
      result.success = await CONFIG.PROVIDERS[provider].send(recipientEmail, message, credentials);
      result.keyId = credentials.apiKey.substring(0, 8);
    }
    else if (provider === 'sendgrid') {
      const apiKey = getNextApiKey(provider);
      if (!apiKey) {
        console.warn(`No valid SendGrid API key available for ${recipientEmail}`);
        // Try another provider
        return sendEmailWithNextProvider(recipientEmail, message, retryCount, triedProviders);
      }
      result.success = await CONFIG.PROVIDERS[provider].send(recipientEmail, message, apiKey);
      result.keyId = apiKey.substring(0, 8);
    } 
    else {
      console.warn(`Unknown provider: ${provider}, trying next...`);
      // Try another provider instead of throwing an error
      return sendEmailWithNextProvider(recipientEmail, message, retryCount, triedProviders);
    }

    // Update counters for successful sends
    if (!counters.daily[provider]) {
      counters.daily[provider] = { count: 0, date: new Date().toISOString().split('T')[0] };
    }
    counters.daily[provider].count++;
    counters.hourly++;

    if (result.keyId) {
      if (!counters.keys[provider]) counters.keys[provider] = {};
      if (!counters.keys[provider][result.keyId]) {
        counters.keys[provider][result.keyId] = { count: 0, date: new Date().toISOString().split('T')[0] };
      }
      counters.keys[provider][result.keyId].count++;
    }

    return result;
  } catch (error) {
    const status = error?.response?.status;
  
    // Fix: Changed CONFIG.API_KEYS to API_KEYS when removing faulty keys
    if (status === 401) {
      console.warn(`❌ Unauthorized with ${provider}. Skipping this provider.`);
  
      const faultyKey = provider === 'brevo' ? getNextBrevoApiKey() : getNextApiKey(provider);
      if (faultyKey) {
        // Here's the fixed line - using API_KEYS instead of CONFIG.API_KEYS
        const index = API_KEYS[provider].indexOf(faultyKey);
        if (index > -1) {
          // And here too - using API_KEYS instead of CONFIG.API_KEYS
          API_KEYS[provider].splice(index, 1);
          console.warn(`🗑️ Removed invalid ${provider} key: ${faultyKey.substring(0, 8)}`);
        }
      }
    }
  
    // Réessayer avec un autre provider
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`↪ Retrying with different provider for ${recipientEmail} (attempt ${retryCount + 1})`);
      return sendEmailWithNextProvider(recipientEmail, message, retryCount + 1, triedProviders);
    } else {
      throw new Error(`Failed to send after ${CONFIG.MAX_RETRIES} attempts: ${error.message}`);
    }
  }
};

// Function to send emails to a batch of prospects
const sendEmailsToBatch = async (batch) => {

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    byProvider: {},
    byKey: {},
    errors: []
  }

  // Initialisation des compteurs des fournisseurs
  Object.keys(CONFIG.PROVIDERS).forEach(provider => {
    results.byProvider[provider] = 0;
    results.byKey[provider] = {};
  });

  // Check provider status before starting
  const providersAvailable = monitorProviderStatus(); 

  if (!providersAvailable) {
    console.error("No email providers available! Cannot send emails.");
    results.failed = batch.length;
    results.errors.push({ email: 'all', error: 'No email providers available' });
    return results;
  }

  // Traitement de chaque prospect dans le lot
  for (const prospect of batch) {
    try {
      // Vérifier la limite horaire
      if (counters.hourly >= CONFIG.HOURLY_LIMIT) {
        console.log(`Hourly limit reached (${CONFIG.HOURLY_LIMIT}). Pausing...`);
        results.skipped++;
        await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // Attendre une minute avant de continuer
        counters.hourly = 0; // Réinitialiser le compteur après l'attente
        continue;
      }

      // Validation de l'email
      if (!prospect.email || !validateEmail(prospect.email)) {
        results.skipped++;
        console.log(`Skipping invalid email: ${prospect.email}`);
        continue;
      }

      console.log(`Sending email to ${prospect.email}`);

      // Préparer le contenu de l'email avec un expéditeur rotatif
      const senderEmail = getNextSenderEmail();
      const message = {
        subject: CONFIG.DEFAULT_SUBJECT,
        html: generateEmailHTML(prospect),
        senderEmail: senderEmail,
        senderName: CONFIG.SENDER_NAME
      };

      // Envoyer l'email avec le prochain fournisseur dans la rotation
      let provider, success, keyId;
      try {
        ({ provider, success, keyId } = await sendEmailWithNextProvider(prospect.email, message));
      } catch (err) {
        throw new Error(`Provider failed for ${prospect.email}: ${err.message}`);
      }

      // Mise à jour des résultats et des compteurs
      if (success) {
        results.success++;
        results.byProvider[provider] = (results.byProvider[provider] || 0) + 1;

        // Suivi par clé API
        if (!results.byKey[provider][keyId]) {
          results.byKey[provider][keyId] = 0;
        }
        results.byKey[provider][keyId]++;

        // Mise à jour du statut du prospect dans la base de données
        const { error } = await supabase
          .from('prospects')
          .update({
            status: 'sent',
            last_attempt: new Date().toISOString(),
            provider: provider
          })
          .eq('email', prospect.email);

        if (error) {
          console.error(`Error updating status for ${prospect.email}:`, error.message);
        } else {
          console.log(`Updated status for ${prospect.email} to 'sent'`);
        }
      } else {
        throw new Error(`Failed to send email to ${prospect.email}`);
      }

      // Petite pause entre les emails pour éviter les envois en rafale
      await new Promise(resolve => setTimeout(resolve, CONFIG.EMAIL_INTERVAL));

    } catch (error) {
      results.failed++;
      results.errors.push({ email: prospect.email, error: error.message });
      console.error(`✗ Failed to send to ${prospect.email}:`, error.message);

      // Mise à jour du statut du prospect en cas d'échec
      const { error: updateError } = await supabase
        .from('prospects')
        .update({
          status: 'failed',
          last_attempt: new Date().toISOString()
        })
        .eq('email', prospect.email);

      if (updateError) {
        console.error(`Error updating status for ${prospect.email}:`, updateError.message);
      } else {
        console.log(`Updated status for ${prospect.email} to 'failed'`);
      }

      // Ajout d'une pause légèrement plus longue après les échecs
      await new Promise(resolve => setTimeout(resolve, CONFIG.EMAIL_INTERVAL * 3));
    }
  }

  return results;
};

// Function to send emails in batches with delay between
const sendEmailsInBatches = async (prospects) => {
  // Filter out duplicates and invalid emails
  const deduplicatedProspects = deduplicateProspects(prospects);
  const validProspects = deduplicatedProspects.filter(p => validateEmail(p.email));
  
  console.log(`${validProspects.length} valid prospects out of ${prospects.length} (${prospects.length - validProspects.length} invalid/duplicate emails removed)`);
  
  const totalBatches = Math.ceil(validProspects.length / CONFIG.BATCH_SIZE);
  const results = {
    totalSent: 0,
    totalFailed: 0,
    totalSkipped: 0,
    byProvider: {},
    byKey: {},
    batches: []
  };
  
  // Initialize provider counters
  Object.keys(CONFIG.PROVIDERS).forEach(provider => {
    results.byProvider[provider] = 0;
    results.byKey[provider] = {};
  });

  // Process each batch
  for (let i = 0; i < totalBatches; i++) {
    const batch = validProspects.slice(i * CONFIG.BATCH_SIZE, (i + 1) * CONFIG.BATCH_SIZE);
    console.log(`Sending batch ${i + 1} of ${totalBatches} (${batch.length} emails)`);

    const batchResults = await sendEmailsToBatch(batch);
    
    // Update overall results
    results.totalSent += batchResults.success;
    results.totalFailed += batchResults.failed;
    results.totalSkipped += batchResults.skipped;
    results.batches.push(batchResults);
    
    // Update provider counters
    Object.keys(batchResults.byProvider).forEach(provider => {
      results.byProvider[provider] = (results.byProvider[provider] || 0) + batchResults.byProvider[provider];
      
      // Track by key
      Object.keys(batchResults.byKey[provider] || {}).forEach(keyId => {
        if (!results.byKey[provider][keyId]) {
          results.byKey[provider][keyId] = 0;
        }
        results.byKey[provider][keyId] += batchResults.byKey[provider][keyId];
      });
    });
    
    console.log(`Batch ${i + 1} results:`, batchResults);

    // Wait before sending next batch - only if not the last batch
    if (i < totalBatches - 1) {
      console.log(`Waiting ${CONFIG.BATCH_INTERVAL / 1000 / 60} minutes before next batch...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_INTERVAL));
    }
  }
  
  return results;
};

export default async function handler(req, res) {
  const fetchSize = 10000;
  try {
    const configDir = path.join(process.cwd(), 'config');
    const controlFile = path.join(configDir, 'sendControl.json');
    
    // Check if control file exists, create it if not
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    let control = { enabled: true };
    try {
      if (fs.existsSync(controlFile)) {
        control = JSON.parse(fs.readFileSync(controlFile, 'utf8'));
      } else {
        fs.writeFileSync(controlFile, JSON.stringify(control, null, 2));
      }
    } catch (fileError) {
      console.error('Error reading control file:', fileError);
      // Continue with default settings
    }

    if (!control.enabled) {
      return res.status(403).json({ message: 'Envoi désactivé par l\'administrateur.' });
    }

    if (req.method === 'POST') {
      try {
        console.log('Starting email campaign process');

        // Initialisation de la liste des fournisseurs actifs
        const availableProviders = Object.entries(CONFIG.PROVIDERS)
          .filter(([_, config]) => config.enabled)
          .map(([name]) => name);

        if (availableProviders.length === 0) {
          throw new Error('Aucun fournisseur disponible. Vérifiez les clés API.');
        }

        console.log(`Fournisseurs disponibles : ${availableProviders.join(', ')}`);
        
        // Pagination automatique pour récupérer tous les prospects
        let allProspects = [];
        let hasMore = true;
        let startIndex = 0;

        while (hasMore) {
          const { data, error } = await supabase
            .from('prospects')
            .select('prenom, nom, email, status')
            .is('status', null)
            .order('created_at', { ascending: false })
            .range(startIndex, startIndex + fetchSize - 1);

          if (error) {
            console.error('Erreur Supabase:', error);
            throw error;
          }

          if (data && data.length > 0) {
            allProspects = [...allProspects, ...data];
            startIndex += data.length;
            
            // Check if we got less than the fetch size, indicating we're at the end
            if (data.length < fetchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        console.log(`Retrieved ${allProspects.length} prospects from Supabase`);

        // Filter prospects to exclude those already sent or failed
        const eligibleProspects = allProspects.filter(p => 
          !p.status || (p.status !== 'sent' && p.status !== 'failed')
        );

        console.log(`${eligibleProspects.length} prospects eligible for sending (excluding sent/failed)`);

        if (eligibleProspects.length === 0) {
          return res.status(200).json({ 
            message: 'Aucun prospect éligible trouvé pour l\'envoi.', 
            results: { totalSent: 0, totalFailed: 0, totalSkipped: 0 } 
          });
        }

        // Envoi d'e-mails par lots
        const results = await sendEmailsInBatches(eligibleProspects);
        
        // Logs finaux
        console.log('Campagne terminée !');
        console.log(`Total envoyés : ${results.totalSent}`);
        console.log(`Total échoués : ${results.totalFailed}`);
        console.log(`Total ignorés : ${results.totalSkipped}`);

        return res.status(200).json({ 
          message: 'Campagne d\'emails terminée.', 
          results 
        });
        
      } catch (error) {
        console.error('Erreur en envoyant la newsletter:', error);
        return res.status(500).json({
          error: `Erreur lors de l'envoi de la newsletter : ${error.message}`,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    } else {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (err) {
    console.error('Erreur serveur :', err);
    return res.status(500).json({ message: 'Erreur interne' });
  }
}