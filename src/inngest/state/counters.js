// src/inngest/state/counters.js
const counters = {
  daily: {
    sendgrid: { count: 0 },
    brevo: { count: 0 },
    mailjet: { count: 0 }
  }
};

// Limites quotidiennes par fournisseur
const DAILY_LIMITS = {
  sendgrid: 100, // Exemple de limite
  brevo: 300,
  mailjet: 200
};

// Incrémenter le compteur pour un provider
export function incrementCounter(provider) {
  if (!counters.daily[provider]) {
    counters.daily[provider] = { count: 0 };
  }
  counters.daily[provider].count += 1;
}

// Obtenir tous les compteurs
export function getCounters() {
  return counters;
}

// Vérifier si un fournisseur a atteint sa limite
export function getRateLimitStatus(provider) {
  if (!counters.daily[provider]) {
    return { limited: false, remaining: DAILY_LIMITS[provider] || 0 };
  }
  
  const count = counters.daily[provider].count;
  const limit = DAILY_LIMITS[provider] || 0;
  const remaining = Math.max(0, limit - count);
  
  return {
    limited: count >= limit,
    remaining,
    count,
    limit
  };
}

// Mettre à jour le compteur de limite de taux
export function updateRateLimitCounter(provider, increment = 1) {
  if (!counters.daily[provider]) {
    counters.daily[provider] = { count: 0 };
  }
  
  counters.daily[provider].count += increment;
  return getRateLimitStatus(provider);
}

// Réinitialiser les compteurs (utile pour les tests ou réinitialisation quotidienne)
export function resetCounters() {
  Object.keys(counters.daily).forEach(provider => {
    counters.daily[provider].count = 0;
  });
}