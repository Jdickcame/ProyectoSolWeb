package com.proyecto.proyectobackend.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.proyectobackend.dto.CourseFilters;
import com.proyecto.proyectobackend.dto.CourseResponse;
import com.proyecto.proyectobackend.dto.CreateCourseRequest;
import com.proyecto.proyectobackend.dto.CreateLessonRequest;
import com.proyecto.proyectobackend.dto.CreateResourceRequest;
import com.proyecto.proyectobackend.dto.CreateSectionRequest;
import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.CourseSection;
import com.proyecto.proyectobackend.model.Lesson;
import com.proyecto.proyectobackend.model.LessonResource;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.model.enums.CourseStatus;
import com.proyecto.proyectobackend.model.enums.Role;
import com.proyecto.proyectobackend.repository.CourseRepository;
import com.proyecto.proyectobackend.repository.LessonRepository;
import com.proyecto.proyectobackend.repository.SectionRepository;
import com.proyecto.proyectobackend.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;

    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        // 1. Obtener el usuario autenticado del Token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Verificar que sea PROFESOR
        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("Solo los profesores pueden crear cursos");
        }

        // 3. Crear la entidad Curso
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .category(request.getCategory())
                .level(request.getLevel())
                .language("es")
                .price(request.getPrice())
                .currency(request.getCurrency())
                .thumbnail(request.getThumbnail())
                .learningObjectives(request.getLearningObjectives())
                .requirements(request.getRequirements())
                .tags(request.getTags())
                .hasCertificate(request.isHasCertificate())
                .hasLiveClasses(request.isHasLiveClasses())
                .status(request.getStatus() != null ? request.getStatus() : CourseStatus.DRAFT)
                .teacher(teacher)
                .build();

        // 4. Guardar
        Course savedCourse = courseRepository.save(course);

        // --- NUEVA LÓGICA: GUARDADO EN CASCADA ---
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            for (CreateSectionRequest secDto : request.getSections()) {
                // 1. Crear Sección
                CourseSection section = CourseSection.builder()
                        .title(secDto.getTitle())
                        .order(secDto.getOrder())
                        .description(secDto.getDescription())
                        .course(savedCourse)
                        .build();
                CourseSection savedSection = sectionRepository.save(section);

                // 2. Crear Lecciones de esa sección
                if (secDto.getLessons() != null) {
                    for (CreateLessonRequest lessonDto : secDto.getLessons()) {
                        Lesson lesson = Lesson.builder()
                                .title(lessonDto.getTitle())
                                .order(lessonDto.getOrder())
                                .duration(lessonDto.getDuration())
                                .type(lessonDto.getType()) // Asegúrate de que coincida String vs Enum
                                .videoUrl(lessonDto.getVideoUrl())
                                .section(savedSection)
                                .build();

                        if (lessonDto.getResources() != null) {
                            for (CreateResourceRequest resDto : lessonDto.getResources()) {
                                LessonResource resource = LessonResource.builder()
                                        .title(resDto.getTitle())
                                        .url(resDto.getUrl())
                                        .lesson(lesson)
                                        .build();
                                lesson.getResources().add(resource);
                            }
                        }
                        lessonRepository.save(lesson);
                    }
                }

            }
        }
        // 5. Convertir a DTO y devolver
        return mapToResponse(savedCourse);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllPublishedCourses() {
        // Aquí luego implementaremos la paginación y filtros complejos
        // Por ahora, devolvemos todos los publicados o borradores (para probar)
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<CourseResponse> getFeaturedCourses() {
        // Usamos el método que definimos en el repositorio para traer los Top 6
        return courseRepository.findTop6ByStatusOrderByRatingDesc(CourseStatus.PUBLISHED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Reutilizamos el método mapToResponse que ya creaste antes
        return mapToResponse(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getCourses(CourseFilters filters) {
        // Construimos la consulta dinámica
        Specification<Course> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro 1: Estado (Vital para ocultar borradores)
            if (filters.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filters.getStatus()));
            }

            // Filtro 2: Categoría
            if (filters.getCategory() != null) {
                predicates.add(cb.equal(root.get("category"), filters.getCategory()));
            }

            // Filtro 3: Búsqueda por texto (Título o Descripción)
            if (filters.getSearchQuery() != null && !filters.getSearchQuery().isEmpty()) {
                String searchLike = "%" + filters.getSearchQuery().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), searchLike);
                Predicate descLike = cb.like(cb.lower(root.get("description")), searchLike);
                predicates.add(cb.or(titleLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Ejecutamos la consulta y convertimos a DTO
        return courseRepository.findAll(spec)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CreateCourseRequest request, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!course.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("No autorizado");
        }

        // 1. Actualizar datos básicos
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setShortDescription(request.getShortDescription());
        course.setCategory(request.getCategory());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());
        course.setHasCertificate(request.isHasCertificate());
        course.setHasLiveClasses(request.isHasLiveClasses());
        
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            course.setThumbnail(request.getThumbnail());
        }

        // 2. ACTUALIZAR SECCIONES (Estrategia: Limpiar y Reconstruir)
        // Solo si el request trae secciones (para no borrar todo por accidente)
        if (request.getSections() != null) {
            // Limpiamos la lista actual (Hibernate se encarga de borrar en BD gracias a orphanRemoval=true)
            course.getSections().clear();
            
            // Agregamos las nuevas
            for (CreateSectionRequest secDto : request.getSections()) {
                CourseSection section = CourseSection.builder()
                        .title(secDto.getTitle())
                        .order(secDto.getOrder())
                        .description(secDto.getDescription())
                        .course(course)
                        .build();
                
                // Agregamos lecciones
                if (secDto.getLessons() != null) {
                    for (CreateLessonRequest lessonDto : secDto.getLessons()) {
                        Lesson lesson = Lesson.builder()
                                .title(lessonDto.getTitle())
                                .order(lessonDto.getOrder())
                                .duration(lessonDto.getDuration())
                                .type(lessonDto.getType())
                                .videoUrl(lessonDto.getVideoUrl())
                                .section(section)
                                .build();
                        section.getLessons().add(lesson);
                    }
                }
                course.getSections().add(section);
            }
        }

        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }

    public CourseResponse getTeacherCourseById(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Validamos que sea su curso
        if (!course.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("No tienes permiso para ver este curso");
        }

        // Usamos el mapeador que ya incluye las secciones
        return mapToResponse(course);
    }

    // Método auxiliar para mapear de Entidad a DTO
    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .shortDescription(course.getShortDescription())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getName() + " " + (course.getTeacher().getSurname() != null ? course.getTeacher().getSurname() : ""))
                .teacherAvatar(course.getTeacher().getAvatar())
                .category(course.getCategory())
                .level(course.getLevel())
                .price(course.getPrice())
                .currency(course.getCurrency())
                .thumbnail(course.getThumbnail())
                .enrolledStudents(course.getEnrolledStudents())
                .rating(course.getRating())
                .totalReviews(course.getTotalReviews())
                .status(course.getStatus())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .tags(course.getTags())
                .sections(course.getSections())
                .build();
    }
}
