import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useConnectionStore } from './connectionStore';

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    isConnecting: boolean;
    connect: (token: string) => void;
    disconnect: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    isConnecting: false,
    connect: (token: string) => {
        const { socket, isConnected, isConnecting } = get();

        // Si ya está conectado o conectando, no hacer nada
        if (socket?.connected || isConnected || isConnecting) return;

        set({ isConnecting: true });

        const newSocket = io(`${SOCKET_URL}/notifications`, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✅ WebSocket Singleton conectado');
            set({ isConnected: true, isConnecting: false });
            // Sync with connectionStore
            useConnectionStore.getState().setServerConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ WebSocket Singleton desconectado:', reason);
            set({ isConnected: false, isConnecting: false });
            // Note: We intentionally do NOT call setServerConnected(false) here
            // because the REST API may still be working. Only reconnect_failed
            // should mark the server as disconnected. Socket.io will attempt
            // automatic reconnection which often succeeds quickly.
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Error de conexión WebSocket Singleton:', error.message);
            set({ isConnecting: false });
            // Don't set server disconnected on first connect_error either - 
            // wait for reconnect_failed instead
            useConnectionStore.getState().setError(`WebSocket: ${error.message}`);
        });

        newSocket.on('reconnect_attempt', (attempt) => {
            console.log(`🔄 Intento de reconexión #${attempt}`);
            set({ isConnecting: true });
            useConnectionStore.getState().setReconnecting(true);
            useConnectionStore.getState().incrementReconnectAttempts();
        });

        newSocket.on('reconnect', () => {
            console.log('✅ WebSocket reconectado');
            set({ isConnected: true, isConnecting: false });
            // Mark server as connected - this will trigger refresh and update UI
            useConnectionStore.getState().setServerConnected(true);
            useConnectionStore.getState().setReconnecting(false);
            useConnectionStore.getState().resetReconnectAttempts();
        });

        newSocket.on('reconnect_failed', () => {
            console.error('❌ Reconexión fallida');
            set({ isConnecting: false });
            useConnectionStore.getState().setReconnecting(false);
            useConnectionStore.getState().setBannerVisible(true);
        });

        set({ socket: newSocket });
    },
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false, isConnecting: false });
        }
    }
}));

