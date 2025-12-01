package com.proyecto.proyectobackend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private Integer rating; // 1-5
    
    @Column(columnDefinition = "TEXT")
    private String comment;

    private boolean isVerifiedPurchase;

    // Respuesta del profesor (Simplificada)
    @Column(columnDefinition = "TEXT")
    private String teacherResponse;
    private LocalDateTime teacherResponseAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Builder.Default
    private Integer helpfulCount = 0;
    
    @Builder.Default
    private Integer reportedCount = 0;
}
