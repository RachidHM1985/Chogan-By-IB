import { EMAIL_CONFIG } from '../config/emails';

const monitorProviderStatus = () => {
  const providers = EMAIL_CONFIG.PROVIDERS;
  
  for (const provider in providers) {
    if (!providers[provider].apiKey || !providers[provider].isActive) {
      console.error(`Provider ${provider} is not available or missing API key.`);
      return false;
    }
  }
  
  return true;
};

export const sendEmailsToBatch = async (batch) => {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    byProvider: {},
    byKey: {},
    errors: []
  };

  // Initialisation des compteurs des fournisseurs
  Object.keys(EMAIL_CONFIG.PROVIDERS).forEach(provider => {
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
      if (counters.hourly >= EMAIL_CONFIG.HOURLY_LIMIT) {
        console.log(`Hourly limit reached (${EMAIL_CONFIG.HOURLY_LIMIT}). Pausing...`);
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
        subject: EMAIL_CONFIG.DEFAULT_SUBJECT,
        html: generateEmailHTML(prospect),
        senderEmail: senderEmail,
        senderName: EMAIL_CONFIG.SENDER_NAME
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
      await new Promise(resolve => setTimeout(resolve, EMAIL_CONFIG.EMAIL_INTERVAL));

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
      await new Promise(resolve => setTimeout(resolve, EMAIL_CONFIG.EMAIL_INTERVAL * 3));
    }
  }

  return results;
};
