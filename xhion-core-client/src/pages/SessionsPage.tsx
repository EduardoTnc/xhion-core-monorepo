import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { authService } from '../services/authService';
import type { Sesion } from '../types';

export default function SessionsPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const cargarSesiones = async () => {
    setIsLoading(true);
    try {
      const data = await authService.obtenerSesionesActivas();
      setSesiones(data);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  const handleRevokeClick = (sesionId: string) => {
    setSelectedSession(sesionId);
    setIsOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedSession) return;

    setIsRevoking(true);
    try {
      await authService.revocarSesion(selectedSession);
      
      // Mostrar toast de éxito
      setToastMessage('Sesión revocada exitosamente');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Recargar sesiones
      await cargarSesiones();
    } catch (error) {
      console.error('Error al revocar sesión:', error);
      setToastMessage('Error al revocar la sesión');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsRevoking(false);
      setIsOpen(false);
      setSelectedSession(null);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    // Verificación defensiva: si no hay fecha, devolver 'N/A'
    if (!dateString) {
      return 'N/A';
    }

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch (error) {
      // Fallback por si la fecha tiene un formato inesperado
      return 'Fecha inválida';
    }
  };

  const parseUserAgent = (ua: string | null): string => {
    if (!ua || ua.trim() === '') return 'Desconocido';

    // Detectar navegador
    let browser = 'Desconocido';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detectar sistema operativo
    let os = '';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return `${browser}${os ? ' en ' + os : ''}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Mis Sesiones Activas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona todas tus sesiones activas en diferentes dispositivos
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : sesiones.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No hay sesiones activas
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Inicia sesión desde otro dispositivo para verlo aquí
            </p>
          </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DISPOSITIVO</TableHead>
                  <TableHead>DIRECCIÓN IP</TableHead>
                  <TableHead>ÚLTIMO USO</TableHead>
                  <TableHead className="text-center">ACCIONES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sesiones.map((sesion) => (
                  <TableRow key={sesion.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium">
                            {parseUserAgent(sesion.userAgent)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {sesion.direccionIp || 'No disponible'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {formatDate(sesion.actualizadaEn)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeClick(sesion.id)}
                          aria-label="Cerrar sesión"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmación */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cerrar esta sesión? Esta acción no se puede deshacer y
              tendrás que volver a iniciar sesión en ese dispositivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isRevoking}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                'Cerrar Sesión'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Card className="bg-green-500 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">{toastMessage}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
