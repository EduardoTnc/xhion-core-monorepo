-- CreateTable
CREATE TABLE "public"."sesiones" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "refreshTokenHash" VARCHAR(255) NOT NULL,
    "user_agent" TEXT,
    "direccion_ip" VARCHAR(45),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimoUso" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_refreshTokenHash_key" ON "public"."sesiones"("refreshTokenHash");

-- AddForeignKey
ALTER TABLE "public"."sesiones" ADD CONSTRAINT "sesiones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
