-- Multijugador (ADM23 / GRP01-GRP04): configuración y salas de exploración

-- Configuración global por clave/valor. Multijugador deshabilitado por defecto.
CREATE TABLE IF NOT EXISTS "Configuracion" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("clave")
);

INSERT INTO "Configuracion" ("clave", "valor")
VALUES ('MULTIJUGADOR', 'OFF')
ON CONFLICT ("clave") DO NOTHING;

-- Sala de exploración: un anfitrión crea la sala de un camino con PIN único
CREATE TABLE IF NOT EXISTS "Sala" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "caminoId" INTEGER NOT NULL,
    "hostVisitanteId" INTEGER NOT NULL,
    -- ESPERANDO | EN_JUEGO | FINALIZADA
    "estado" TEXT NOT NULL DEFAULT 'ESPERANDO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadaEn" TIMESTAMP(3),

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Sala_codigo_key" ON "Sala"("codigo");

DO $$ BEGIN
    ALTER TABLE "Sala" ADD CONSTRAINT "Sala_caminoId_fkey"
        FOREIGN KEY ("caminoId") REFERENCES "Camino"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Sala" ADD CONSTRAINT "Sala_hostVisitanteId_fkey"
        FOREIGN KEY ("hostVisitanteId") REFERENCES "Visitante"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Participantes de la sala (el anfitrión también se agrega como participante)
CREATE TABLE IF NOT EXISTS "SalaVisitante" (
    "id" SERIAL NOT NULL,
    "salaId" INTEGER NOT NULL,
    "visitanteId" INTEGER NOT NULL,
    "unidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaVisitante_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SalaVisitante_salaId_visitanteId_key"
    ON "SalaVisitante"("salaId", "visitanteId");

DO $$ BEGIN
    ALTER TABLE "SalaVisitante" ADD CONSTRAINT "SalaVisitante_salaId_fkey"
        FOREIGN KEY ("salaId") REFERENCES "Sala"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "SalaVisitante" ADD CONSTRAINT "SalaVisitante_visitanteId_fkey"
        FOREIGN KEY ("visitanteId") REFERENCES "Visitante"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
