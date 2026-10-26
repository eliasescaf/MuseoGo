-- CreateTable
CREATE TABLE "IntentoMision" (
    "id" SERIAL NOT NULL,
    "visitanteId" INTEGER NOT NULL,
    "misionId" INTEGER NOT NULL,
    "respuesta" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "correcto" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "evaluadoPorIA" BOOLEAN NOT NULL DEFAULT false,
    "intentoNumero" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntentoMision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntentoMision_visitanteId_misionId_idx" ON "IntentoMision"("visitanteId", "misionId");

-- AddForeignKey
ALTER TABLE "IntentoMision" ADD CONSTRAINT "IntentoMision_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Visitante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntentoMision" ADD CONSTRAINT "IntentoMision_misionId_fkey" FOREIGN KEY ("misionId") REFERENCES "Mision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
