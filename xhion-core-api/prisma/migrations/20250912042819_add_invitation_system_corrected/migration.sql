-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('INVITADO', 'ACTIVO', 'INACTIVO');

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "estado" "public"."EstadoUsuario" NOT NULL DEFAULT 'INVITADO',
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."invitaciones" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "rol_id" UUID NOT NULL,
    "departamento_id" UUID,
    "token" VARCHAR(255) NOT NULL,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "fue_utilizada" BOOLEAN NOT NULL DEFAULT false,
    "invitado_por_id" UUID NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitaciones_token_key" ON "public"."invitaciones"("token");

-- AddForeignKey
ALTER TABLE "public"."invitaciones" ADD CONSTRAINT "invitaciones_invitado_por_id_fkey" FOREIGN KEY ("invitado_por_id") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitaciones" ADD CONSTRAINT "invitaciones_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitaciones" ADD CONSTRAINT "invitaciones_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "public"."Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
