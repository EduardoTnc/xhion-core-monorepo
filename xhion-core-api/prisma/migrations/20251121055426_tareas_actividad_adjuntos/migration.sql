-- CreateEnum
CREATE TYPE "TipoActividadTarea" AS ENUM ('CREACION', 'ACTUALIZACION', 'COMENTARIO', 'RESPUESTA_COMENTARIO', 'ADJUNTO_AGREGADO', 'ADJUNTO_ELIMINADO', 'CAMBIO_ESTADO', 'CAMBIO_ETAPA');

-- AlterTable
ALTER TABLE "ArchivoAdjunto" ADD COLUMN     "descripcion" VARCHAR(255);

-- AlterTable
ALTER TABLE "sesiones" ALTER COLUMN "fechaExpiracion" SET DEFAULT NOW() + INTERVAL '7 days';

-- CreateTable
CREATE TABLE "TareaActividad" (
    "id" UUID NOT NULL,
    "tareaId" UUID NOT NULL,
    "tipoEvento" "TipoActividadTarea" NOT NULL,
    "descripcion" TEXT,
    "payload" JSONB,
    "comentarioId" UUID,
    "archivoId" UUID,
    "actividadPadreId" UUID,
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TareaActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TareaActividad_tareaId_idx" ON "TareaActividad"("tareaId");

-- CreateIndex
CREATE INDEX "TareaActividad_creadoPorId_idx" ON "TareaActividad"("creadoPorId");

-- AddForeignKey
ALTER TABLE "TareaActividad" ADD CONSTRAINT "TareaActividad_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaActividad" ADD CONSTRAINT "TareaActividad_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "Comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaActividad" ADD CONSTRAINT "TareaActividad_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaActividad" ADD CONSTRAINT "TareaActividad_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaActividad" ADD CONSTRAINT "TareaActividad_actividadPadreId_fkey" FOREIGN KEY ("actividadPadreId") REFERENCES "TareaActividad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
