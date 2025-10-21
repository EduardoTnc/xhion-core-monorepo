import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react";
import { type Tarea } from "@/services/taskService";
import { type Proyecto } from "@/services/projectService";
import {
  exportTasksToPDF,
  exportTasksToExcel,
  exportTasksToCSV,
  exportProjectSummaryToPDF,
} from "@/lib/exportUtils";
import { toast } from "sonner";

interface ExportMenuProps {
  tareas: Tarea[];
  proyecto: Proyecto;
}

export function ExportMenu({ tareas, proyecto }: ExportMenuProps) {
  const handleExport = async (format: "pdf" | "excel" | "csv" | "summary") => {
    try {
      switch (format) {
        case "pdf":
          exportTasksToPDF(tareas, proyecto);
          toast.success("Tareas exportadas a PDF");
          break;
        case "excel":
          exportTasksToExcel(tareas, proyecto);
          toast.success("Tareas exportadas a Excel");
          break;
        case "csv":
          exportTasksToCSV(tareas, proyecto);
          toast.success("Tareas exportadas a CSV");
          break;
        case "summary":
          exportProjectSummaryToPDF(proyecto, tareas);
          toast.success("Resumen del proyecto exportado");
          break;
      }
    } catch (error) {
      toast.error("Error al exportar datos");
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar Tareas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar a PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar a Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileJson className="mr-2 h-4 w-4" />
          Exportar a CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Resumen del Proyecto</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("summary")}>
          <FileText className="mr-2 h-4 w-4" />
          Resumen en PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
