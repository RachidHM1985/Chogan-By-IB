
// lib/utils/providerRotation.js
import { emailConfig } from '../../config/emails';
import { inngest, EVENTS } from '../../inngest/client';

// Compteurs d'utilisation des fournisseurs
const usageCounters = {
  lastReset: Date.now(),
  providers: {}
};

// Suivi des erreurs des fournisseurs (pour exclusion temporaire)
const providerErrors = {
  providers: {}
};

// Quotas simulés par provider
const providerQuotas = {
  sendgrid: { remainingQuota: 100 },
  brevo:   { remainingQuota: 300 }
};
/*const providerQuotas = {
  sendgrid: { remainingQuota: 100 },
  brevo:   { remainingQuota: 300 },
  mailjet: { remainingQuota: 200 }
};*/

// Initialisation des compteurs et erreurs pour tous les accounts
function initializeCounters() {
  if (Object.keys(usageCounters.providers).length > 0) return;
  Object.keys(emailConfig.providers).forEach(providerName => {
    usageCounters.providers[providerName] = {};
    providerErrors.providers[providerName] = {};
    emailConfig.providers[providerName].accounts.forEach(account => {
      usageCounters.providers[providerName][account.id] = {
        dailyCount: 0,
        hourlyCount: 0,
        lastHourlyReset: Date.now()
      };
      providerErrors.providers[providerName][account.id] = {
        errorType: null,
        lastErrorTime: null,
        errorCount: 0
      };
    });
  });
}

function checkAndResetHourlyCounters() {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  Object.values(usageCounters.providers).forEach(accounts => {
    Object.values(accounts).forEach(counter => {
      if (now - counter.lastHourlyReset > ONE_HOUR) {
        counter.hourlyCount = 0;
        counter.lastHourlyReset = now;
      }
    });
  });
}

function checkAndResetDailyCounters() {
  const now = new Date();
  const last = new Date(usageCounters.lastReset);
  if (now.toDateString() !== last.toDateString()) {
    Object.values(usageCounters.providers).forEach(accounts => {
      Object.values(accounts).forEach(counter => counter.dailyCount = 0);
    });
    usageCounters.lastReset = now.getTime();
  }
}

function checkAndResetProviderErrors() {
  const now = Date.now();
  const RESET_TIMES = {
    auth_error:   24 * 60 * 60 * 1000,
    rate_limit:   60 * 60 * 1000,
    server_error: 15 * 60 * 1000
  };
  Object.values(providerErrors.providers).forEach(accounts => {
    Object.values(accounts).forEach(err => {
      if (err.errorType && (now - err.lastErrorTime) > (RESET_TIMES[err.errorType] || RESET_TIMES.auth_error)) {
        err.errorType = null;
        err.lastErrorTime = null;
        err.errorCount = 0;
      }
    });
  });
}

/**
 * Marque un provider comme en erreur pour exclusion temporaire
 * @param {string} providerName
 * @param {string} accountId
 * @param {'auth_error'|'rate_limit'|'server_error'} errorType
 */
export function markProviderAsErrored(providerName, accountId, errorType) {
  initializeCounters();
  const err = providerErrors.providers[providerName]?.[accountId];
  if (!err) return;
  err.errorType = errorType;
  err.lastErrorTime = Date.now();
  err.errorCount += 1;

  // Cas spécifique pour Mailjet
  if (providerName === 'mailjet' && errorType === 'rate_limit') {
    // Bloquer temporairement ce compte Mailjet
    console.error(`❌ Compte Mailjet bloqué temporairement: ${providerName}:${accountId}`);
    inngest.send({
      name: EVENTS.EMAIL_PROVIDER_ERROR,
      data: { providerName, accountId, errorType, timestamp: new Date().toISOString() }
    }).catch(console.error);
  }
  
  // Alerter si plusieurs erreurs d'auth pour tous les providers
  if (errorType === 'auth_error' && err.errorCount >= 3) {
    console.error(`❌ Auth error persistant: ${providerName}:${accountId}`);
    inngest.send({
      name: EVENTS.EMAIL_PROVIDER_ERROR,
      data: { providerName, accountId, errorType, timestamp: new Date().toISOString() }
    }).catch(console.error);
  }
}

/**
 * Sélectionne le meilleur provider non exclu et sans erreur
 * @param {Object} options
 * @param {Object} options.logger
 * @param {string[]} options.excludedProviders - providerKey à exclure pour ce batch
 * @returns {Object|null}
 */
export async function selectBestProvider({ logger, excludedProviders = [] }) {
  initializeCounters();
  checkAndResetHourlyCounters();
  if (emailConfig.rotation.resetCountersAtMidnight) checkAndResetDailyCounters();
  checkAndResetProviderErrors();

  const usageState = getProvidersUsageState();
  const candidates = [];

  Object.entries(emailConfig.providers).forEach(([providerName, cfg]) => {
    cfg.accounts.forEach(account => {
      const key = `${providerName}-${account.id}`;
      // Exclure si présent dans la liste
      if (excludedProviders.includes(key)) {
        logger?.debug?.(`⏭️ Exclu (batch) : ${key}`);
        return;
      }
      // Exclure si erreur persistante ou bloqué (ex: Mailjet)
      const err = providerErrors.providers[providerName]?.[account.id];
      if (err?.errorType) {
        logger?.debug?.(`⏭️ En erreur : ${key} (${err.errorType})`);
        return;
      }
      // Vérifier clés API
      if (!account.apiKey || (providerName === 'mailjet' && !account.secretKey)) {
        logger?.warn?.(`⚠️ Clé manquante : ${key}`);
        return;
      }
      // Vérifier quotas
      const u = usageState[providerName]?.[account.id];
      if (!u || u.hourlyRemaining <= 0 || u.dailyRemaining <= 0) return;
      // Calcul du score
      const score = (u.hourlyRemaining / account.hourlyLimit) * 100
                  + (u.dailyRemaining  / account.dailyLimit)  * 50;
      candidates.push({ providerName, accountId: account.id, apiKey: account.apiKey, secretKey: account.secretKey, score });
    });
  });

  if (!candidates.length) {
    logger?.warn('⚠️ Aucun provider disponible');
    await inngest.send({ name: EVENTS.EMAIL_LIMIT_REACHED, data: { excludedProviders, timestamp: new Date().toISOString() } }).catch(console.error);
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

/**
 * Met à jour l'utilisation d'un provider
 */
export function updateProviderUsage(providerName, accountId, sentCount) {
  const counter = usageCounters.providers[providerName]?.[accountId];
  if (!counter) return;
  counter.hourlyCount += sentCount;
  counter.dailyCount  += sentCount;
  if (providerQuotas[providerName]) {
    providerQuotas[providerName].remainingQuota = Math.max(0, providerQuotas[providerName].remainingQuota - sentCount);
  }
}

/**
 * Retourne l'état d'utilisation actuel
 */
export function getProvidersUsageState() {
  initializeCounters();
  checkAndResetHourlyCounters();
  if (emailConfig.rotation.resetCountersAtMidnight) checkAndResetDailyCounters();
  const state = {};
  Object.entries(usageCounters.providers).forEach(([providerName, accounts]) => {
    state[providerName] = {};
    Object.entries(accounts).forEach(([id, c]) => {
      const cfg = emailConfig.providers[providerName].accounts.find(a => a.id === id);
      state[providerName][id] = {
        hourlyUsage:   c.hourlyCount,
        dailyUsage:    c.dailyCount,
        hourlyRemaining: cfg.hourlyLimit - c.hourlyCount,
        dailyRemaining:  cfg.dailyLimit  - c.dailyCount
      };
    });
  });
  return state;
}

/**
 * Retourne l'état des erreurs actuel
 */
export function getProvidersErrorState() {
  initializeCounters();
  checkAndResetProviderErrors();
  const state = {};
  Object.entries(providerErrors.providers).forEach(([providerName, accounts]) => {
    state[providerName] = {};
    Object.entries(accounts).forEach(([id, err]) => {
      state[providerName][id] = {
        hasError:  !!err.errorType,
        errorType: err.errorType,
        errorCount: err.errorCount,
        lastErrorTime: err.lastErrorTime
      };
    });
  });
  return state;
}
