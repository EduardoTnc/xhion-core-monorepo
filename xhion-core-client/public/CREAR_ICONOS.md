# 🎨 CREAR ÍCONOS PARA PWA

## Problema
El manifest.json referencia íconos que no existen:
- `/icon-192.png` (192x192px)
- `/icon-512.png` (512x512px)

## Solución Temporal

### Opción 1: Usar un Generador Online (Recomendado)
1. Ve a: https://realfavicongenerator.net/
2. Sube el logo de XHION Core
3. Genera los íconos
4. Descarga y coloca en `/public/`

### Opción 2: Crear Manualmente
Crea dos archivos PNG con el logo de XHION:
- `icon-192.png` (192x192 píxeles)
- `icon-512.png` (512x512 píxeles)

### Opción 3: Placeholder Temporal
Mientras tanto, puedes comentar la sección de íconos en `manifest.json`:

```json
{
  "name": "XHION Core",
  "short_name": "XHION",
  "description": "Plataforma de gestión de proyectos y tareas con IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "categories": ["productivity", "business"]
}
```

## Especificaciones de Íconos

### icon-192.png
- Tamaño: 192x192 píxeles
- Formato: PNG
- Fondo: Transparente o blanco
- Uso: Ícono de aplicación estándar

### icon-512.png
- Tamaño: 512x512 píxeles
- Formato: PNG
- Fondo: Transparente o blanco
- Uso: Ícono de alta resolución para splash screens

## Nota
Este error NO afecta la funcionalidad de la aplicación, solo las capacidades PWA.
