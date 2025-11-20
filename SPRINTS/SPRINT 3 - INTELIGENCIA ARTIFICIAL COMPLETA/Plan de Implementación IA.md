





### Resumen del contexto relevante
- Requisitos RF-IA01, RF-IA02 y RF-IA04 descritos en [REQUISITOS.md](cci:7://file:///d:/Proyectos/PROYECTO%20DE%20MEJORA%20-%20XHION%20CORE/xhion-core-monorepo/REQUISITOS.md:0:0-0:0) @REQUISITOS.md#13-21.
- Actualmente existe un modal de búsqueda con UI ficticia (`AISearchModal`) y atajo `⌘/Ctrl+K` ya integrado en `Header` y `Sidebar`, pero sin backend/IA real @xhion-core-client/src/components/modals/ai-search-modal.tsx#1-281 @xhion-core-client/src/components/layout/Header.tsx#97-235 @xhion-core-client/src/components/layout/sidebar.tsx#181-318.

---

### Plan de implementación priorizando IA

#### Fase 1 – Fundamentos compartidos (Infra IA y datos)
1. **Seleccionar proveedor IA (Gemini) y abstraerlo**: crear módulo backend `ai` con servicio que wrapee la API de Gemini (claves en `.env`, control de costos, logging). Exponer endpoints REST/WS reutilizables (`/ai/search`, `/ai/projects/assist`, `/ai/ideas/analyze`).
2. **Motor semántico y data prep**:
   - Indexar tareas, proyectos, usuarios y documentos de conocimiento: usar embeddings (almacenados en Postgres JSON/pgvector u otro store) y refrescar al actualizar entidades.
   - Añadir jobs para sincronizar nuevas entradas (cron/queue) y exponer repositorios de búsqueda híbrida (texto + embedding) para IA.
3. **Context builder común**: utilidades backend que dado un prompt estructuren contexto (top-N resultados, datos de KB) para Gemini, con plantillas por caso de uso.
4. **Auditoría y seguridad**: registrar cada invocación IA en `auditoria` y validar permisos (ej. usuarios sólo ven datos de sus departamentos).

#### Fase 2 – RF-IA01 Búsqueda global con IA
Backend:
1. Endpoint `/ai/search/query` que:
   - Clasifique intención (consulta factual vs comando vs narrativa) con model prompt ligero.
   - Según intención, combine resultados de índices (tareas/proyectos/usuarios/documentos) y genere respuesta narrativa usando contexto.
   - Para comandos (p.ej. “crear tarea…”), devolver payload `actionSuggestion` con entidad prellenada (tarea/proyecto/evento).

Frontend:
2. Extender `AISearchModal`:
   - Mostrar secciones reales: resultados por tipo, bloque narrativo y sugerencias de acción con botones para lanzar modales existentes (`CreateTaskModal`, etc.).
   - Manejar estados (`loading`, `error`, `follow-up`) y atajos (confirmar acción con ↵, navegar con ↑↓).
3. Integrar store (`aiSearchStore`) para conservar histórico/recientes y caching de resultados.
4. Telemetría: capturar métricas de uso, tiempos de respuesta y feedback (marcar útil/no útil).

#### Fase 3 – RF-IA02 Creación asistida de proyectos
Backend:
1. Nuevo endpoint `/ai/projects/assist`:
   - Input: descripción libre + metadata (departamento, fechas tentativas).
   - Pipeline: buscar proyectos similares (KB + historial), generar hitos/etapas/tareas; devolver estructura jerárquica con campos sugeridos (nombre, duración, dependencias, responsables).
2. Validar consistencia (fechas ordenadas, colores válidos, etc.) antes de responder.

Frontend:
3. Actualizar `CreateProjectModal`:
   - Paso previo “Describe tu proyecto” con textarea e indicador de confianza.
   - Botón “Generar con IA”: muestra vista previa editable (arrastrar etapas, aceptar/rechazar tareas) y posibilidad de “regenerar” o “ajustar” (prompt follow-up).
   - Al confirmar, rellenar formulario existente y permitir modificaciones manuales antes de guardar.
4. Guardar historial de versiones sugeridas para auditoría/rollback.

#### Fase 4 – RF-IA04 Gestión de Ideas con IA
Backend:
1. Endpoint `/ai/ideas/analyze`:
   - Agrupar ideas recientes por temática mediante clustering de embeddings.
   - Generar propuestas estratégicas (resumen, impacto, KPIs) y sugerir conversión a proyecto (incluye match con objetivos empresa del KB).
2. Exponer recomendador para “idea → proyecto/tarea” con plan de acción.

Frontend:
3. En `ideas-view.tsx` añadir pestañas/insights:
   - “Análisis IA”: tarjetas con grupos temáticos, métricas y CTA (“Convertir en proyecto” abre modal precargado con RF-IA02).
   - “Propuestas estratégicas”: timeline de recomendaciones, estado (pendiente/aceptado).
   - Feedback loop para marcar una sugerencia como útil o descartada (se reporta al backend).
4. Automatizar etiquetas/temas en la tabla/lista de ideas con badges generados por IA.

#### Dependencias y riesgos
- **Datos del KB**: RF-KB debe exponer descripciones y objetivos estructurados; si no están listos, priorizar su modelado para no bloquear IA.
- **Costos de IA**: implementar rate limiting y caching (por ejemplo, no volver a generar análisis para la misma idea sin cambios).
- **UX**: coordinar con diseño para estados de carga y enseñanza al usuario (ej. disclaimers de IA).
- **Seguridad**: sanitizar prompts, evitar filtración de datos sensibles en respuestas.

#### Próximos pasos inmediatos
1. Alinear con stakeholders alcance de RF-IA01 y definir SLAs (tiempo máx. de respuesta, precisión esperada).
2. Prototipo backend ligero para `/ai/search` con datos mock y conectar modal existente.
3. Planificar índice semántico (herramienta seleccionada, migraciones necesarias) y cronograma de poblamiento.

Esta hoja de ruta ataca primero RF-IA01 (punto crítico), luego reutiliza la infraestructura para RF-IA02 y RF-IA04, reduciendo trabajo duplicado y habilitando mejoras continuas en IA.