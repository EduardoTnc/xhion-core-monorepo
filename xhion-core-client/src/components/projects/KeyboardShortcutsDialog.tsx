import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";
import { keyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atajos de Teclado
          </DialogTitle>
          <DialogDescription>
            Usa estos atajos para navegar más rápido por la aplicación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {keyboardShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <span className="text-sm">{shortcut.description}</span>
              <Badge variant="secondary" className="font-mono">
                {shortcut.key}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Presiona <Badge variant="outline" className="mx-1 font-mono">Esc</Badge> 
            para cerrar cualquier modal o diálogo abierto.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
