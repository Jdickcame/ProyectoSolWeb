package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.proyecto.proyectobackend.model.Enrollment;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    // Para ver si el estudiante ya compró el curso
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    // Para el historial del estudiante
    List<Enrollment> findByStudentId(Long studentId);
    
    // Para ver quiénes compraron un curso (Profesor)
    List<Enrollment> findByCourseId(Long courseId);

    @Query("SELECT SUM(e.amountPaid) FROM Enrollment e WHERE e.course.teacher.id = :teacherId")
    Double calculateTeacherRevenue(Long teacherId);
}