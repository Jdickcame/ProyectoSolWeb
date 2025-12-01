package com.proyecto.proyectobackend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.proyecto.proyectobackend.model.enums.LiveClassStatus;
import com.proyecto.proyectobackend.model.enums.VideoPlatform;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "live_classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "sections", "teacher"})
    private Course course;

    // Aunque podemos sacar el profesor del curso, a veces es útil tenerlo directo
    // para consultas rápidas de "Mis clases en vivo"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User teacher;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate scheduledDate;
    private LocalTime startTime;
    private Integer duration; // Minutos

    @Enumerated(EnumType.STRING)
    private VideoPlatform platform;
    
    private String meetingUrl;
    private String meetingPassword;

    @Enumerated(EnumType.STRING)
    private LiveClassStatus status;

    private String recordingUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}