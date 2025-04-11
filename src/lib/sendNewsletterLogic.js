import { supabase } from './supabaseClient';
import { validateEmail } from './utils/validation';
import { inngest, EVENTS } from '../inngest/client';
import { emailConfig } from '../config/emails';
import { getEmailProviderClient, logProviderUsage } from './emailProviders';

/**
 * Génère le contenu HTML de l'email pour un prospect
 * @param {Object} prospect - L'objet prospect contenant les informations nécessaires
 * @returns {string} - Le contenu HTML généré
 */
const generateEmailHTML = (prospect) => {
  const { firstName, lastName, email } = prospect;

  // Structure de l'email
  const htmlContent = 
    `<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
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
                                                  <strong>Bienvenue ${firstName || ''} ${lastName || ''}!</strong>
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
                                                <a target="_blank"href="https://chogan-by-ikram.vercel.app/perfumes">
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
                                                  <u><b><a target="_blank" href="https://chogan-by-ikram.vercel.app/api/unsubscribe?email=${email}" style="color:#333333">Désabonner&nbsp;</a></b></u>
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
  
  return htmlContent;
};

/**
 * Envoie un lot de newsletters aux abonnés spécifiés
 * @param {Object} options - Options de l'envoi
 * @param {Array} options.subscribers - Liste des abonnés
 * @param {string} options.newsletterId - ID de la newsletter
 * @param {string} options.templateId - ID du template
 * @returns {Promise<Object>} - Résultats de l'envoi
 */
export async function sendNewsletterBatch({ subscribers, newsletterId, templateId }) {
  // Récupérer les détails de la newsletter et du template
  const [newsletterData, templateData] = await Promise.all([
    getNewsletterDetails(newsletterId),
    getTemplateDetails(templateId)
  ]);
  
  if (!newsletterData || !templateData) {
    throw new Error('Newsletter ou template introuvable');
  }
  
  // Résultats à retourner
  const results = {
    sentCount: 0,
    failedCount: 0,
    hasMoreSubscribers: false
  };
  
  // Obtenir un fournisseur d'email pour ce lot
  const emailProvider = await getEmailProviderClient(subscribers.length);
  
  // Préparer les envois d'emails parallèles avec un maximum de concurrence
  const MAX_CONCURRENCY = 10;
  
  // Traiter les abonnés par lots pour limiter la concurrence
  for (let i = 0; i < subscribers.length; i += MAX_CONCURRENCY) {
    const batch = subscribers.slice(i, i + MAX_CONCURRENCY);
    
    // Traiter ce lot en parallèle
    const sendPromises = batch.map(subscriber => 
      processSubscriber({
        subscriber,
        newsletterData,
        templateData,
        emailProvider,
        newsletterId
      })
    );
    
    // Attendre que tous les envois du lot soient terminés
    const batchResults = await Promise.allSettled(sendPromises);
    
    // Comptabiliser les résultats
    batchResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.sentCount++;
      } else {
        results.failedCount++;
      }
    });
  }
  
  // Enregistrer l'utilisation du fournisseur d'email
  logProviderUsage(emailProvider, results.sentCount);
  
  // Vérifier s'il y a plus d'abonnés à traiter
  results.hasMoreSubscribers = await checkForMoreSubscribers(subscribers, newsletterData.segmentId);
  
  // Mettre à jour les statistiques de la newsletter
  await updateNewsletterStats(newsletterId, results.sentCount, results.failedCount);
  
  return results;
}

/**
 * Traite un seul abonné
 * @param {Object} options - Options de traitement
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
async function processSubscriber({ subscriber, newsletterData, templateData, emailProvider, newsletterId }) {
  try {
    // Valider l'email
    if (!validateEmail(subscriber.email)) {
      throw new Error(`Email invalide: ${subscriber.email}`);
    }
    
    // Générer le contenu HTML dynamique pour l'email
    const emailContent = generateEmailHTML(subscriber);
    
    // Envoyer l'email
    const sendResult = await emailProvider.send({
      to: subscriber.email,
      subject: newsletterData.subject,
      html: emailContent,
      from: emailConfig.defaultFromEmail,
      replyTo: emailConfig.defaultReplyTo,
      trackingId: `nl_${newsletterId}_${subscriber.id}`
    });
    
    // Enregistrer l'envoi réussi
    await inngest.send({
      name: EVENTS.EMAIL_SENT,
      data: {
        newsletterId,
        subscriberId: subscriber.id,
        email: subscriber.email,
        timestamp: new Date().toISOString(),
        providerId: emailProvider.id,
        providerAccount: emailProvider._meta?.accountId
      }
    });
    
    // Enregistrer l'envoi dans la base de données
    await recordEmailSent(newsletterId, subscriber.id, emailProvider._meta);
    
    return { success: true, subscriberId: subscriber.id };
  } catch (error) {
    console.error(`Erreur lors de l'envoi à ${subscriber.email}:`, error);
    
    // Enregistrer l'échec
    await inngest.send({
      name: EVENTS.EMAIL_FAILED,
      data: {
        newsletterId,
        subscriberId: subscriber.id,
        email: subscriber.email,
        error: error.message,
        timestamp: new Date().toISOString(),
        providerId: emailProvider.id,
        providerAccount: emailProvider._meta?.accountId
      }
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Vérifie s'il y a plus d'abonnés à traiter pour ce segment
 */
async function checkForMoreSubscribers(currentBatch, segmentId) {
  if (!currentBatch.length) return false;
  
  // Trouver le dernier ID traité
  const lastId = currentBatch[currentBatch.length - 1].id;
  
  // Vérifier s'il y a des abonnés avec un ID supérieur
  const { count } = await supabase
    .from('subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('active', true)
    .gt('id', lastId)
    .eq('segment_id', segmentId);
  
  return count > 0;
}

/**
 * Récupère les détails d'une newsletter
 */
async function getNewsletterDetails(newsletterId) {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', newsletterId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Récupère les détails d'un template
 */
async function getTemplateDetails(templateId) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Enregistre un email envoyé dans la base de données
 */
async function recordEmailSent(newsletterId, subscriberId) {
  const { error } = await supabase
    .from('newsletter_sends')
    .insert({
      newsletter_id: newsletterId,
      subscriber_id: subscriberId,
      sent_at: new Date().toISOString(),
      status: 'sent'
    });
  
  if (error) console.error('Erreur lors de l\'enregistrement de l\'envoi:', error);
}

/**
 * Met à jour les statistiques de la newsletter
 */
async function updateNewsletterStats(newsletterId, sentCount, failedCount) {
  const { error } = await supabase.rpc('update_newsletter_stats', {
    p_newsletter_id: newsletterId,
    p_sent_count: sentCount,
    p_failed_count: failedCount
  });
  
  if (error) console.error('Erreur lors de la mise à jour des statistiques:', error);
}