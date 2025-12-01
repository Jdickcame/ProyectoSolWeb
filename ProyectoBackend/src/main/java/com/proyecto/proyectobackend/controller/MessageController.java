package com.proyecto.proyectobackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.proyecto.proyectobackend.dto.SendMessageRequest;
import com.proyecto.proyectobackend.model.Message;
import com.proyecto.proyectobackend.model.User;
import com.proyecto.proyectobackend.repository.MessageRepository;
import com.proyecto.proyectobackend.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    // ENVIAR MENSAJE
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinatario no encontrado"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .subject(request.getSubject())
                .content(request.getContent())
                .isRead(false)
                .build();

        return ResponseEntity.ok(messageRepository.save(message));
    }

    // VER MIS MENSAJES (Buzón de entrada)
    @GetMapping("/inbox")
    public ResponseEntity<List<Message>> getMyInbox() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        return ResponseEntity.ok(messageRepository.findByReceiverIdOrderBySentAtDesc(me.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));
        
        // Validar que soy el destinatario
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!message.getReceiver().getEmail().equals(email)) {
             throw new RuntimeException("No autorizado");
        }

        message.setRead(true);
        messageRepository.save(message);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return ResponseEntity.ok(messageRepository.countByReceiverIdAndIsReadFalse(me.getId()));
    }
}