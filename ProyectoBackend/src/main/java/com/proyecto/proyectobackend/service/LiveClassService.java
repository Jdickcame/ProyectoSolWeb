package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.proyectobackend.dto.CreateLiveClassRequest;
import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.LiveClass;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.model.enums.LiveClassStatus;
import com.proyecto.proyectobackend.repository.CourseRepository;
import com.proyecto.proyectobackend.repository.LiveClassRepository;
import com.proyecto.proyectobackend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LiveClassService {

    private final LiveClassRepository liveClassRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // Crear una clase en vivo (Solo Profesor del curso)
    @Transactional
    public LiveClass scheduleClass(Long courseId, CreateLiveClassRequest request) {
        User teacher = getAuthenticatedTeacher();
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Validar propiedad
        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para agendar clases en este curso");
        }

        LiveClass liveClass = LiveClass.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .scheduledDate(request.getScheduledDate())
                .startTime(request.getStartTime())
                .duration(request.getDuration())
                .platform(request.getPlatform())
                .meetingUrl(request.getMeetingUrl())
                .meetingPassword(request.getMeetingPassword())
                .status(LiveClassStatus.SCHEDULED)
                .course(course)
                .teacher(teacher)
                .build();

        return liveClassRepository.save(liveClass);
    }

    // Listar clases de un curso (Público/Estudiantes inscritos)
    public List<LiveClass> getCourseLiveClasses(Long courseId) {
        return liveClassRepository.findByCourseId(courseId);
    }

    // Listar clases del profesor logueado (Para su agenda)
    public List<LiveClass> getMyScheduledClasses() {
        User teacher = getAuthenticatedTeacher();
        return liveClassRepository.findByTeacherId(teacher.getId());
    }

    // Auxiliar
    private User getAuthenticatedTeacher() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<LiveClass> getStudentUpcomingClasses() {
        // 1. Obtener estudiante logueado
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Buscar clases futuras (desde hoy en adelante)
        return liveClassRepository.findUpcomingClassesByStudentId(student.getId(), java.time.LocalDate.now());
    }
}