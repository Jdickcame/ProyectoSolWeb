// ==========================================================================
// USER MODEL
// Modelo de usuario que soporta los 3 roles: Estudiante, Profesor, Admin
// ==========================================================================

/**
 * Enumeración de roles de usuario
 */
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

/**
 * Interface base para todos los usuarios
 */
export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  biography?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para estudiante (extiende User)
 */
export interface Student extends User {
  role: UserRole.STUDENT;
  enrolledCourses: string[]; // IDs de cursos inscritos
  completedCourses: string[]; // IDs de cursos completados
  certificatesEarned: number;
  totalSpent: number;
}

/**
 * Interface para profesor (extiende User)
 */
export interface Teacher extends User {
  role: UserRole.TEACHER;
  coursesCreated: string[]; // IDs de cursos creados
  totalStudents: number;
  totalRevenue: number;
  rating: number; // Promedio de calificación (0-5)
  totalReviews: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  expertise?: string[]; // Áreas de expertise
  isVerified: boolean; // Si el profesor está verificado por admin
}

/**
 * Interface para administrador (extiende User)
 */
export interface Admin extends User {
  role: UserRole.ADMIN;
  permissions: AdminPermission[];
  lastLogin?: Date;
}

/**
 * Permisos específicos de administrador
 */
export enum AdminPermission {
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_COURSES = 'MANAGE_COURSES',
  VIEW_REPORTS = 'VIEW_REPORTS',
  MANAGE_PAYMENTS = 'MANAGE_PAYMENTS',
  MANAGE_CATEGORIES = 'MANAGE_CATEGORIES'
}

/**
 * DTO para registro de usuario
 */
export interface UserRegistrationDto {
  email: string;
  password: string;
  name: string;
  surname?: string;
  role: UserRole;
  phoneNumber?: string;
}

/**
 * DTO para login
 */
export interface UserLoginDto {
  email: string;
  password: string;
}

/**
 * Response de autenticación
 */
export interface AuthResponse {
  user: User | Student | Teacher | Admin;
  token: string;
  refreshToken?: string;
  expiresIn: number; // En segundos
}

/**
 * DTO para actualizar perfil
 */
export interface UpdateProfileDto {
  name?: string;
  surname?: string;
  phoneNumber?: string;
  biography?: string;
  avatar?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}