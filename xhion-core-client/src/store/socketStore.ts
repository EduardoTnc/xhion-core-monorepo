import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

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
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ WebSocket Singleton desconectado:', reason);
            set({ isConnected: false, isConnecting: false });
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Error de conexión WebSocket Singleton:', error.message);
            set({ isConnecting: false });
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
