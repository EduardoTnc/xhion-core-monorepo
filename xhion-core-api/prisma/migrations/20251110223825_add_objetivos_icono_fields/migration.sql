-- AlterTable
ALTER TABLE "Departamento" ADD COLUMN     "icono" VARCHAR(50),
ADD COLUMN     "objetivos" TEXT;

-- AlterTable
ALTER TABLE "Proyecto" ADD COLUMN     "objetivos" TEXT;

-- AlterTable
ALTER TABLE "sesiones" ALTER COLUMN "fechaExpiracion" SET DEFAULT NOW() + INTERVAL '7 days';
