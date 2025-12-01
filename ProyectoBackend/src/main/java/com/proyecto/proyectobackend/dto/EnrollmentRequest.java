package com.proyecto.proyectobackend.dto;

import com.proyecto.proyectobackend.model.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {
    @NotNull(message = "El ID del curso es obligatorio")
    private Long courseId;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;
}
