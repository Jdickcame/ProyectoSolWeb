package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.enums.CourseStatus;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    
    // Para el panel del profesor
    List<Course> findByTeacherId(Long teacherId);
    
    // Para encontrar cursos destacados (por ejemplo, los mejores calificados publicados)
    List<Course> findTop6ByStatusOrderByRatingDesc(CourseStatus status);
    
    // Para búsqueda rápida por texto (título o descripción)
    List<Course> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
    
    // Para el admin (cursos pendientes)
    List<Course> findByStatus(CourseStatus status);
}