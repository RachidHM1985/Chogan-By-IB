import { CONFIG } from '../config/emailConfig';  // Adjust path as needed
import { sendEmailsToBatch } from './sendEmailsToBatches'; // Mets ici le chemin correct si c’est dans un autre fichier

// Supprime les doublons en se basant sur l'email (en minuscules et trim)
const deduplicateProspects = (prospects) => {
  const seen = new Set();
  return prospects.filter(p => {
    const email = p.email?.toLowerCase().trim();
    if (!email || seen.has(email)) return false;
    seen.add(email);
    return true;
  });
};

// Vérifie que l’email est bien au bon format
const validateEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Fonction principale : envoie les emails en lots avec délai entre chaque
export const sendEmailsInBatches = async (prospects) => {
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

  // Init des compteurs
  Object.keys(CONFIG.PROVIDERS).forEach(provider => {
    results.byProvider[provider] = 0;
    results.byKey[provider] = {};
  });

  // Traitement de chaque batch
  for (let i = 0; i < totalBatches; i++) {
    const batch = validProspects.slice(i * CONFIG.BATCH_SIZE, (i + 1) * CONFIG.BATCH_SIZE);
    console.log(`Sending batch ${i + 1} of ${totalBatches} (${batch.length} emails)`);

    const batchResults = await sendEmailsToBatch(batch);

    results.totalSent += batchResults.success;
    results.totalFailed += batchResults.failed;
    results.totalSkipped += batchResults.skipped;
    results.batches.push(batchResults);

    Object.keys(batchResults.byProvider).forEach(provider => {
      results.byProvider[provider] = (results.byProvider[provider] || 0) + batchResults.byProvider[provider];

      Object.keys(batchResults.byKey[provider] || {}).forEach(keyId => {
        if (!results.byKey[provider][keyId]) {
          results.byKey[provider][keyId] = 0;
        }
        results.byKey[provider][keyId] += batchResults.byKey[provider][keyId];
      });
    });

    console.log(`Batch ${i + 1} results:`, batchResults);

    if (i < totalBatches - 1) {
      console.log(`Waiting ${CONFIG.BATCH_INTERVAL / 1000 / 60} minutes before next batch...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_INTERVAL));
    }
  }

  return results;
};
