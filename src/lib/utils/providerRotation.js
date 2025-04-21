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

// Initialisation des compteurs et erreurs pour tous les accounts
function initializeCounters() {
  if (Object.keys(usageCounters.providers).length > 0) return;
  
  // Assurons-nous que emailConfig.providers existe et a des comptes
  if (!emailConfig.providers || Object.keys(emailConfig.providers).length === 0) {
    console.error("⚠️ Configuration des providers manquante ou vide");
    return;
  }

  Object.keys(emailConfig.providers).forEach(providerName => {
    usageCounters.providers[providerName] = {};
    providerErrors.providers[providerName] = {};
    
    if (!emailConfig.providers[providerName].accounts || !Array.isArray(emailConfig.providers[providerName].accounts)) {
      console.error(`⚠️ Configuration incorrecte pour le provider ${providerName}`);
      return;
    }

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

  console.log(`✅ Compteurs initialisés pour ${Object.keys(usageCounters.providers).length} providers`);
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
    console.log(`✅ Réinitialisation des compteurs quotidiens: ${now.toISOString()}`);
  }
}

function checkAndResetProviderErrors() {
  const now = Date.now();
  const RESET_TIMES = {
    auth_error:   24 * 60 * 60 * 1000,  // 24h pour les erreurs d'authentification
    rate_limit:   60 * 60 * 1000,       // 1h pour les limites de débit
    server_error: 15 * 60 * 1000        // 15min pour les erreurs serveur
  };
  
  Object.entries(providerErrors.providers).forEach(([providerName, accounts]) => {
    Object.entries(accounts).forEach(([accountId, err]) => {
      if (err.errorType && (now - err.lastErrorTime) > (RESET_TIMES[err.errorType] || RESET_TIMES.auth_error)) {
        console.log(`🔄 Réinitialisation de l'erreur pour ${providerName}:${accountId} (${err.errorType}, après ${Math.round((now - err.lastErrorTime) / (60*1000))}min)`);
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
  
  // Validation des entrées
  if (!providerName || !accountId || !errorType) {
    console.error(`❌ Paramètres invalides dans markProviderAsErrored: ${providerName}, ${accountId}, ${errorType}`);
    return;
  }
  
  // Vérification que le provider et l'account existent
  if (!providerErrors.providers[providerName]) {
    console.error(`❌ Provider inconnu dans markProviderAsErrored: ${providerName}`);
    return;
  }
  
  const err = providerErrors.providers[providerName][accountId];
  if (!err) {
    console.error(`❌ Account inconnu dans markProviderAsErrored: ${providerName}:${accountId}`);
    return;
  }

  // Mise à jour de l'état d'erreur
  err.errorType = errorType;
  err.lastErrorTime = Date.now();
  err.errorCount += 1;

  console.log(`⛔ Provider marqué en erreur: ${providerName}:${accountId} (${errorType}, occurence #${err.errorCount})`);
  
  // Alerter si plusieurs erreurs d'auth pour tous les providers
  if (errorType === 'auth_error') {
    console.error(`❌ Auth error sur ${providerName}:${accountId} (occurence #${err.errorCount})`);
    
    // Pour les erreurs d'authentification, on envoie toujours un événement, mais on log différemment selon la gravité
    if (err.errorCount >= 3) {
      console.error(`🚨 Auth error persistant: ${providerName}:${accountId}`);
    }
    
    inngest.send({
      name: EVENTS.EMAIL_PROVIDER_ERROR,
      data: { providerName, accountId, errorType, errorCount: err.errorCount, timestamp: new Date().toISOString() }
    }).catch(console.error);
  }
  
  // Debug: afficher l'état des erreurs après modification
  console.log(`État des erreurs pour ${providerName}:${accountId}:`, JSON.stringify(err));
}

/**
 * Sélectionne le meilleur provider non exclu et sans erreur
 * @param {Object} options
 * @param {Object} options.logger
 * @param {string[]} options.excludedProviders - providerKey à exclure pour ce batch
 * @returns {Object|null}
 */
export async function selectBestProvider({ emailCount = 1, logger, excludeProviders = [] }) {
  logger?.debug(`[PROVIDER] Début selection, ${excludeProviders.length} providers exclus: ${excludeProviders.join(', ')}`);
  initializeCounters();
  checkAndResetHourlyCounters();
  if (emailConfig.rotation.resetCountersAtMidnight) checkAndResetDailyCounters();
  checkAndResetProviderErrors();

  const usageState = getProvidersUsageState();
  const errorState = getProvidersErrorState();  // Récupérer aussi l'état des erreurs pour le debug
  const candidates = [];
  const excluded = [];  // Pour tracer les providers exclus et la raison

  Object.entries(emailConfig.providers).forEach(([providerName, cfg]) => {
    cfg.accounts.forEach(account => {
      const key = `${providerName}-${account.id}`;
  
      
      // Exclure si erreur persistante ou bloqué 
      const err = providerErrors.providers[providerName]?.[account.id];
      if (err?.errorType) {
        excluded.push({ 
          key, 
          reason: 'error', 
          errorType: err.errorType, 
          since: new Date(err.lastErrorTime).toISOString(),
          count: err.errorCount 
        });
        logger?.debug?.(`⏭️ En erreur : ${key} (${err.errorType}, depuis ${new Date(err.lastErrorTime).toISOString()}, #${err.errorCount})`);
        return;
      }
      
      // Vérifier clés API
      if (!account.apiKey) {
        excluded.push({ key, reason: 'noApiKey' });
        logger?.warn?.(`⚠️ Clé manquante : ${key}`);
        return;
      }
      
      // Vérifier quotas
      const u = usageState[providerName]?.[account.id];
      if (!u) {
        excluded.push({ key, reason: 'noUsageState' });
        logger?.warn?.(`⚠️ État d'utilisation manquant : ${key}`);
        return;
      }
      
      if (u.hourlyRemaining < emailCount) {
        excluded.push({ key, reason: 'hourlyLimitReached', usage: u.hourlyUsage, limit: u.hourlyLimit });
        logger?.debug?.(`⏭️ Limite horaire insuffisante : ${key} (${u.hourlyUsage}/${u.hourlyLimit}, besoin: ${emailCount})`);
        return;
      }
      
      if (u.dailyRemaining < emailCount) {
        excluded.push({ key, reason: 'dailyLimitReached', usage: u.dailyUsage, limit: u.dailyLimit });
        logger?.debug?.(`⏭️ Limite quotidienne insuffisante : ${key} (${u.dailyUsage}/${u.dailyLimit}, besoin: ${emailCount})`);
        return;
      }
      
      // Calcul du score
      const score = (u.hourlyRemaining / account.hourlyLimit) * 100
                  + (u.dailyRemaining  / account.dailyLimit)  * 50;
      candidates.push({ 
        providerName, 
        accountId: account.id, 
        apiKey: account.apiKey, 
        secretKey: account.secretKey, 
        score,
        // Informations additionnelles pour le debug
        hourlyUsage: u.hourlyUsage,
        hourlyLimit: account.hourlyLimit,
        dailyUsage: u.dailyUsage,
        dailyLimit: account.dailyLimit
      });
    });
  });

  // Log détaillé pour le debug
  logger?.debug?.(`📊 État des providers:
    Candidats: ${candidates.length} 
    Exclus: ${excluded.length}
    Détail candidats: ${JSON.stringify(candidates.map(c => ({ 
      key: `${c.providerName}-${c.accountId}`, 
      score: c.score,
      hourly: `${c.hourlyUsage}/${c.hourlyLimit}`,
      daily: `${c.dailyUsage}/${c.dailyLimit}`
    })))}
    Détail exclus: ${JSON.stringify(excluded)}
    État erreurs: ${JSON.stringify(errorState)}
  `);

  if (!candidates.length) {
    logger?.warn('⚠️ Aucun provider disponible');
    await inngest.send({ 
      name: EVENTS.EMAIL_LIMIT_REACHED, 
      data: { 
        excludeProviders, 
        excluded: excluded.map(e => e.key),
        timestamp: new Date().toISOString() 
      } 
    }).catch(console.error);
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates[0];
  
  logger?.debug(`[PROVIDER] Selection: ${selected.providerName}-${selected.accountId} (score ${selected.score.toFixed(2)}), candidats: ${candidates.length}`);
  return selected;
}

/**
 * Met à jour l'utilisation d'un provider
 */
export function updateProviderUsage(providerName, accountId, sentCount) {
  if (!providerName || !accountId || typeof sentCount !== 'number' || sentCount <= 0) {
    console.error(`❌ Paramètres invalides dans updateProviderUsage: ${providerName}, ${accountId}, ${sentCount}`);
    return;
  }

  initializeCounters();
  const counter = usageCounters.providers[providerName]?.[accountId];
  if (!counter) {
    console.error(`❌ Counter non trouvé pour ${providerName}:${accountId}`);
    return;
  }
  
  counter.hourlyCount += sentCount;
  counter.dailyCount  += sentCount;
  
  if (providerQuotas[providerName]) {
    providerQuotas[providerName].remainingQuota = Math.max(0, providerQuotas[providerName].remainingQuota - sentCount);
  }
  
  console.log(`📈 Usage mis à jour pour ${providerName}:${accountId}: hourly=${counter.hourlyCount}, daily=${counter.dailyCount}, sent=+${sentCount}`);
  
  // Vérifier si on approche des limites pour alerter
  const cfg = emailConfig.providers[providerName]?.accounts.find(a => a.id === accountId);
  if (cfg) {
    const hourlyPct = (counter.hourlyCount / cfg.hourlyLimit) * 100;
    const dailyPct = (counter.dailyCount / cfg.dailyLimit) * 100;
    
    if (hourlyPct >= 90 || dailyPct >= 90) {
      console.warn(`⚠️ Provider proche des limites: ${providerName}:${accountId} (${Math.round(hourlyPct)}% hourly, ${Math.round(dailyPct)}% daily)`);
    }
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
      if (!cfg) {
        console.error(`❌ Configuration non trouvée pour ${providerName}:${id}`);
        return;
      }
      
      state[providerName][id] = {
        hourlyUsage:      c.hourlyCount,
        dailyUsage:       c.dailyCount,
        hourlyLimit:      cfg.hourlyLimit,
        dailyLimit:       cfg.dailyLimit,
        hourlyRemaining:  cfg.hourlyLimit - c.hourlyCount,
        dailyRemaining:   cfg.dailyLimit  - c.dailyCount
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
        hasError:      !!err.errorType,
        errorType:     err.errorType,
        errorCount:    err.errorCount,
        lastErrorTime: err.lastErrorTime,
        // Information supplémentaire pour faciliter le debug
        timeElapsed:   err.lastErrorTime ? Math.round((Date.now() - err.lastErrorTime) / (60 * 1000)) + ' min' : null
      };
    });
  });
  return state;
}

/**
 * Fonction utilitaire pour forcer un provider en erreur (pour tests)
 */
export function _forceProviderError(providerName, accountId, errorType) {
  markProviderAsErrored(providerName, accountId, errorType);
  return getProvidersErrorState();
}

/**
 * Fonction utilitaire pour réinitialiser un provider en erreur (pour tests)
 */
export function _resetProviderError(providerName, accountId) {
  initializeCounters();
  const err = providerErrors.providers[providerName]?.[accountId];
  if (err) {
    err.errorType = null;
    err.lastErrorTime = null;
    err.errorCount = 0;
    console.log(`🔄 Erreur réinitialisée manuellement pour ${providerName}:${accountId}`);
  }
  return getProvidersErrorState();
}