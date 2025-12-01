package com.proyecto.proyectobackend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSectionRequest {
    @NotBlank(message = "El título de la sección es obligatorio")
    private String title;

    private String description;
    
    @NotNull(message = "El orden es obligatorio")
    private Integer order;

    private List<CreateLessonRequest> lessons;
}