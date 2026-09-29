import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const defaultWsUrl = apiUrl.replace(/^http/, 'ws');
      const wsUrl = process.env.REACT_APP_WS_URL || defaultWsUrl;
      
      try {
        this.socket = io(wsUrl, {
          query: { client_id: clientId },
          transports: ['websocket'],
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        });

        this.socket.on('message', (message: WebSocketMessage) => {
          this.handleMessage(message);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToPark(parkId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe_park', { park_id: parkId });
    }
  }

  unsubscribeFromPark(parkId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('unsubscribe_park', { park_id: parkId });
    }
  }

  ping(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ping', { timestamp: new Date().toISOString() });
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const event = new CustomEvent(`websocket_${message.type}`, {
      detail: message
    });
    window.dispatchEvent(event);
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
