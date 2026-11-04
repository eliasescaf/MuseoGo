-- Insignias: recompensas por logros (ADM20 / ADM21 / ADM22)
-- La condición se elige de una lista pre-armada (ADM21).

CREATE TABLE IF NOT EXISTS "Insignia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    -- SIN_PISTAS | PERFECTO | SIN_FALLOS
    "tipo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insignia_pkey" PRIMARY KEY ("id")
);

-- Insignias otorgadas a los visitantes (VIS11)
CREATE TABLE IF NOT EXISTS "InsigniaVisitante" (
    "id" SERIAL NOT NULL,
    "visitanteId" INTEGER NOT NULL,
    "insigniaId" INTEGER NOT NULL,
    "caminoId" INTEGER,
    "otorgadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsigniaVisitante_pkey" PRIMARY KEY ("id")
);

-- La insignia se otorga una sola vez por visitante
CREATE UNIQUE INDEX IF NOT EXISTS "InsigniaVisitante_visitanteId_insigniaId_key"
    ON "InsigniaVisitante"("visitanteId", "insigniaId");

DO $$ BEGIN
    ALTER TABLE "InsigniaVisitante" ADD CONSTRAINT "InsigniaVisitante_visitanteId_fkey"
        FOREIGN KEY ("visitanteId") REFERENCES "Visitante"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "InsigniaVisitante" ADD CONSTRAINT "InsigniaVisitante_insigniaId_fkey"
        FOREIGN KEY ("insigniaId") REFERENCES "Insignia"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "InsigniaVisitante" ADD CONSTRAINT "InsigniaVisitante_caminoId_fkey"
        FOREIGN KEY ("caminoId") REFERENCES "Camino"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
