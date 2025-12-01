package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.proyectobackend.model.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourseId(Long courseId);
    
    // Para calcular el rating promedio
    long countByCourseId(Long courseId);
}