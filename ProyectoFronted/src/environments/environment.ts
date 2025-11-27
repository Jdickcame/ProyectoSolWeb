// ==========================================================================
// ENVIRONMENT - PRODUCTION
// Configuración para el entorno de producción
// ==========================================================================

export const environment = {
  production: true,
  environmentName: 'production',
  
  // API Configuration
  apiUrl: 'https://api.educonect.com/api/v1', // Cambiar cuando tengas el dominio real
  apiTimeout: 30000,
  
  // Authentication
  tokenKey: 'educonect_auth_token',
  refreshTokenKey: 'educonect_refresh_token',
  tokenExpirationMinutes: 60,
  
  // Pagination defaults
  defaultPageSize: 12,
  maxPageSize: 100,
  
  // File upload
  maxFileSize: 10485760, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // Features flags
  features: {
    enableLiveClasses: true,
    enableCertificates: true,
    enableCoupons: true,
    enableReviews: true,
    enablePayments: true, // Activado en producción
  },
  
  // External services
  videoCallPlatforms: {
    zoom: {
      enabled: false, // Configurar cuando sea necesario
      apiKey: '',
    },
    googleMeet: {
      enabled: false,
    },
  },
  
  // Analytics
  analytics: {
    enabled: true,
    googleAnalyticsId: 'G-XXXXXXXXXX', // Reemplazar con tu ID real
  },
  
  // Logging
  logLevel: 'error', // Solo errores en producción
  enableConsoleLog: false,
};