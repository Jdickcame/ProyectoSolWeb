import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/services/message';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

// Misma interfaz para agrupar
interface Conversation {
  senderId: number;
  senderName: string;
  senderSurname: string;
  lastMessageDate: string;
  messages: any[];
  unreadCount: number;
}

@Component({
  selector: 'app-teacher-messages',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, LoadingSpinner, FormsModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.scss']
})
export class Messages implements OnInit {
  private messageService = inject(MessageService);

  conversations = signal<Conversation[]>([]); // <--- Agrupado
  isLoading = signal<boolean>(true);
  
  // Estado del Chat
  selectedConversation = signal<Conversation | null>(null);
  replyContent = '';
  isSending = signal<boolean>(false);

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.messageService.getMyInbox().subscribe({
      next: (data) => {
        this.processConversations(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // Lógica de Agrupación (Idéntica a la del estudiante)
  private processConversations(messages: any[]): void {
    const groups = new Map<number, Conversation>();

    messages.forEach(msg => {
      const senderId = msg.sender.id;
      
      if (!groups.has(senderId)) {
        groups.set(senderId, {
          senderId: senderId,
          senderName: msg.sender.name,
          senderSurname: msg.sender.surname,
          lastMessageDate: msg.sentAt,
          messages: [],
          unreadCount: 0
        });
      }

      const conversation = groups.get(senderId)!;
      conversation.messages.push(msg);
      if (!msg.isRead) {
        conversation.unreadCount++;
      }
    });

    this.conversations.set(Array.from(groups.values()));
  }

  openConversation(conversation: Conversation): void {
    this.selectedConversation.set(conversation);
    this.replyContent = '';

    // Marcar como leídos
    conversation.messages.forEach(msg => {
      if (!msg.isRead) {
        this.messageService.markAsRead(msg.id).subscribe();
        msg.isRead = true;
      }
    });
    conversation.unreadCount = 0;
  }

  closeConversation(): void {
    this.selectedConversation.set(null);
    this.loadMessages(); // Recargar para actualizar orden
  }

  sendReply(): void {
    if (!this.replyContent.trim() || !this.selectedConversation()) return;

    const conv = this.selectedConversation()!;
    const subject = `Re: Chat Profesor`;

    this.isSending.set(true);

    // Aquí el ID ya funciona porque actualizamos el servicio o porque TS lo infiere correctamente
    this.messageService.sendMessage(conv.senderId, this.replyContent, subject).subscribe({
      next: () => {
        alert('Respuesta enviada');
        this.replyContent = '';
        this.isSending.set(false);
      },
      error: () => {
        alert('Error al enviar');
        this.isSending.set(false);
      }
    });
  }
}