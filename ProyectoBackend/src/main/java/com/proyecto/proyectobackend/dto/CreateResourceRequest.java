package com.proyecto.proyectobackend.dto;

import lombok.Data;

@Data
public class CreateResourceRequest {
    private String title;
    private String url;
}