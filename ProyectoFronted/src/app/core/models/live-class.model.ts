// ==========================================================================
// LIVE CLASS MODEL
// Modelo para las clases en vivo programadas por profesores
// ==========================================================================

/**
 * Estado de una clase en vivo
 */
export enum LiveClassStatus {
  SCHEDULED = 'SCHEDULED',   // Programada (futura)
  LIVE = 'LIVE',             // En vivo ahora
  COMPLETED = 'COMPLETED',   // Finalizada
  CANCELLED = 'CANCELLED'    // Cancelada
}

/**
 * Interface principal de Clase en Vivo
 */
export interface LiveClass {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  
  // Detalles de la clase
  title: string;
  description?: string;
  
  // Fecha y hora
  scheduledDate: Date;
  startTime: string; // Formato: "HH:mm" (ej: "14:30")
  duration: number; // En minutos
  endTime?: string; // Calculado automáticamente
  
  // Plataforma de videollamada
  platform: VideoPlatform;
  meetingUrl: string;
  meetingId?: string;
  meetingPassword?: string;
  
  // Estado y estadísticas
  status: LiveClassStatus;
  attendees: string[]; // IDs de estudiantes que asistieron
  maxAttendees?: number; // Límite de participantes (opcional)
  
  // Grabación (si está disponible)
  recordingUrl?: string;
  recordingAvailableUntil?: Date;
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plataformas de videollamada soportadas
 */
export enum VideoPlatform {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  MICROSOFT_TEAMS = 'MICROSOFT_TEAMS',
  CUSTOM = 'CUSTOM'
}

/**
 * DTO para crear una clase en vivo
 */
export interface CreateLiveClassDto {
  courseId: string;
  title: string;
  description?: string;
  scheduledDate: Date | string;
  startTime: string;
  duration: number;
  platform: VideoPlatform;
  meetingUrl: string;
  meetingPassword?: string;
  maxAttendees?: number;
}

/**
 * DTO para actualizar una clase en vivo
 */
export interface UpdateLiveClassDto {
  title?: string;
  description?: string;
  scheduledDate?: Date | string;
  startTime?: string;
  duration?: number;
  meetingUrl?: string;
  meetingPassword?: string;
  maxAttendees?: number;
}

/**
 * Asistencia a una clase en vivo
 */
export interface LiveClassAttendance {
  liveClassId: string;
  studentId: string;
  studentName: string;
  joinedAt: Date;
  leftAt?: Date;
  attendanceDuration: number; // En minutos
  wasPresent: boolean; // Si estuvo al menos 80% del tiempo
}

/**
 * Filtros para buscar clases en vivo
 */
export interface LiveClassFilters {
  courseId?: string;
  teacherId?: string;
  status?: LiveClassStatus;
  startDate?: Date;
  endDate?: Date;
  platform?: VideoPlatform;
}

/**
 * Vista resumida de próximas clases (para dashboards)
 */
export interface UpcomingLiveClass {
  id: string;
  courseId: string;
  courseName: string;
  courseThumbnail?: string;
  teacherName: string;
  title: string;
  scheduledDate: Date;
  startTime: string;
  duration: number;
  meetingUrl: string;
  isEnrolled: boolean; // Si el estudiante está inscrito en el curso
  timeUntilStart?: number; // Minutos hasta que empiece
}