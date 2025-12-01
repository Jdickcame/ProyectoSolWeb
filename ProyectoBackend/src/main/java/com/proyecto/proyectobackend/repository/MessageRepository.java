package com.proyecto.proyectobackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyecto.proyectobackend.model.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Obtener conversación entre dos personas
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtDesc(
        Long sender1, Long receiver1, Long sender2, Long receiver2
    );
    
    // Obtener mis mensajes recibidos
    List<Message> findByReceiverIdOrderBySentAtDesc(Long receiverId);

    // Contar mensajes no leídos de un usuario
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}