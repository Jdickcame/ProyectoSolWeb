package com.proyecto.proyectobackend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.proyecto.proyectobackend.model.CourseSection;
import com.proyecto.proyectobackend.model.enums.CourseCategory;
import com.proyecto.proyectobackend.model.enums.CourseLevel;
import com.proyecto.proyectobackend.model.enums.CourseStatus;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String shortDescription;
    
    // Datos del profesor (Simplificados para la tarjeta del curso)
    private Long teacherId;
    private String teacherName;
    private String teacherAvatar;

    private CourseCategory category;
    private CourseLevel level;
    private Double price;
    private String currency;
    private String thumbnail;
    
    private Integer enrolledStudents;
    private Double rating;
    private Integer totalReviews;
    
    private CourseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<String> tags;

    private List<CourseSection> sections;
}