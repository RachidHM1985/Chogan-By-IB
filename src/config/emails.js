// config/emails.js
export const emailConfig = {
  // Paramètres par défaut
  defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
  defaultFromName: process.env.DEFAULT_FROM_NAME,
  defaultReplyTo: process.env.DEFAULT_REPLY_TO,
  
  // Configuration des fournisseurs et leurs limites
  providers: {
    sendgrid: {
      accounts: [
        { 
          id: 'sendgrid1',
          apiKey: process.env.SENDGRID_API_KEY_1,
          dailyLimit: 100, // Limite quotidienne typique pour compte gratuit
          hourlyLimit: 20  // Estimation de la limite horaire
        },
        { 
          id: 'sendgrid2',
          apiKey: process.env.SENDGRID_API_KEY_2,
          dailyLimit: 100,
          hourlyLimit: 20
        }
      ],
      defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
    },
    brevo: {
      accounts: [
        { 
          id: 'brevo1',
          apiKey: process.env.BREVO_API_KEY_1,
          dailyLimit: 300, // Limite quotidienne typique pour compte gratuit
          hourlyLimit: 50 // Estimation de la limite horaire
        },
        { 
          id: 'brevo2',
          apiKey: process.env.BREVO_API_KEY_2,
          dailyLimit: 300,
          hourlyLimit: 50
        }
      ],
      defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
    },
    mailjet: {
      accounts: [
        { 
          id: 'mailjet1',
          apiKey: process.env.MAILJET_API_KEY_1,
          secretKey: process.env.MAILJET_SECRET_KEY_1,
          dailyLimit: 200, // Limite quotidienne typique pour compte gratuit
          hourlyLimit: 70  // Estimation de la limite horaire
        },
        { 
          id: 'mailjet2',
          apiKey: process.env.MAILJET_API_KEY_2,
          secretKey: process.env.MAILJET_SECRET_KEY_2,
          dailyLimit: 200,
          hourlyLimit: 70
        },
        { 
          id: 'mailjet3',
          apiKey: process.env.MAILJET_API_KEY_3,
          secretKey: process.env.MAILJET_SECRET_KEY_3,
          dailyLimit: 200,
          hourlyLimit: 70
        }
      ],
      defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
    }
  },
  
  // Configuration de rotation des clés API
  rotation: {
    enabled: true,
    strategy: 'smart-balance', 
    resetCountersAtMidnight: true,
  },
  
  // Limites globales d'envoi
  globalLimits: {
    batchSize: parseInt(process.env.BATCH_SIZE) || 50,
    maxConcurrentBatches: parseInt(process.env.MAX_CONCURRENT_BATCHES) || 2
  }
};