// ==========================================================================
// COURSE MODEL
// Modelo de curso con todas las propiedades necesarias
// ==========================================================================

/**
 * Niveles de dificultad de un curso
 */
export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL_LEVELS = 'ALL_LEVELS'
}

/**
 * Estado de un curso
 */
export enum CourseStatus {
  DRAFT = 'DRAFT',           // Borrador (no publicado)
  PENDING = 'PENDING',       // Pendiente de aprobación
  PUBLISHED = 'PUBLISHED',   // Publicado y activo
  REJECTED = 'REJECTED',     // Rechazado por admin
  ARCHIVED = 'ARCHIVED'      // Archivado (no visible)
}

/**
 * Categorías de cursos
 */
export enum CourseCategory {
  PROGRAMMING = 'PROGRAMMING',
  DESIGN = 'DESIGN',
  BUSINESS = 'BUSINESS',
  MARKETING = 'MARKETING',
  LANGUAGES = 'LANGUAGES',
  DATA_SCIENCE = 'DATA_SCIENCE',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  MUSIC = 'MUSIC',
  OTHER = 'OTHER'
}

/**
 * Interface principal de Curso
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string; // Para tarjetas
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  
  // Detalles del curso
  category: CourseCategory;
  level: CourseLevel;
  language: string; // 'es', 'en', etc.
  price: number; // 0 para cursos gratuitos
  currency: string; // 'USD', 'PEN', etc.
  
  // Contenido
  thumbnail?: string;
  previewVideo?: string;
  syllabus: CourseSyllabus;
  learningObjectives: string[]; // "Lo que aprenderás"
  requirements: string[]; // Requisitos previos
  
  // Estadísticas
  enrolledStudents: number;
  rating: number; // Promedio 0-5
  totalReviews: number;
  totalDuration: number; // En minutos
  
  // Estado y fechas
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Features adicionales
  hasCertificate: boolean;
  hasLiveClasses: boolean;
  
  // Tags para búsqueda
  tags?: string[];
}

/**
 * Estructura del temario del curso
 */
export interface CourseSyllabus {
  sections: CourseSection[];
}

/**
 * Sección del curso (módulo)
 */
export interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

/**
 * Lección individual
 */
export interface CourseLesson {
  id: string;
  title: string;
  order: number;
  type: LessonType;
  content?: string; // Para lecciones de texto
  videoUrl?: string; // Para lecciones de video
  duration: number; // En minutos
  resources?: LessonResource[]; // Material descargable
  isPreview: boolean; // Si se puede ver sin comprar
}

/**
 * Tipo de lección
 */
export enum LessonType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  LIVE_CLASS = 'LIVE_CLASS'
}

/**
 * Recursos de una lección
 */
export interface LessonResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  size?: number; // En KB
}

/**
 * Tipos de recursos
 */
export enum ResourceType {
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  PRESENTATION = 'PRESENTATION',
  CODE = 'CODE',
  OTHER = 'OTHER'
}

/**
 * DTO para crear un curso
 */
export interface CreateCourseDto {
  title: string;
  description: string;
  shortDescription?: string;
  category: CourseCategory;
  level: CourseLevel;
  language: string;
  price: number;
  currency: string;
  thumbnail?: string;
  learningObjectives: string[];
  requirements: string[];
  hasCertificate: boolean;
  hasLiveClasses: boolean;
  tags?: string[];
}

/**
 * DTO para actualizar un curso
 */
export interface UpdateCourseDto {
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  price?: number;
  thumbnail?: string;
  learningObjectives?: string[];
  requirements?: string[];
  tags?: string[];
}

/**
 * Filtros para búsqueda de cursos
 */
export interface CourseFilters {
  category?: CourseCategory;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  language?: string;
  hasLiveClasses?: boolean;
  searchQuery?: string;
  sortBy?: CourseSortOption;
  page?: number;
  pageSize?: number;
}

/**
 * Opciones de ordenamiento
 */
export enum CourseSortOption {
  MOST_POPULAR = 'MOST_POPULAR',
  HIGHEST_RATED = 'HIGHEST_RATED',
  NEWEST = 'NEWEST',
  PRICE_LOW_TO_HIGH = 'PRICE_LOW_TO_HIGH',
  PRICE_HIGH_TO_LOW = 'PRICE_HIGH_TO_LOW'
}

/**
 * Respuesta paginada de cursos
 */
export interface CoursePaginatedResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Progreso del estudiante en un curso
 */
export interface CourseProgress {
  courseId: string;
  studentId: string;
  completedLessons: string[]; // IDs de lecciones completadas
  progressPercentage: number; // 0-100
  lastAccessedAt: Date;
  certificateEarned: boolean;
  certificateUrl?: string;
}