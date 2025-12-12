import { useEffect, useState } from 'react'
import { WifiOff, Server, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConnectionStore } from '@/store/connectionStore'
import { cn } from '@/lib/utils'

export function ConnectionBanner() {
    const {
        isOnline,
        isServerConnected,
        isReconnecting,
        showBanner,
        reconnectAttempts,
        setBannerVisible,
        setReconnecting,
        setServerConnected,
        incrementReconnectAttempts,
    } = useConnectionStore()

    const [isRetrying, setIsRetrying] = useState(false)
    const [showSuccessBanner, setShowSuccessBanner] = useState(false)

    // Determine the type of connection issue
    const connectionIssue = !isOnline ? 'offline' : !isServerConnected ? 'server' : null

    // Show success banner briefly when connection is restored
    useEffect(() => {
        if (isOnline && isServerConnected && showBanner) {
            setShowSuccessBanner(true)
            const timer = setTimeout(() => {
                setShowSuccessBanner(false)
                setBannerVisible(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isOnline, isServerConnected, showBanner, setBannerVisible])

    // Handle retry connection
    const handleRetry = async () => {
        setIsRetrying(true)
        setReconnecting(true)
        incrementReconnectAttempts()

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
            const response = await fetch(`${baseUrl}/api/v1/health`, {
                method: 'GET',
                cache: 'no-store',
            })
            setServerConnected(response.ok)
        } catch {
            setServerConnected(false)
        } finally {
            setIsRetrying(false)
            setReconnecting(false)
        }
    }

    // Success state (connection restored)
    if (showSuccessBanner) {
        return (
            <div className="w-full bg-green-500/90 backdrop-blur-sm text-white animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-center gap-2 px-4 py-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Conexión restaurada</span>
                </div>
            </div>
        )
    }

    // Don't render if no issues
    if (!showBanner || !connectionIssue) {
        return null
    }

    return (
        <div className="w-full animate-in slide-in-from-top duration-200">
            <div
                className={cn(
                    'flex items-center justify-between gap-3 px-4 py-1.5',
                    connectionIssue === 'offline'
                        ? 'bg-red-500/90 backdrop-blur-sm'
                        : 'bg-amber-500/90 backdrop-blur-sm'
                )}
            >
                {/* Left: Icon + Message */}
                <div className="flex items-center gap-2 min-w-0">
                    {connectionIssue === 'offline' ? (
                        <WifiOff className="h-3.5 w-3.5 text-white flex-shrink-0" />
                    ) : (
                        <Server className={cn("h-3.5 w-3.5 text-white flex-shrink-0", isReconnecting && "animate-pulse")} />
                    )}
                    <span className="text-xs font-medium text-white truncate">
                        {connectionIssue === 'offline'
                            ? 'Sin conexión a Internet'
                            : isReconnecting
                                ? `Reconectando... (${reconnectAttempts})`
                                : 'Servidor no disponible'}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {connectionIssue === 'server' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-white hover:bg-white/20 hover:text-white"
                            onClick={handleRetry}
                            disabled={isRetrying}
                        >
                            <RefreshCw className={cn('h-3 w-3 mr-1', isRetrying && 'animate-spin')} />
                            Reintentar
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                        onClick={() => setBannerVisible(false)}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}


