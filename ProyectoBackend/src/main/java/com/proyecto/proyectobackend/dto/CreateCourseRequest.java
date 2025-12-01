package com.proyecto.proyectobackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

import com.proyecto.proyectobackend.model.enums.CourseCategory;
import com.proyecto.proyectobackend.model.enums.CourseLevel;
import com.proyecto.proyectobackend.model.enums.CourseStatus;

@Data
public class CreateCourseRequest {

    @NotBlank(message = "El título es obligatorio")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    private String shortDescription;

    @NotNull(message = "La categoría es obligatoria")
    private CourseCategory category;

    @NotNull(message = "El nivel es obligatorio")
    private CourseLevel level;

    @Min(value = 0, message = "El precio no puede ser negativo")
    private Double price;
    
    private String currency;
    private String thumbnail;
    
    private List<String> learningObjectives;
    private List<String> requirements;
    private List<String> tags;
    
    private boolean hasCertificate;
    private boolean hasLiveClasses;

    private List<CreateSectionRequest> sections;

    private CourseStatus status;
}