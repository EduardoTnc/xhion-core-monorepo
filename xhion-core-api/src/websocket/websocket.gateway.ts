import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(private jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      // Extraer token del handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      // Verificar token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.userId;

      // Guardar la relación usuario-socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Guardar userId en el socket para uso posterior
      client.data.userId = userId;

      // Unir al usuario a su sala personal
      client.join(`user:${userId}`);

      this.logger.log(`Client ${client.id} connected as user ${userId}`);
      this.logger.log(`Total connections for user ${userId}: ${this.userSockets.get(userId)!.size}`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);

      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }

      this.logger.log(`Client ${client.id} disconnected (user ${userId})`);
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }
  }

  // Enviar notificación a un usuario específico
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  // Enviar notificación a múltiples usuarios
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // Broadcast a todos los usuarios conectados
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcasted to all users');
  }

  // Enviar actualización de evento
  sendEventUpdate(userId: string, event: any) {
    this.server.to(`user:${userId}`).emit('event:updated', event);
    this.logger.log(`Event update sent to user ${userId}`);
  }

  // Enviar nuevo evento
  sendEventCreated(userIds: string[], event: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('event:created', event);
    });
    this.logger.log(`Event created notification sent to ${userIds.length} users`);
  }

  // Enviar evento eliminado
  sendEventDeleted(userIds: string[], eventId: string) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('event:deleted', { eventId });
    });
    this.logger.log(`Event deleted notification sent to ${userIds.length} users`);
  }

  // ==================== TAREAS ====================

  // Enviar tarea creada
  sendTaskCreated(userIds: string[], task: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('task:created', task);
    });
    this.logger.log(`Task created notification sent to ${userIds.length} users`);
  }

  // Enviar tarea actualizada
  sendTaskUpdated(userIds: string[], task: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('task:updated', task);
    });
    this.logger.log(`Task updated notification sent to ${userIds.length} users`);
  }

  // Enviar tarea eliminada
  sendTaskDeleted(userIds: string[], taskId: string) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('task:deleted', { taskId });
    });
    this.logger.log(`Task deleted notification sent to ${userIds.length} users`);
  }

  // Obtener usuarios conectados
  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Verificar si un usuario está conectado
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    return 'pong';
  }

  @SubscribeMessage('subscribe:events')
  handleSubscribeEvents(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    client.join(`events:${userId}`);
    this.logger.log(`User ${userId} subscribed to events`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribe:events')
  handleUnsubscribeEvents(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    client.leave(`events:${userId}`);
    this.logger.log(`User ${userId} unsubscribed from events`);
    return { success: true };
  }
}
