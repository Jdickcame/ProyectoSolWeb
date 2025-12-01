package com.proyecto.proyectobackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyReviewRequest {
    @NotBlank(message = "La respuesta no puede estar vacía")
    private String response;
}