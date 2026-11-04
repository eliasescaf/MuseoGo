-- Pistas por misión (ADM14 / VIS08)
ALTER TABLE "Mision" ADD COLUMN "pista" TEXT;

-- Registro de uso de pista con penalización (VIS08)
ALTER TABLE "IntentoMision" ADD COLUMN "usoPista" BOOLEAN NOT NULL DEFAULT false;

-- Desbloqueo encadenado de caminos (ADM22 / VIS13)
ALTER TABLE "Camino" ADD COLUMN "caminoRequeridoId" INTEGER;
ALTER TABLE "Camino" ADD CONSTRAINT "Camino_caminoRequeridoId_fkey"
  FOREIGN KEY ("caminoRequeridoId") REFERENCES "Camino"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
