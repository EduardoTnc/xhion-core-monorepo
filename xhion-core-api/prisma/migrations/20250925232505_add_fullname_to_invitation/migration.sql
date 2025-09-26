-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EstadoUsuario" ADD VALUE 'SUSPENDIDO';
ALTER TYPE "public"."EstadoUsuario" ADD VALUE 'BLOQUEADO';
ALTER TYPE "public"."EstadoUsuario" ADD VALUE 'ELIMINADO';

-- AlterTable
ALTER TABLE "public"."invitaciones" ADD COLUMN     "nombre_completo" VARCHAR(100) NOT NULL DEFAULT 'Desconocido';
