package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.proyectobackend.dto.CreateLessonRequest;
import com.proyecto.proyectobackend.dto.CreateSectionRequest;
import com.proyecto.proyectobackend.model.*;
import com.proyecto.proyectobackend.repository.*;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository; // Asegúrate de crear este repositorio si no existe
    private final LessonRepository lessonRepository;   // Asegúrate de crear este repositorio si no existe
    private final UserRepository userRepository;

    // 1. Crear Sección (Módulo)
    @Transactional
    public CourseSection createSection(Long courseId, CreateSectionRequest request) {
        User teacher = getAuthenticatedTeacher();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        validateOwnership(course, teacher);

        CourseSection section = CourseSection.builder()
                .title(request.getTitle())
                .order(request.getOrder())
                .course(course)
                .build();

        return sectionRepository.save(section);
    }

    // 2. Crear Lección (Video/Texto)
    @Transactional
    public Lesson createLesson(Long sectionId, CreateLessonRequest request) {
        User teacher = getAuthenticatedTeacher();
        
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        
        // Validamos propiedad a través del curso de la sección
        validateOwnership(section.getCourse(), teacher);

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .order(request.getOrder())
                .type(request.getType())
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration())
                .content(request.getContent())
                .isPreview(request.isPreview())
                .section(section)
                .build();

        return lessonRepository.save(lesson);
    }

    // --- Métodos Auxiliares ---

    private User getAuthenticatedTeacher() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private void validateOwnership(Course course, User teacher) {
        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para editar este curso");
        }
    }
}