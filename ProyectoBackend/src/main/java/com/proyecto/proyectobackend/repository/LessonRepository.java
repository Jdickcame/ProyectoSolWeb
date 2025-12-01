package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.proyectobackend.model.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long>{
    
}
