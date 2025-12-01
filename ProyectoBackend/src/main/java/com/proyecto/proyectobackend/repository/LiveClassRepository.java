package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.proyecto.proyectobackend.model.LiveClass;

import java.time.LocalDate;
import java.util.List;

public interface LiveClassRepository extends JpaRepository<LiveClass, Long> {
    
    List<LiveClass> findByCourseId(Long courseId);
    List<LiveClass> findByTeacherId(Long teacherId);
    
    @Query("""
        SELECT l FROM LiveClass l 
        JOIN Enrollment e ON e.course.id = l.course.id 
        WHERE e.student.id = :studentId 
        AND l.scheduledDate >= :today 
        AND e.status = 'ACTIVE'
        ORDER BY l.scheduledDate ASC, l.startTime ASC
    """)
    List<LiveClass> findUpcomingClassesByStudentId(Long studentId, LocalDate today);
}
