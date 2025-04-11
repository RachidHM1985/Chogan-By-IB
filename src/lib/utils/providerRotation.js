// lib/utils/providerRotation.js
import { emailConfig } from '../../config/emails';

// Compteurs d'utilisation des fournisseurs
const usageCounters = {
  lastReset: Date.now(),
  providers: {}
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

/**
 * Sélectionne le meilleur fournisseur d'email basé sur les limites actuelles
 * @param {number} emailsToSend - Nombre d'emails à envoyer
 * @returns {Object} - Informations sur le fournisseur sélectionné
 */
export async function selectBestProvider(emailsToSend) {
  // Initialiser les compteurs si nécessaire
  initializeCounters();
  
  // Vérifier et réinitialiser les compteurs si nécessaire
  checkAndResetHourlyCounters();
  if (emailConfig.rotation.resetCountersAtMidnight) {
    checkAndResetDailyCounters();
  }
  
  const availableProviders = [];
  
  // Parcourir tous les fournisseurs et comptes pour vérifier leur disponibilité
  Object.keys(emailConfig.providers).forEach(providerName => {
    const provider = emailConfig.providers[providerName];
    
    provider.accounts.forEach(account => {
      const counter = usageCounters.providers[providerName][account.id];
      
      // Vérifier si ce compte a suffisamment de quota disponible
      const remainingHourlyCapacity = account.hourlyLimit - counter.hourlyCount;
      const remainingDailyCapacity = account.dailyLimit - counter.dailyCount;
      const availableCapacity = Math.min(remainingHourlyCapacity, remainingDailyCapacity);
      
      if (availableCapacity >= emailsToSend) {
        availableProviders.push({
          providerName,
          accountId: account.id,
          apiKey: account.apiKey,
          secretKey: account.secretKey, // Pour Mailjet qui nécessite deux clés
          availableCapacity,
          // Calculer un score de priorité basé sur le pourcentage de capacité restante
          // Cela favorise les comptes avec plus de quota disponible
          priorityScore: availableCapacity / Math.max(account.hourlyLimit, account.dailyLimit)
        });
      }
    });
  });
  
  // Si aucun fournisseur n'a suffisamment de capacité, prendre celui avec le plus de capacité
  if (availableProviders.length === 0) {
    let bestProvider = null;
    let bestCapacity = 0;
    
    Object.keys(emailConfig.providers).forEach(providerName => {
      const provider = emailConfig.providers[providerName];
      
      provider.accounts.forEach(account => {
        const counter = usageCounters.providers[providerName][account.id];
        
        const remainingHourlyCapacity = account.hourlyLimit - counter.hourlyCount;
        const remainingDailyCapacity = account.dailyLimit - counter.dailyCount;
        const availableCapacity = Math.min(remainingHourlyCapacity, remainingDailyCapacity);
        
        if (availableCapacity > bestCapacity) {
          bestCapacity = availableCapacity;
          bestProvider = {
            providerName,
            accountId: account.id,
            apiKey: account.apiKey,
            secretKey: account.secretKey,
            availableCapacity,
            priorityScore: 1
          };
        }
      });
    });
    
    if (bestProvider) {
      return bestProvider;
    }
    
    // Si vraiment aucune capacité, attendre et réessayer plus tard
    throw new Error('Tous les fournisseurs ont atteint leurs limites');
  }
  
  // Trier les fournisseurs par score de priorité
  availableProviders.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Sélectionner le fournisseur avec le meilleur score
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