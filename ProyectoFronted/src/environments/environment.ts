export const environment = {
  production: true,
  environmentName: 'production',
  
  // API Configuration
  apiUrl: '/api', // URL del backend Spring Boot
  apiTimeout: 30000, // 30 segundos
  
  // Authentication
  tokenKey: 'educonect_auth_token',
  refreshTokenKey: 'educonect_refresh_token', 
  tokenExpirationMinutes: 60, // 1 hora
  
  // Pagination defaults
  defaultPageSize: 12,
  maxPageSize: 100,
  
  // File upload
  maxFileSize: 10485760, // 10MB en bytes
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // Features flags (para activar/desactivar funcionalidades)
  features: {
    enableLiveClasses: true,
    enableCertificates: true,
    enableCoupons: true,
    enableReviews: true,
    enablePayments: false, 
  },
  
  // External services
  videoCallPlatforms: {
    zoom: {
      enabled: false,
      apiKey: '',
    },
    googleMeet: {
      enabled: false,
    },
  },
  
  // Analytics (opcional)
  analytics: {
    enabled: false,
    googleAnalyticsId: '',
  },
  
  // Logging
  logLevel: 'error', // 'debug' | 'info' | 'warn' | 'error'
  enableConsoleLog: true,
};

