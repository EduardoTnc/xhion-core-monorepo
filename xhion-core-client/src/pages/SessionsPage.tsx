import { useState, useEffect } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Skeleton, useDisclosure } from '@heroui/react';
import { authService } from '../services/authService';
import type { Sesion } from '../types';

export default function SessionsPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    onOpen();
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
      onClose();
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

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
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
          <Table aria-label="Tabla de sesiones activas">
            <TableHeader>
              <TableColumn>DISPOSITIVO</TableColumn>
              <TableColumn>DIRECCIÓN IP</TableColumn>
              <TableColumn>ÚLTIMO USO</TableColumn>
              <TableColumn align="center">ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {sesiones.map((sesion) => (
                <TableRow key={sesion.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {parseUserAgent(sesion.userAgent)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 dark:text-gray-400">
                      {sesion.direccionIp || 'No disponible'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatDate(sesion.actualizadaEn)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => handleRevokeClick(sesion.id)}
                        aria-label="Cerrar sesión"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal de Confirmación */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Cerrar Sesión</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que quieres cerrar esta sesión? Esta acción no se puede deshacer y
              tendrás que volver a iniciar sesión en ese dispositivo.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isRevoking}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmRevoke}
              isLoading={isRevoking}
            >
              Cerrar Sesión
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Card className="bg-green-500 dark:bg-green-600 text-white px-6 py-4 shadow-lg">
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
          </Card>
        </div>
      )}
    </div>
  );
}
