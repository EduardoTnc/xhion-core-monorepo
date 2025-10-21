import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }

    // Online/Offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexión restaurada", {
        description: "Ahora estás en línea",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Sin conexión", {
        description: "Trabajando en modo offline",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      setRegistration(reg);

      // Check for updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
              toast.info("Actualización disponible", {
                description: "Hay una nueva versión disponible",
                action: {
                  label: "Actualizar",
                  onClick: () => updateServiceWorker(),
                },
              });
            }
          });
        }
      });

      // Check for updates every hour
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notificaciones activadas");
        return true;
      } else {
        toast.error("Notificaciones bloqueadas");
        return false;
      }
    }
    return false;
  };

  return {
    isOnline,
    isUpdateAvailable,
    updateServiceWorker,
    requestNotificationPermission,
  };
}
