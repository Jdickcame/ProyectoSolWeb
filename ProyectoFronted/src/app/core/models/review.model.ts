// ==========================================================================
// REVIEW MODEL
// Modelo para las reseñas y calificaciones de cursos
// ==========================================================================

/**
 * Interface principal de Reseña
 */
export interface Review {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  
  // Calificación y contenido
  rating: number; // 1-5 estrellas
  comment: string;
  
  // Validación
  isVerifiedPurchase: boolean; // Si el estudiante realmente compró el curso
  
  // Interacciones
  helpfulCount: number; // Cuántos usuarios marcaron como útil
  reportedCount: number; // Cuántos usuarios reportaron como inapropiada
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
  
  // Respuesta del profesor (opcional)
  teacherResponse?: TeacherResponse;
}

/**
 * Respuesta del profesor a una reseña
 */
export interface TeacherResponse {
  teacherId: string;
  teacherName: string;
  response: string;
  createdAt: Date;
}

/**
 * DTO para crear una reseña
 */
export interface CreateReviewDto {
  courseId: string;
  rating: number; // 1-5
  comment: string;
}

/**
 * DTO para actualizar una reseña
 */
export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

/**
 * DTO para respuesta del profesor
 */
export interface CreateTeacherResponseDto {
  reviewId: string;
  response: string;
}

/**
 * Estadísticas de reseñas de un curso
 */
export interface ReviewStats {
  courseId: string;
  totalReviews: number;
  averageRating: number; // Promedio general
  ratingDistribution: RatingDistribution;
}

/**
 * Distribución de calificaciones (1-5 estrellas)
 */
export interface RatingDistribution {
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

/**
 * Filtros para buscar reseñas
 */
export interface ReviewFilters {
  courseId?: string;
  studentId?: string;
  minRating?: number;
  maxRating?: number;
  verifiedPurchaseOnly?: boolean;
  sortBy?: ReviewSortOption;
  page?: number;
  pageSize?: number;
}

/**
 * Opciones de ordenamiento de reseñas
 */
export enum ReviewSortOption {
  MOST_RECENT = 'MOST_RECENT',
  HIGHEST_RATED = 'HIGHEST_RATED',
  LOWEST_RATED = 'LOWEST_RATED',
  MOST_HELPFUL = 'MOST_HELPFUL'
}

/**
 * Respuesta paginada de reseñas
 */
export interface ReviewPaginatedResponse {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: ReviewStats;
}

/**
 * Acción de utilidad sobre una reseña
 */
export interface ReviewHelpfulness {
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: Date;
}