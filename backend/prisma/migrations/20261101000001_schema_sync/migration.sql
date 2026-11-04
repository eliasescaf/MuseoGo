-- Puesta al día del esquema: la migración inicial no incluía varios campos
-- que ya existían en la base (se agregaron con `prisma db push`).
-- Todo es idempotente para poder aplicarse también sobre bases existentes.

-- Mision: campos de configuración de la misión
ALTER TABLE "Mision" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Mision" ADD COLUMN IF NOT EXISTS "objetoId" INTEGER;
ALTER TABLE "Mision" ADD COLUMN IF NOT EXISTS "opciones" TEXT;
ALTER TABLE "Mision" ADD COLUMN IF NOT EXISTS "puntos" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Mision" ADD COLUMN IF NOT EXISTS "respuestaCorrecta" TEXT;
ALTER TABLE "Mision" ADD COLUMN IF NOT EXISTS "tipo" TEXT;

UPDATE "Mision" SET "tipo" = 'EXPLICACION' WHERE "tipo" IS NULL;
ALTER TABLE "Mision" ALTER COLUMN "tipo" SET NOT NULL;

DO $$ BEGIN
    ALTER TABLE "Mision" ADD CONSTRAINT "Mision_objetoId_fkey"
        FOREIGN KEY ("objetoId") REFERENCES "Objeto"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Objeto: estado activo/inactivo
ALTER TABLE "Objeto" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;

-- Visitante: acumulado histórico de puntos
ALTER TABLE "Visitante" ADD COLUMN IF NOT EXISTS "puntosTotales" INTEGER NOT NULL DEFAULT 0;

-- CaminoCompletado: caminos terminados por visitante
CREATE TABLE IF NOT EXISTS "CaminoCompletado" (
    "id" SERIAL NOT NULL,
    "visitanteId" INTEGER NOT NULL,
    "caminoId" INTEGER NOT NULL,
    "puntosGanados" INTEGER NOT NULL,
    "completadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaminoCompletado_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CaminoCompletado_visitanteId_caminoId_key"
    ON "CaminoCompletado"("visitanteId", "caminoId");

DO $$ BEGIN
    ALTER TABLE "CaminoCompletado" ADD CONSTRAINT "CaminoCompletado_visitanteId_fkey"
        FOREIGN KEY ("visitanteId") REFERENCES "Visitante"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CaminoCompletado" ADD CONSTRAINT "CaminoCompletado_caminoId_fkey"
        FOREIGN KEY ("caminoId") REFERENCES "Camino"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
