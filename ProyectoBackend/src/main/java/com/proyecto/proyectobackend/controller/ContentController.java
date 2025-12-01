package com.proyecto.proyectobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.CreateLessonRequest;
import com.proyecto.proyectobackend.dto.CreateSectionRequest;
import com.proyecto.proyectobackend.model.CourseSection;
import com.proyecto.proyectobackend.model.Lesson;
import com.proyecto.proyectobackend.service.ContentService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // Agregar Sección a un Curso
    @PostMapping("/courses/{courseId}/sections")
    public ResponseEntity<CourseSection> addSection(
            @PathVariable Long courseId,
            @RequestBody @Valid CreateSectionRequest request
    ) {
        return ResponseEntity.ok(contentService.createSection(courseId, request));
    }

    // Agregar Lección a una Sección
    @PostMapping("/sections/{sectionId}/lessons")
    public ResponseEntity<Lesson> addLesson(
            @PathVariable Long sectionId,
            @RequestBody @Valid CreateLessonRequest request
    ) {
        return ResponseEntity.ok(contentService.createLesson(sectionId, request));
    }
}
