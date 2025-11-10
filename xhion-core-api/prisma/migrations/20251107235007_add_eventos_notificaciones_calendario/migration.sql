-- AlterTable
ALTER TABLE "sesiones" ALTER COLUMN "fechaExpiracion" SET DEFAULT NOW() + INTERVAL '7 days';
