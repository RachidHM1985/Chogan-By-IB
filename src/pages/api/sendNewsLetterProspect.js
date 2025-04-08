import axios from 'axios';
import { supabase } from '../../../lib/supabaseClient';
import sendgrid from '@sendgrid/mail';
import { addHours, isBefore } from 'date-fns';

// Initialize API services
sendgrid.setApiKey(process.env.SENDGRID_API_KEY_MAIL);

// API Keys Configuration - Multiple keys for each provider
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
  
  sender: [
    process.env.SENDER_API_KEY,
    process.env.SENDER_API_KEY_YAHOO
  ].filter(Boolean)
};

// Sender emails for each provider (rotating to avoid reputation issues)
const SENDER_EMAILS = [
  'choganbyikram.contact@gmail.com',]; 

// Rotation indices for API keys and sender emails
const rotation = {
  apiKeys: {
    sendgrid: 0,
    brevo: 0,
    sender: 0
  },
  senderEmail: 0
};

// Get the next API key for a provider using round-robin rotation
const getNextApiKey = (provider) => {
  const keys = API_KEYS[provider];
  if (!keys || keys.length === 0) return null;
  
  const key = keys[rotation.apiKeys[provider]];
  rotation.apiKeys[provider] = (rotation.apiKeys[provider] + 1) % keys.length;
  return key;
};

// Get the next sender email using round-robin rotation
const getNextSenderEmail = () => {
  const email = SENDER_EMAILS[rotation.senderEmail];
  rotation.senderEmail = (rotation.senderEmail + 1) % SENDER_EMAILS.length;
  return email;
};

// Individual sending functions with proper error handling and API key rotation
const sendWithSendGrid = async (email, message, apiKey) => {
  // Set the API key for this specific send
  sendgrid.setApiKey(apiKey);

  const msg = {
    to: email,
    from: message.senderEmail || CONFIG.SENDER_EMAIL,
    subject: message.subject,
    html: message.html,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    await sendgrid.send(msg);
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

const sendWithBrevo = async (email, message, apiKey) => {
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { email: message.senderEmail || CONFIG.SENDER_EMAIL },
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
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status !== 201) {
      throw new Error(`Brevo error: ${response.status} ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429) {
        throw new Error('Brevo rate limit exceeded. Try again later.');
      }
    }
    throw error;
  }
};

const sendWithSender = async (email, message, apiKey) => {
  try {
    const response = await axios.post('https://api.sender.net/v2/emails', {
      from: message.senderEmail || CONFIG.SENDER_EMAIL,
      to: email,
      subject: message.subject,
      html_body: message.html,
      track_clicks: true,
      track_opens: true
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status !== 200) {
      throw new Error(`Sender error: ${response.status} ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429) {
        throw new Error('Sender rate limit exceeded. Try again later.');
      }
    }
    throw error;
  }
};

// Configuration
const CONFIG = {
  BATCH_SIZE: 95,                  // Slightly under 100 to avoid exact quota limits
  BATCH_INTERVAL: 1.5 * 60 * 60 * 1000, // 1.5 hours between batches (in ms)
  HOURLY_LIMIT: 450,               // Max emails per hour (slightly under provider limits)
  EMAIL_INTERVAL: 100,             // 100ms between emails (10 emails per second)
  MAX_RETRIES: 3,                  // Max retries for failed emails
  PROVIDER_ROTATION_INTERVAL: 35,  // Rotate provider every 35 emails
  TEST_MODE:false,
  PROVIDERS: {
    // Order based on cost-effectiveness (cheapest first)
    sendgrid: {
      enabled: API_KEYS.sendgrid.length > 0,
      dailyQuotaPerKey: 100,       // Adjust based on your free tier limits
      send: sendWithSendGrid,
    },
    brevo: {
      enabled: API_KEYS.brevo.length > 0,
      dailyQuotaPerKey: 300,       // Adjust based on your free tier limits
      send: sendWithBrevo,
    },
    sender: {
      enabled: API_KEYS.sender.length > 0,
      dailyQuotaPerKey: 200,       // Adjust based on your free tier limits
      send: sendWithSender,
    }
  },
  DEFAULT_SUBJECT: 'Votre Newsletter - Nouveaux parfums disponibles',
};

// Calculate total daily quotas based on number of API keys
Object.keys(CONFIG.PROVIDERS).forEach(provider => {
  if (CONFIG.PROVIDERS[provider].enabled) {
    CONFIG.PROVIDERS[provider].dailyQuota = 
      CONFIG.PROVIDERS[provider].dailyQuotaPerKey * API_KEYS[provider].length;
  }
});

// Counters for rate limiting
const counters = {
  daily: {},
  keys: {},  // Track usage per API key
  hourly: 0,
  lastReset: new Date(),
  emailsSentSinceProviderRotation: 0
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
    API_KEYS[provider].forEach(key => {
      const keyId = key.substring(0, 8); // Use first 8 chars as ID
      if (!counters.keys[provider][keyId] || counters.keys[provider][keyId].date !== today) {
        counters.keys[provider][keyId] = { count: 0, date: today };
      }
    });
  });
};

// Choose the next provider in rotation or best available
const selectNextProvider = () => {
  checkAndResetCounters();
  
  // If we've sent enough emails, rotate to next provider regardless of quota
  if (counters.emailsSentSinceProviderRotation >= CONFIG.PROVIDER_ROTATION_INTERVAL) {
    counters.emailsSentSinceProviderRotation = 0;
    
    // Get all enabled providers
    const enabledProviders = Object.entries(CONFIG.PROVIDERS)
      .filter(([_, config]) => config.enabled)
      .map(([name]) => name);
    
    if (enabledProviders.length > 0) {
      // Simple round-robin rotation between providers
      const currentProviderIndex = enabledProviders.indexOf(currentProvider);
      const nextProviderIndex = (currentProviderIndex + 1) % enabledProviders.length;
      currentProvider = enabledProviders[nextProviderIndex];
      return currentProvider;
    }
  }
  
  // Otherwise, find first available provider that hasn't reached daily quota
  for (const [name, config] of Object.entries(CONFIG.PROVIDERS)) {
    if (!config.enabled) continue;
    
    const dailyUsage = counters.daily[name]?.count || 0;
    if (dailyUsage < config.dailyQuota) {
      counters.emailsSentSinceProviderRotation++;
      return name;
    }
  }
  
  // If all quotas exceeded, return null
  return null;
};

// Track current provider for rotation
let currentProvider = null;

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
    const email = p.email.toLowerCase().trim();
    if (seen.has(email)) return false;
    seen.add(email);
    return true;
  });
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
  };
  
  // Initialize provider and key counters
  Object.keys(CONFIG.PROVIDERS).forEach(provider => {
    results.byProvider[provider] = 0;
    results.byKey[provider] = {};
  });
  
  // Process each prospect in the batch
  for (const prospect of batch) {
    try {
      // Skip if hourly limit reached
      if (counters.hourly >= CONFIG.HOURLY_LIMIT) {
        console.log(`Hourly limit reached (${CONFIG.HOURLY_LIMIT}). Pausing...`);
        results.skipped++;
        await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // Wait a minute before continuing
        counters.hourly = 0; // Reset counter after waiting
        continue;
      }
      
      // Validate email
      if (!prospect.email || !validateEmail(prospect.email)) {
        results.skipped++;
        console.log(`Skipping invalid email: ${prospect.email}`);
        continue;
      }
      
      console.log(`Sending email to ${prospect.email}`);
      
      // Prepare email content with a rotating sender
      const senderEmail = getNextSenderEmail();
      const message = {
        subject: CONFIG.DEFAULT_SUBJECT,
        html: generateEmailHTML(prospect),
        senderEmail: senderEmail
      };
      
      // Send email with next provider in rotation
      const { provider, keyId } = await sendEmailWithNextProvider(prospect.email, message);
      
      // Update counters and results
      counters.hourly++;
      results.success++;
      results.byProvider[provider]++;
      
      // Track by key
      if (!results.byKey[provider][keyId]) {
        results.byKey[provider][keyId] = 0;
      }
      results.byKey[provider][keyId]++;
      
      console.log(`✓ Email successfully sent to ${prospect.email} via ${provider} (key: ${keyId})`);
      
      // Add small delay between emails to avoid bursts
      await new Promise(resolve => setTimeout(resolve, CONFIG.EMAIL_INTERVAL));
      
    } catch (error) {
      results.failed++;
      results.errors.push({ email: prospect.email, error: error.message });
      console.error(`✗ Failed to send to ${prospect.email}:`, error.message);
      
      // Add slightly longer delay after failures
      await new Promise(resolve => setTimeout(resolve, CONFIG.EMAIL_INTERVAL * 3));
    }
  }
  
  return results;
};

// Send email using the next provider in rotation
const sendEmailWithNextProvider = async (recipientEmail, message, retryCount = 0) => {
  const provider = selectNextProvider();
  
  if (!provider) {
    throw new Error('Daily quotas exceeded for all providers');
  }
  
  try {
    // Get next API key for this provider
    const apiKey = getNextApiKey(provider);
    if (!apiKey) {
      throw new Error(`No valid API key available for ${provider}`);
    }
    
    const keyId = apiKey.substring(0, 8); // Use first 8 chars as ID
    
    // Check if this key has reached its daily quota
    if (counters.keys[provider][keyId].count >= CONFIG.PROVIDERS[provider].dailyQuotaPerKey) {
      console.log(`API key ${keyId} for ${provider} has reached its daily quota. Trying another provider.`);
      return sendEmailWithNextProvider(recipientEmail, message, retryCount);
    }
    
    // Send using selected provider and key
    await CONFIG.PROVIDERS[provider].send(recipientEmail, message, apiKey);
    
    // Update daily counters
    counters.daily[provider].count++;
    counters.keys[provider][keyId].count++;
    
    // Return the provider and key used
    return { provider, keyId };
    
  } catch (error) {
    console.error(`Error with provider ${provider}:`, error.message);
    
    // Retry with next provider if available
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`Retrying with different provider for ${recipientEmail} (attempt ${retryCount + 1})`);
      // Force rotation to next provider on error
      counters.emailsSentSinceProviderRotation = CONFIG.PROVIDER_ROTATION_INTERVAL;
      return sendEmailWithNextProvider(recipientEmail, message, retryCount + 1);
    } else {
      throw new Error(`Failed to send after ${CONFIG.MAX_RETRIES} attempts: ${error.message}`);
    }
  }
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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Starting email campaign process');
      
      // Count available keys for each provider
      Object.keys(API_KEYS).forEach(provider => {
        console.log(`${provider}: ${API_KEYS[provider].length} API keys available`);
        
        // Update provider enabled status
        if (CONFIG.PROVIDERS[provider]) {
          CONFIG.PROVIDERS[provider].enabled = API_KEYS[provider].length > 0;
        }
      });
      
      // Initialize the first provider to use
      const availableProviders = Object.entries(CONFIG.PROVIDERS)
        .filter(([_, config]) => config.enabled)
        .map(([name]) => name);
        
      if (availableProviders.length === 0) {
        throw new Error('No email providers available. Check API keys.');
      }
      
      currentProvider = availableProviders[0];
      console.log(`Available providers: ${availableProviders.join(', ')}`);
      console.log(`Starting with provider: ${currentProvider}`);
      
      // Check if we need to resume a previous campaign
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', 'current_campaign')
        .single();
        
      let startIndex = 0;
      if (campaign && campaign.progress < campaign.total) {
        startIndex = campaign.progress;
        console.log(`Resuming campaign from index ${startIndex}`);
      }
      
      // Create a new campaign if requested or if first run
      if (!campaign || req.body.newCampaign) {
        // Reset the campaign in the database
        await supabase
          .from('email_campaigns')
          .upsert({
            id: 'current_campaign',
            progress: 0,
            total: 0,
            last_run: new Date().toISOString(),
            status: 'starting'
          });
          
        startIndex = 0;
        console.log('Starting new campaign');
      }
      
      // Fetch prospects from Supabase with pagination
      console.log('Fetching prospects from Supabase...');
      const fetchSize = 10000;
      const { data: allProspects, error } = await supabase
        .from('prospect')
        .select('prenom, nom, email')
        .range(startIndex, startIndex + fetchSize - 1); // Fetch in chunks to avoid memory issues
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`${allProspects.length} prospects retrieved`);
      
      // For testing, limit number of prospects
      const prospects = CONFIG.TEST_MODE 
        ? allProspects.slice(0, 20)  // Just 20 for testing
        : allProspects;
        
      if (CONFIG.TEST_MODE) {
        console.log('Running in TEST MODE with limited prospects');
      }
      
      // Calculate and log theoretical sending capacity
      const totalApiKeys = Object.values(API_KEYS).flat().length;
      const totalDailyCapacity = Object.values(CONFIG.PROVIDERS)
        .filter(p => p.enabled)
        .reduce((sum, p) => sum + p.dailyQuota, 0);
        
      console.log(`Total API keys available: ${totalApiKeys}`);
      console.log(`Theoretical daily sending capacity: ${totalDailyCapacity} emails`);
      
      // Process email sending
      const results = await sendEmailsInBatches(prospects);
  
      
      // Log final results
      console.log('Campaign completed!');
      console.log(`Total sent: ${results.totalSent}`);
      console.log(`Total failed: ${results.totalFailed}`);
      console.log(`Total skipped: ${results.totalSkipped}`);
      console.log('By provider:', results.byProvider);
      console.log('By API key:', results.byKey);
      
      res.status(200).json({ 
        message: 'Email campaign completed.',
        results
      });
      
    } catch (error) {
      console.error('Error sending newsletter:', error);      
      res.status(500).json({ 
        error: `Error sending newsletter: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}