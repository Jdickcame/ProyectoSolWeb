package com.proyecto.proyectobackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.proyecto.proyectobackend.model.enums.CourseCategory;
import com.proyecto.proyectobackend.model.enums.CourseLevel;
import com.proyecto.proyectobackend.model.enums.CourseStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT") // Permite textos largos
    private String description;
    
    private String shortDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher; // Relación con la tabla users

    @Enumerated(EnumType.STRING)
    private CourseCategory category;

    @Enumerated(EnumType.STRING)
    private CourseLevel level;
    
    private String language;
    private Double price;
    
    @Builder.Default
    private String currency = "PEN";

    private String thumbnail;
    private String previewVideo;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "course_objectives", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "objective")
    private List<String> learningObjectives = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "course_requirements", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "requirement")
    private List<String> requirements = new ArrayList<>();
    
    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "course_tags", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // Estadísticas (Se pueden recalcular, pero útil tenerlas cacheadas)
    @Builder.Default
    private Integer enrolledStudents = 0;
    @Builder.Default
    private Double rating = 0.0;
    @Builder.Default
    private Integer totalReviews = 0;

    @Enumerated(EnumType.STRING)
    private CourseStatus status;

    private boolean hasCertificate;
    private boolean hasLiveClasses;

    @Builder.Default
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseSection> sections = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}