package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.proyectobackend.model.CourseSection;

public interface SectionRepository extends JpaRepository<CourseSection, Long>{

}
