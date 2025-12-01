package com.proyecto.proyectobackend.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Long receiverId;
    private String subject;
    private String content;
}