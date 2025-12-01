package com.proyecto.proyectobackend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

import com.proyecto.proyectobackend.model.enums.VideoPlatform;

@Data
public class CreateLiveClassRequest {

    @NotBlank(message = "El título es obligatorio")
    private String title;

    private String description;

    @NotNull(message = "La fecha es obligatoria")
    @Future(message = "La fecha debe ser en el futuro") // Validación automática de fechas futuras
    private LocalDate scheduledDate;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La duración es obligatoria")
    private Integer duration; // Minutos

    @NotNull(message = "La plataforma es obligatoria")
    private VideoPlatform platform; // ZOOM, GOOGLE_MEET, etc.

    @NotBlank(message = "El link de la reunión es obligatorio")
    private String meetingUrl;

    private String meetingPassword;
}
