package com.proyecto.proyectobackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.proyecto.proyectobackend.model.enums.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    // Datos de pago
    private Double amountPaid;
    private String currency;
    private String paymentId; // Referencia a PayPal/Stripe/MercadoPago

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;

    @CreationTimestamp
    private LocalDateTime enrolledAt;
    
    private LocalDateTime completedAt;

    // Progreso
    @Builder.Default
    private Integer progressPercentage = 0;
    private LocalDateTime lastAccessedAt;

    // Lista de IDs de lecciones completadas
    // Usamos Set para evitar duplicados
    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "enrollment_completed_lessons", joinColumns = @JoinColumn(name = "enrollment_id"))
    @Column(name = "lesson_id")
    private Set<Long> completedLessonIds = new HashSet<>();
}