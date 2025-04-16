// lib/utils/providerRotation.js
import { emailConfig } from '../../config/emails';
import { inngest, EVENTS } from '../../inngest/client';
// Compteurs d'utilisation des fournisseurs
const usageCounters = {
  lastReset: Date.now(),
  providers: {}
};

const providerQuotas = {
  sendgrid: { remainingQuota: 100 },
  brevo: { remainingQuota: 300 },
  mailjet: { remainingQuota: 200 },
};

// Initialisation des compteurs pour tous les fournisseurs
function initializeCounters() {
  if (Object.keys(usageCounters.providers).length > 0) return;
  
  Object.keys(emailConfig.providers).forEach(providerName => {
    const provider = emailConfig.providers[providerName];
    
    usageCounters.providers[providerName] = {};
    
    provider.accounts.forEach(account => {
      usageCounters.providers[providerName][account.id] = {
        dailyCount: 0,
        hourlyCount: 0,
        lastHourlyReset: Date.now()
      };
    });
  });
}

/**
 * Réinitialise les compteurs horaires si nécessaire
 */
function checkAndResetHourlyCounters() {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  Object.keys(usageCounters.providers).forEach(providerName => {
    Object.keys(usageCounters.providers[providerName]).forEach(accountId => {
      const counter = usageCounters.providers[providerName][accountId];
      
      if (now - counter.lastHourlyReset > ONE_HOUR) {
        counter.hourlyCount = 0;
        counter.lastHourlyReset = now;
      }
    });
  });
}

/**
 * Réinitialise les compteurs quotidiens à minuit
 */
function checkAndResetDailyCounters() {
  const now = new Date();
  const lastResetDate = new Date(usageCounters.lastReset);
  
  // Si nous sommes passés à un nouveau jour
  if (now.getDate() !== lastResetDate.getDate() || 
      now.getMonth() !== lastResetDate.getMonth() || 
      now.getFullYear() !== lastResetDate.getFullYear()) {
    
    Object.keys(usageCounters.providers).forEach(providerName => {
      Object.keys(usageCounters.providers[providerName]).forEach(accountId => {
        usageCounters.providers[providerName][accountId].dailyCount = 0;
      });
    });
    
    usageCounters.lastReset = now.getTime();
  }
}

// Fonction pour obtenir des informations sur un fournisseur d'email
async function getProviderInfo(providerName) {
  const providerInfo = providerQuotas[providerName];

  if (!providerInfo) {
    return {
      providerName,
      remainingQuota: 0,
    };
  }

  return {
    providerName,
    remainingQuota: providerInfo.remainingQuota,
  };
}

/**
 * Sélectionne le meilleur fournisseur d'email basé sur les limites actuelles
 * @param {Object} options - Options
 * @param {Object} options.logger - Logger
 * @returns {Object} - Informations sur le fournisseur sélectionné
 */
// lib/utils/providerRotation.js
export async function selectBestProvider({ logger }) {
  initializeCounters();
  checkAndResetHourlyCounters();
  checkAndResetDailyCounters();
  
  const availableProviders = [];
  const usageState = getProvidersUsageState();
  
  // Parcourir tous les fournisseurs configurés
  Object.keys(emailConfig.providers).forEach(providerName => {
    const providerConfig = emailConfig.providers[providerName];
    
    // Parcourir tous les comptes de ce fournisseur
    providerConfig.accounts.forEach(account => {
      // Vérifier si la clé API est définie
      if (!account.apiKey) {
        logger?.warn?.(`⚠️ Clé API manquante pour ${providerName}:${account.id}`);
        return; // Passer à l'itération suivante
      }
      
      // Pour Mailjet, vérifier aussi la clé secrète
      if (providerName === 'mailjet' && !account.secretKey) {
        logger?.warn?.(`⚠️ Clé secrète manquante pour ${providerName}:${account.id}`);
        return;
      }
      
      const accountUsage = usageState[providerName]?.[account.id];
      
      // Vérifier si le compte a encore de la capacité
      if (accountUsage && 
          accountUsage.hourlyRemaining > 0 && 
          accountUsage.dailyRemaining > 0) {
        
        // Ce compte est disponible, l'ajouter à la liste
        availableProviders.push({
          providerName,
          accountId: account.id,
          apiKey: account.apiKey,
          secretKey: account.secretKey, // Pour Mailjet
          hourlyRemaining: accountUsage.hourlyRemaining,
          dailyRemaining: accountUsage.dailyRemaining,
          // Score pour déterminer le meilleur fournisseur
          score: (accountUsage.hourlyRemaining / account.hourlyLimit) * 100 +
                 (accountUsage.dailyRemaining / account.dailyLimit) * 50
        });
      }
    });
  });

  // Trier les fournisseurs disponibles par score (du plus haut au plus bas)
  availableProviders.sort((a, b) => b.score - a.score);

  // Si aucun fournisseur disponible
  if (availableProviders.length === 0) {
    logger?.warn?.('⚠️ Tous les fournisseurs ont atteint leurs limites');

    // Si inngest est défini, envoyer un événement
    if (typeof inngest !== 'undefined') {
      await inngest.send({
        name: EVENTS.EMAIL_LIMIT_REACHED,
        data: {
          message: "Tous les fournisseurs ont atteint leurs limites d'envoi.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    return null;
  }

  // Retourne le meilleur fournisseur
  return availableProviders[0];
}

/**
 * Met à jour les compteurs d'utilisation pour un fournisseur
 * @param {string} providerName - Nom du fournisseur
 * @param {string} accountId - ID du compte
 * @param {number} sentCount - Nombre d'emails envoyés
 */
export function updateProviderUsage(providerName, accountId, sentCount) {
  if (!usageCounters.providers[providerName] || 
      !usageCounters.providers[providerName][accountId]) {
    return;
  }
  
  const counter = usageCounters.providers[providerName][accountId];
  counter.hourlyCount += sentCount;
  counter.dailyCount += sentCount;
  
  // Mettre à jour également le quota restant du fournisseur
  if (providerQuotas[providerName]) {
    providerQuotas[providerName].remainingQuota -= sentCount;
    if (providerQuotas[providerName].remainingQuota < 0) {
      providerQuotas[providerName].remainingQuota = 0;
    }
  }
  
  // Vérifier si les compteurs dépassent les limites (pour la sécurité)
  const account = emailConfig.providers[providerName].accounts.find(a => a.id === accountId);
  
  if (counter.hourlyCount > account.hourlyLimit) {
    console.warn(`Le compteur horaire pour ${providerName}:${accountId} dépasse la limite définie!`);
  }
  
  if (counter.dailyCount > account.dailyLimit) {
    console.warn(`Le compteur quotidien pour ${providerName}:${accountId} dépasse la limite définie!`);
  }
}

/**
 * Obtient l'état actuel d'utilisation de tous les fournisseurs
 * @returns {Object} - État actuel des compteurs
 */
export function getProvidersUsageState() {
  initializeCounters();
  checkAndResetHourlyCounters();
  if (emailConfig.rotation.resetCountersAtMidnight) {
    checkAndResetDailyCounters();
  }
  
  const state = {};
  
  Object.keys(usageCounters.providers).forEach(providerName => {
    state[providerName] = {};
    
    Object.keys(usageCounters.providers[providerName]).forEach(accountId => {
      const counter = usageCounters.providers[providerName][accountId];
      const account = emailConfig.providers[providerName].accounts.find(a => a.id === accountId);
      
      state[providerName][accountId] = {
        hourlyUsage: counter.hourlyCount,
        dailyUsage: counter.dailyCount,
        hourlyLimit: account.hourlyLimit,
        dailyLimit: account.dailyLimit,
        hourlyRemaining: account.hourlyLimit - counter.hourlyCount,
        dailyRemaining: account.dailyLimit - counter.dailyCount
      };
    });
  });
  
  return state;
}