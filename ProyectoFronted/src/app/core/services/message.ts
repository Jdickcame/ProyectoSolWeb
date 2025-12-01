import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ESTADO GLOBAL DEL CONTADOR
  unreadCount = signal<number>(0);

  // Método para actualizar el contador desde el servidor
  refreshUnreadCount(): void {
    this.http.get<number>(`${this.apiUrl}/messages/unread-count`).subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => this.unreadCount.set(0)
    });
  }

  sendMessage(receiverId: string | number, content: string, subject: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, { receiverId, content, subject });
  }

  getMyInbox(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/inbox`);
  }

  // Actualiza markAsRead para bajar el contador localmente al leer
  markAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/messages/${messageId}/read`, {}).pipe(
      tap(() => {
        // Restamos 1 al contador visualmente
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }
}