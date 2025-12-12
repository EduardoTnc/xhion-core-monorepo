import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocketStore } from '@/store/socketStore';

interface UserPresence {
    userId: string;
    isOnline: boolean;
}

interface UseUserPresenceOptions {
    userIds: string[];
    enabled?: boolean;
}

/**
 * Hook for real-time user presence tracking via WebSocket
 * Subscribes to presence updates for specified users and returns their online status
 */
export function useUserPresence({ userIds, enabled = true }: UseUserPresenceOptions) {
    const { socket, isConnected } = useSocketStore();
    const [presenceMap, setPresenceMap] = useState<Map<string, boolean>>(new Map());
    const [loading, setLoading] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to presence updates
    useEffect(() => {
        if (!socket || !isConnected || !enabled || userIds.length === 0) {
            console.log('[UserPresence] Skipping subscription:', { socket: !!socket, isConnected, enabled, userIdsLength: userIds.length });
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log('[UserPresence] Subscribing to presence for users:', userIds);

        // Set a timeout in case the server doesn't respond
        timeoutRef.current = setTimeout(() => {
            console.warn('[UserPresence] Subscription timed out after 5 seconds');
            setLoading(false);
        }, 5000);

        // Subscribe to user presence with callback
        socket.emit('subscribe:user-presence', { userIds }, (response: { success: boolean; presence: UserPresence[] } | undefined) => {
            // Clear timeout since we got a response
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            console.log('[UserPresence] Subscription response:', response);

            if (response?.success && response?.presence) {
                const newMap = new Map<string, boolean>();
                response.presence.forEach(p => {
                    console.log(`[UserPresence] User ${p.userId}: ${p.isOnline ? 'ONLINE' : 'OFFLINE'}`);
                    newMap.set(p.userId, p.isOnline);
                });
                setPresenceMap(newMap);
            } else {
                console.warn('[UserPresence] Invalid or empty response from subscription:', response);
                // If no response, try to check if socket itself is connected to determine self-presence
            }
            setLoading(false);
        });

        // Handle presence change events
        const handlePresenceChange = (data: { userId: string; isOnline: boolean; timestamp: string }) => {
            console.log('[UserPresence] Presence change event:', data);
            if (userIds.includes(data.userId)) {
                setPresenceMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(data.userId, data.isOnline);
                    return newMap;
                });
            }
        };

        // Handle global presence broadcast
        const handleGlobalPresence = (data: { userId: string; isOnline: boolean; timestamp: string }) => {
            console.log('[UserPresence] Global presence event:', data);
            if (userIds.includes(data.userId)) {
                setPresenceMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(data.userId, data.isOnline);
                    return newMap;
                });
            }
        };

        socket.on('user:presence-change', handlePresenceChange);
        socket.on('user:presence', handleGlobalPresence);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            socket.off('user:presence-change', handlePresenceChange);
            socket.off('user:presence', handleGlobalPresence);
            socket.emit('unsubscribe:user-presence', { userIds });
        };
    }, [socket, isConnected, enabled, JSON.stringify(userIds)]);

    // Check if a specific user is online
    const isUserOnline = useCallback((userId: string): boolean => {
        return presenceMap.get(userId) ?? false;
    }, [presenceMap]);

    // Get all online users from the subscribed list
    const getOnlineUsers = useCallback((): string[] => {
        return Array.from(presenceMap.entries())
            .filter(([_, isOnline]) => isOnline)
            .map(([userId, _]) => userId);
    }, [presenceMap]);

    return {
        presenceMap,
        isUserOnline,
        getOnlineUsers,
        loading,
        isConnected,
    };
}

/**
 * Simplified hook for tracking a single user's presence
 */
export function useSingleUserPresence(userId: string | null) {
    const { presenceMap, loading, isConnected } = useUserPresence({
        userIds: userId ? [userId] : [],
        enabled: !!userId,
    });

    return {
        isOnline: userId ? presenceMap.get(userId) ?? false : false,
        loading,
        isConnected,
    };
}
