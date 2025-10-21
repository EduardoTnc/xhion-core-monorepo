import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { type Tarea } from "@/services/taskService";
import { type Proyecto } from "@/services/projectService";

// Export tasks to PDF
export function exportTasksToPDF(tareas: Tarea[], proyecto: Proyecto) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Tareas del Proyecto: ${proyecto.nombre}`, 14, 20);

  // Project info
  doc.setFontSize(10);
  doc.text(`Estado: ${proyecto.estado}`, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 14, 36);

  // Table
  const tableData = tareas.map((tarea) => [
    tarea.titulo,
    tarea.estado.replace("_", " "),
    tarea.prioridad,
    tarea.asignado?.nombreCompleto || "Sin asignar",
    tarea.etapa?.nombre || "Sin etapa",
    tarea.fechaVencimiento
      ? new Date(tarea.fechaVencimiento).toLocaleDateString("es-ES")
      : "-",
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Título", "Estado", "Prioridad", "Asignado", "Etapa", "Vencimiento"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Save
  doc.save(`${proyecto.nombre}_tareas_${new Date().getTime()}.pdf`);
}

// Export tasks to Excel
export function exportTasksToExcel(tareas: Tarea[], proyecto: Proyecto) {
  const data = tareas.map((tarea) => ({
    Título: tarea.titulo,
    Descripción: tarea.descripcion || "",
    Estado: tarea.estado.replace("_", " "),
    Prioridad: tarea.prioridad,
    Asignado: tarea.asignado?.nombreCompleto || "Sin asignar",
    Email: tarea.asignado?.email || "",
    Etapa: tarea.etapa?.nombre || "Sin etapa",
    "Fecha Vencimiento": tarea.fechaVencimiento
      ? new Date(tarea.fechaVencimiento).toLocaleDateString("es-ES")
      : "",
    "Fecha Creación": new Date(tarea.fechaCreacion).toLocaleDateString("es-ES"),
    Comentarios: tarea._count?.comentarios || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tareas");

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${proyecto.nombre}_tareas_${new Date().getTime()}.xlsx`);
}

// Export tasks to CSV
export function exportTasksToCSV(tareas: Tarea[], proyecto: Proyecto) {
  const headers = [
    "Título",
    "Descripción",
    "Estado",
    "Prioridad",
    "Asignado",
    "Email",
    "Etapa",
    "Fecha Vencimiento",
    "Fecha Creación",
    "Comentarios",
  ];

  const rows = tareas.map((tarea) => [
    tarea.titulo,
    tarea.descripcion || "",
    tarea.estado.replace("_", " "),
    tarea.prioridad,
    tarea.asignado?.nombreCompleto || "Sin asignar",
    tarea.asignado?.email || "",
    tarea.etapa?.nombre || "Sin etapa",
    tarea.fechaVencimiento
      ? new Date(tarea.fechaVencimiento).toLocaleDateString("es-ES")
      : "",
    new Date(tarea.fechaCreacion).toLocaleDateString("es-ES"),
    tarea._count?.comentarios || 0,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${proyecto.nombre}_tareas_${new Date().getTime()}.csv`);
}

// Export project summary to PDF
export function exportProjectSummaryToPDF(proyecto: Proyecto, tareas: Tarea[]) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`Resumen del Proyecto`, 14, 20);

  // Project info
  doc.setFontSize(14);
  doc.text(proyecto.nombre, 14, 35);

  doc.setFontSize(10);
  let yPos = 45;

  if (proyecto.descripcion) {
    doc.text(`Descripción: ${proyecto.descripcion}`, 14, yPos);
    yPos += 10;
  }

  doc.text(`Estado: ${proyecto.estado.replace("_", " ")}`, 14, yPos);
  yPos += 6;

  doc.text(`Responsable: ${proyecto.responsable.nombreCompleto}`, 14, yPos);
  yPos += 6;

  if (proyecto.fechaInicio) {
    doc.text(
      `Fecha Inicio: ${new Date(proyecto.fechaInicio).toLocaleDateString("es-ES")}`,
      14,
      yPos
    );
    yPos += 6;
  }

  if (proyecto.fechaFin) {
    doc.text(
      `Fecha Fin: ${new Date(proyecto.fechaFin).toLocaleDateString("es-ES")}`,
      14,
      yPos
    );
    yPos += 6;
  }

  yPos += 10;

  // Statistics
  doc.setFontSize(12);
  doc.text("Estadísticas", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const stats = {
    "Total de Tareas": tareas.length,
    "Por Hacer": tareas.filter((t) => t.estado === "Por_Hacer").length,
    "En Progreso": tareas.filter((t) => t.estado === "En_Progreso").length,
    Completadas: tareas.filter((t) => t.estado === "Hecho").length,
    Bloqueadas: tareas.filter((t) => t.estado === "Bloqueado").length,
    "Prioridad Alta": tareas.filter((t) => t.prioridad === "Alta").length,
    "Prioridad Urgente": tareas.filter((t) => t.prioridad === "Urgente").length,
  };

  Object.entries(stats).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 14, yPos);
    yPos += 6;
  });

  // Tasks table
  yPos += 10;
  const tableData = tareas.slice(0, 20).map((tarea) => [
    tarea.titulo.substring(0, 40),
    tarea.estado.replace("_", " "),
    tarea.prioridad,
    tarea.asignado?.nombreCompleto || "Sin asignar",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Título", "Estado", "Prioridad", "Asignado"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  if (tareas.length > 20) {
    doc.text(`... y ${tareas.length - 20} tareas más`, 14, (doc as any).lastAutoTable.finalY + 10);
  }

  doc.save(`${proyecto.nombre}_resumen_${new Date().getTime()}.pdf`);
}
