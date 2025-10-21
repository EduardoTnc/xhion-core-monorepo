import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface KeyboardShortcutsConfig {
  onNewTask?: () => void;
  onNewProject?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
  onViewKanban?: () => void;
  onViewList?: () => void;
  onViewTable?: () => void;
  onViewTimeline?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  onHelp?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  // New Task: Ctrl/Cmd + N
  useHotkeys(
    "ctrl+n, cmd+n",
    (e) => {
      e.preventDefault();
      config.onNewTask?.();
    },
    { enableOnFormTags: false }
  );

  // New Project: Ctrl/Cmd + Shift + N
  useHotkeys(
    "ctrl+shift+n, cmd+shift+n",
    (e) => {
      e.preventDefault();
      config.onNewProject?.();
    },
    { enableOnFormTags: false }
  );

  // Search: Ctrl/Cmd + K
  useHotkeys(
    "ctrl+k, cmd+k",
    (e) => {
      e.preventDefault();
      config.onSearch?.();
    },
    { enableOnFormTags: false }
  );

  // Toggle Sidebar: Ctrl/Cmd + B
  useHotkeys(
    "ctrl+b, cmd+b",
    (e) => {
      e.preventDefault();
      config.onToggleSidebar?.();
    },
    { enableOnFormTags: false }
  );

  // View Kanban: Ctrl/Cmd + 1
  useHotkeys(
    "ctrl+1, cmd+1",
    (e) => {
      e.preventDefault();
      config.onViewKanban?.();
    },
    { enableOnFormTags: false }
  );

  // View List: Ctrl/Cmd + 2
  useHotkeys(
    "ctrl+2, cmd+2",
    (e) => {
      e.preventDefault();
      config.onViewList?.();
    },
    { enableOnFormTags: false }
  );

  // View Table: Ctrl/Cmd + 3
  useHotkeys(
    "ctrl+3, cmd+3",
    (e) => {
      e.preventDefault();
      config.onViewTable?.();
    },
    { enableOnFormTags: false }
  );

  // View Timeline: Ctrl/Cmd + 4
  useHotkeys(
    "ctrl+4, cmd+4",
    (e) => {
      e.preventDefault();
      config.onViewTimeline?.();
    },
    { enableOnFormTags: false }
  );

  // Export: Ctrl/Cmd + E
  useHotkeys(
    "ctrl+e, cmd+e",
    (e) => {
      e.preventDefault();
      config.onExport?.();
    },
    { enableOnFormTags: false }
  );

  // Filter: Ctrl/Cmd + F
  useHotkeys(
    "ctrl+f, cmd+f",
    (e) => {
      e.preventDefault();
      config.onFilter?.();
    },
    { enableOnFormTags: false }
  );

  // Help: Ctrl/Cmd + /
  useHotkeys(
    "ctrl+slash, cmd+slash",
    (e) => {
      e.preventDefault();
      config.onHelp?.();
    },
    { enableOnFormTags: false }
  );
}

// Keyboard shortcuts help dialog content
export const keyboardShortcuts = [
  { key: "Ctrl/Cmd + N", description: "Nueva tarea" },
  { key: "Ctrl/Cmd + Shift + N", description: "Nuevo proyecto" },
  { key: "Ctrl/Cmd + K", description: "Buscar" },
  { key: "Ctrl/Cmd + B", description: "Mostrar/Ocultar sidebar" },
  { key: "Ctrl/Cmd + 1", description: "Vista Kanban" },
  { key: "Ctrl/Cmd + 2", description: "Vista Lista" },
  { key: "Ctrl/Cmd + 3", description: "Vista Tabla" },
  { key: "Ctrl/Cmd + 4", description: "Vista Timeline" },
  { key: "Ctrl/Cmd + E", description: "Exportar datos" },
  { key: "Ctrl/Cmd + F", description: "Filtros avanzados" },
  { key: "Ctrl/Cmd + /", description: "Mostrar atajos" },
  { key: "Esc", description: "Cerrar modal/diálogo" },
];
