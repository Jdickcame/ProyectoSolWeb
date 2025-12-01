package com.proyecto.proyectobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.CreateLiveClassRequest;
import com.proyecto.proyectobackend.model.LiveClass;
import com.proyecto.proyectobackend.service.LiveClassService;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LiveClassController {

    private final LiveClassService liveClassService;

    // Agendar clase (Profesor)
    @PostMapping("/courses/{courseId}/live-classes")
    public ResponseEntity<LiveClass> scheduleClass(
            @PathVariable Long courseId,
            @RequestBody @Valid CreateLiveClassRequest request
    ) {
        return ResponseEntity.ok(liveClassService.scheduleClass(courseId, request));
    }

    // Ver clases de un curso (Público/Estudiante)
    @GetMapping("/courses/{courseId}/live-classes")
    public ResponseEntity<List<LiveClass>> getCourseClasses(@PathVariable Long courseId) {
        return ResponseEntity.ok(liveClassService.getCourseLiveClasses(courseId));
    }

    // Ver mi agenda (Profesor)
    @GetMapping("/teachers/live-classes")
    public ResponseEntity<List<LiveClass>> getMyAgenda() {
        return ResponseEntity.ok(liveClassService.getMyScheduledClasses());
    }
}