package com.proyecto.proyectobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.CourseFilters;
import com.proyecto.proyectobackend.dto.CourseResponse;
import com.proyecto.proyectobackend.dto.CreateCourseRequest;
import com.proyecto.proyectobackend.model.enums.CourseCategory;
import com.proyecto.proyectobackend.model.enums.CourseStatus;
import com.proyecto.proyectobackend.service.CourseService;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // Obtener todos los cursos (Público)
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses(
            @RequestParam(required = false) CourseCategory category,
            @RequestParam(required = false) String search,
            // ... otros params
            @RequestParam(required = false) CourseStatus status
    ) {
        CourseFilters filters = CourseFilters.builder()
                .category(category)
                .searchQuery(search)
                .status(CourseStatus.PUBLISHED) // <--- ¡ESTO ES LA CLAVE!
                .build();
        
        return ResponseEntity.ok(courseService.getCourses(filters));
    }

    // Crear un curso (Privado - Requiere Token de Profesor)
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@RequestBody @Valid CreateCourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<CourseResponse>> getFeaturedCourses() {
        return ResponseEntity.ok(courseService.getFeaturedCourses());
    }

    // OBTENER CURSO POR ID (Público)
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
}