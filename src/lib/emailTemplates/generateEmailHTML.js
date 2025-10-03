// src/lib/emailTemplates/generateEmailHTML.js

export async function generateEmailHTML (prospect){
    const { firstName, lastName, email } = prospect;

    const name = [firstName, lastName].filter(Boolean).join(" ");
  
    // Variables de personnalisation
    const personalizedGreeting = `Bonjour ${name || 'Cher amateur de belles senteurs'},`;
  
    const htmlContent = `<!DOCTYPE html>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="telephone=no" name="format-detection">
    <title>
      Le Secret des Parfums de Luxe à Prix Abordable
    </title>
    <link href="https://fonts.googleapis.com/css?family=Playfair+Display:400,400i,700,700i" rel="stylesheet">
    <style type="text/css">
      /* Styles CSS pour une meilleure lisibilité */ body { font-family: Arial, sans-serif; } .es-button { border-radius: 5px !important; } .es-button-border { border-radius: 5px !important; }
    </style>
  </head>
  <body class="body" style="background-color: #fafafa">
    <div dir="ltr" class="es-wrapper-color">
      <table cellpadding="0" cellspacing="0" width="100%" class="es-wrapper">
        <tbody>
          <tr>
            <td valign="top" class="esd-email-paddings">
              <table align="center" cellpadding="0" cellspacing="0" class="es-header">
                <tbody>
                  <tr>
                    <td align="center" class="esd-stripe">
                      <table align="center" bgcolor="#ffffff" cellpadding="0" cellspacing="0" width="600" class="es-header-body">
                        <tbody>
                          <tr>
                            <td align="left" class="esd-structure es-p10t es-p10b es-p20r es-p20l">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="top" width="560" class="es-m-p0r esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-image es-p20b" style="font-size: 0px">
                                              <a target="_blank" href="https://chogan-by-ikram.vercel.app/">
                                                <img alt="Logo By Ikram" src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/by_ikram_logo.png" title="Logo" width="200" class="adapt-img" style="display: block; font-size: 12px">
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
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table align="center" cellpadding="0" cellspacing="0" class="es-content">
                <tbody>
                  <tr>
                    <td align="center" class="esd-stripe">
                      <table align="center" bgcolor="#ffffff" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                        <tbody>
                          <tr>
                            <td align="left" class="esd-structure es-p30t es-p20r es-p20l">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="top" width="560" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-text">
                                              <h1 style="color: #000000; font-size: 24px">
                                                **${personalizedGreeting}**
                                              </h1>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p20t es-p20b">
                                              <p style="font-size: 18px; line-height: 1.5; color: #444">
                                                **Vous aimez les parfums de luxe, mais pas leurs prix ?** Découvrez comment des milliers de personnes profitent déjà de leurs fragrances préférées sans se ruiner.
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-image es-p10t es-p10b" style="font-size: 0px">
                                              <a href="https://chogan-by-ikram.vercel.app/perfumes" target="_blank">
                                                <img alt="Parfum Chogan" src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/photo_email_1.png" width="330" class="adapt-img" style="display: block">
                                              </a>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="left" class="esd-block-text es-p20t es-p10b">
                                              <h2 style="color: #333; font-size: 20px; text-align: center">
                                                Pourquoi choisir By Ikram ?
                                              </h2>
                                              <ul style="padding-left: 20px; font-size: 16px; color: #555">
                                                <li style="margin-bottom: 10px">
                                                  **Qualité Exceptionnelle :** Nos parfums sont créés avec 30% d'essence pour une tenue intense et durable, équivalente aux grandes marques.
                                                </li>
                                                <li style="margin-bottom: 10px">
                                                  **Économies Garanties :** Fini les prix exorbitants des parfumeries traditionnelles. Profitez de la même expérience olfactive pour une fraction du prix.
                                                </li>
                                                <li style="margin-bottom: 10px">
                                                  **Vaste Choix :** Plus de 130 fragrances inspirées des plus grands succès mondiaux vous attendent.
                                                </li>
                                              </ul>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-button es-p30t es-p30b">
                                              <span class="es-button-border" style="border-width: 2px; border-color: #5c68e2; background: #000000">
                                                <a href="https://chogan-by-ikram.vercel.app/perfumes" target="_blank" class="es-button es-button-1621620532140" style="padding: 12px 35px; text-decoration: none; color: white; background-color: #000000; border-radius: 5px; font-family: Arial, sans-serif; font-size: 18px; display: inline-block">
                                                  Découvrir les 5 Incontournables
                                                </a>
                                              </span>
                                              <p style="margin-top: 15px; font-size: 14px; color: #888">
                                                (Et trouvez votre coup de cœur sans engagement)
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
              <table align="center" cellpadding="0" cellspacing="0" class="es-content">
                <tbody>
                  <tr>
                    <td align="center" class="esd-stripe">
                      <table align="center" bgcolor="#ffffff" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                        <tbody>
                          <tr>
                            <td align="left" class="esd-structure es-p20t es-p10b es-p20r es-p20l">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="top" width="560" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p20b">
                                              <h2 style="color: #000; font-size: 22px">
                                                Notre Sélection du Moment
                                              </h2>
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
                            <td align="left" class="esd-structure es-p10t es-p20b es-p20r es-p20l es-m-p5b">
                              <table align="left" cellpadding="0" cellspacing="0" class="es-left">
                                <tbody>
                                  <tr>
                                    <td align="center" width="174" class="es-m-p0r es-m-p20b esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #efefef; border-radius: 5px; border-collapse: separate">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-image es-p5" style="font-size: 0px">
                                              <a target="_blank" href="https://chogan-by-ikram.vercel.app/perfumes/Homme/031">
                                                <img alt="" src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/homme.png" width="132" class="adapt-img" style="display: block">
                                              </a>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p10r es-p10l">
                                              <h3 class="es-m-txt-c" style="margin-bottom: 5px">
                                                Parfum 031
                                              </h3>
                                              <p style="font-size: 12px; color: #888">
                                                Homme, Inspiré par Blu de Bulgari
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p5t es-p5b es-p10r es-p10l">
                                              <h2 class="es-m-txt-c" style="color: #000">
                                                18€
                                              </h2>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-button es-p20b">
                                              <span class="es-button-border" style="border-color: #000000; background: #ffffff; border-width: 2px">
                                                <a href="https://chogan-by-ikram.vercel.app/perfumes/Homme/031" target="_blank" class="es-button" style="color: #000000; background: #ffffff; padding: 5px 20px; font-size: 14px">
                                                  Commander
                                                </a>
                                              </span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                    <td width="20" class="es-hidden"></td>
                                  </tr>
                                </tbody>
                              </table>
                              <table align="left" cellpadding="0" cellspacing="0" class="es-left">
                                <tbody>
                                  <tr>
                                    <td align="center" width="173" class="es-m-p20b esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #efefef; border-radius: 5px; border-collapse: separate">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-image es-p5" style="font-size: 0px">
                                              <a target="_blank" href="https://chogan-by-ikram.vercel.app/perfumes/Femme/085">
                                                <img alt="" src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/femme.png" width="131" class="adapt-img" style="display: block">
                                              </a>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p10r es-p10l">
                                              <h3 class="es-m-txt-c" style="margin-bottom: 5px">
                                                Parfum 085
                                              </h3>
                                              <p style="font-size: 12px; color: #888">
                                                Femme, Inspiré par Chance de Chanel
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p5t es-p5b es-p10r es-p10l">
                                              <h2 class="es-m-txt-c" style="color: #000">
                                                18€
                                              </h2>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-button es-p20b">
                                              <span class="es-button-border" style="border-color: #000000; background: #ffffff; border-width: 2px">
                                                <a href="https://chogan-by-ikram.vercel.app/perfumes/Femme/085" target="_blank" class="es-button" style="color: #000000; background: #ffffff; padding: 5px 20px; font-size: 14px">
                                                  Commander
                                                </a>
                                              </span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                    <td width="20" class="es-hidden"></td>
                                  </tr>
                                </tbody>
                              </table>
                              <table align="right" cellpadding="0" cellspacing="0" class="es-right">
                                <tbody>
                                  <tr>
                                    <td align="center" width="173" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #efefef; border-radius: 5px; border-collapse: separate">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-image es-p5" style="font-size: 0px">
                                              <a target="_blank" href="https://chogan-by-ikram.vercel.app/perfumes/Brume%20cheveux/PC023B">
                                                <img alt="" src="https://fujclez.stripocdn.email/content/guids/CABINET_f295fbfa96b4f50a858efad56963e60e3ef7117f54de28144de53de8248c2fd1/images/brume.jpg" width="132" class="adapt-img" style="display: block">
                                              </a>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p10r es-p10l">
                                              <h3 class="es-m-txt-c" style="margin-bottom: 5px">
                                                Brume cheveux
                                              </h3>
                                              <p style="font-size: 12px; color: #888">
                                                Inspiré par Hypnotic Poison de Dior
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p5t es-p5b es-p10r es-p10l">
                                              <h2 class="es-m-txt-c" style="color: #000">
                                                9.90 €
                                              </h2>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-button es-p20b">
                                              <span class="es-button-border" style="border-color: #000000; background: #ffffff; border-width: 2px">
                                                <a href="https://chogan-by-ikram.vercel.app/perfumes/Brume%20cheveux/PC023B" target="_blank" class="es-button" style="color: #000000; background: #ffffff; padding: 5px 20px; font-size: 14px">
                                                  Commander
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
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table align="center" cellpadding="0" cellspacing="0" class="es-footer">
                <tbody>
                  <tr>
                    <td align="center" class="esd-stripe">
                      <table align="center" bgcolor="#ffffff" cellpadding="0" cellspacing="0" width="600" class="es-footer-body">
                        <tbody>
                          <tr>
                            <td align="left" class="esd-structure es-p20t es-p20b es-p20r es-p20l">
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" valign="top" width="560" class="esd-container-frame">
                                      <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tbody>
                                          <tr>
                                            <td align="center" class="esd-block-text es-p10t es-p10b">
                                              <p style="font-size: 12px; color: #999">
                                                Vous recevez cet email car vous avez manifesté un intérêt pour nos produits. <br>Pour ne plus recevoir nos offres, <a href="{{unsubscribe_link}}" target="_blank" style="color: #000000">cliquez ici</a>.
                                              </p>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td align="center" class="esd-block-text">
                                              <p style="font-size: 14px; color: #555">
                                                © ${new Date().getFullYear()} Chogan By Ikram. Tous droits réservés.
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
`;
  
    return htmlContent;
}