package com.proyecto.proyectobackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLessonRequest {
    @NotBlank(message = "El título de la lección es obligatorio")
    private String title;

    @NotNull(message = "El orden es obligatorio")
    private Integer order;

    private String type; // VIDEO, TEXT
    
    // Si es VIDEO
    private String videoUrl;

    private Integer duration; // Minutos

    // Si es TEXTO
    private String content;

    private boolean isPreview;

    private java.util.List<CreateResourceRequest> resources;
}
