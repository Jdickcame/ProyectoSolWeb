// ==========================================================================
// ENROLLMENT MODEL
// Modelo para las inscripciones de estudiantes a cursos
// ==========================================================================

import { Course } from "./course.model";

/**
 * Estado de una inscripción
 */
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',         // Inscripción activa
  COMPLETED = 'COMPLETED',   // Curso completado
  CANCELLED = 'CANCELLED',   // Cancelada por el estudiante
  EXPIRED = 'EXPIRED'        // Expirada (si hay límite de tiempo)
}

/**
 * Interface principal de Inscripción
 */
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;

  course: Course;
  
  // Información del pago
  paymentId: string;
  amountPaid: number;
  currency: string;
  paymentMethod: PaymentMethod;
  
  // Estado y fechas
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  expiresAt?: Date; // Para cursos con acceso limitado
  
  // Progreso
  progressPercentage: number // Porcentaje 0-100
  lastAccessedAt: Date;
  
  // Certificado
  certificateEarned: boolean;
  certificateIssuedAt?: Date;
  certificateUrl?: string;
}

/**
 * Métodos de pago soportados
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MERCADO_PAGO = 'MERCADO_PAGO',
  YAPE = 'YAPE',
  PLIN = 'PLIN',
  FREE = 'FREE' // Para cursos gratuitos
}

/**
 * Estado de un pago
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

/**
 * Interface de Pago
 */
export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId?: string;
  
  // Detalles del pago
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  
  // Información de transacción
  transactionId?: string; // ID de la pasarela de pago
  gatewayResponse?: any; // Respuesta completa del gateway
  
  // Detalles adicionales
  description: string;
  metadata?: Record<string, any>;
  
  // Fechas
  createdAt: Date;
  processedAt?: Date;
  refundedAt?: Date;
}

/**
 * DTO para crear una inscripción (simulada sin pago real)
 */
export interface CreateEnrollmentDto {
  courseId: string;
  paymentMethod: PaymentMethod;
}

/**
 * DTO para iniciar un pago
 */
export interface InitiatePaymentDto {
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string; // URL de retorno después del pago
  cancelUrl?: string; // URL si cancela el pago
}

/**
 * Respuesta al iniciar un pago
 */
export interface PaymentInitiationResponse {
  paymentId: string;
  redirectUrl?: string; // URL para redireccionar al usuario
  clientSecret?: string; // Para pagos con Stripe
  status: PaymentStatus;
}

/**
 * Verificación de pago
 */
export interface PaymentVerificationDto {
  paymentId: string;
  transactionId: string;
  status: PaymentStatus;
}

/**
 * Historial de pagos de un estudiante
 */
export interface PaymentHistory {
  payments: Payment[];
  total: number;
  totalSpent: number;
  currency: string;
}

/**
 * Reporte de ingresos del profesor
 */
export interface TeacherRevenue {
  teacherId: string;
  period: RevenuePeriod;
  totalRevenue: number;
  totalEnrollments: number;
  averageRevenuePerCourse: number;
  topSellingCourses: CourseRevenue[];
  revenueByMonth: MonthlyRevenue[];
  
  // Propiedades adicionales para analytics
  percentageChange: number; // Cambio porcentual respecto al periodo anterior
  conversionRate: number; // Tasa de conversión de visitantes a compradores
  topPerformingCourses: CourseRevenue[]; // Alias de topSellingCourses
}

/**
 * Periodo de reporte
 */
export enum RevenuePeriod {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
  LAST_YEAR = 'LAST_YEAR',
  ALL_TIME = 'ALL_TIME'
}

/**
 * Ingresos por curso
 */
export interface CourseRevenue {
  courseId: string;
  courseName: string;
  totalRevenue: number;
  totalEnrollments: number;
  averagePrice: number;
  courseTitle: string;
  enrollments: number;
  revenue: number;
}

/**
 * Ingresos mensuales
 */
export interface MonthlyRevenue {
  month: string; // Formato: "2025-01"
  revenue: number;
  enrollments: number;
}

/**
 * Cupón de descuento
 */
export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // Porcentaje (0-100) o monto fijo
  courseIds?: string[]; // Cursos aplicables (vacío = todos)
  
  // Validez
  validFrom: Date;
  validUntil: Date;
  maxUses: number;
  usedCount: number;
  
  // Estado
  isActive: boolean;
  createdBy: string; // ID del profesor o admin
  createdAt: Date;
}

/**
 * Tipo de descuento
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

/**
 * Aplicación de cupón
 */
export interface ApplyCouponDto {
  courseId: string;
  couponCode: string;
}

/**
 * Resultado de aplicar cupón
 */
export interface CouponApplicationResult {
  isValid: boolean;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  coupon?: Coupon;
  errorMessage?: string;
}