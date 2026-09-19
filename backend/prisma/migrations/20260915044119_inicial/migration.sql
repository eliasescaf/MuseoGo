-- CreateTable
CREATE TABLE "Camino" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Camino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mision" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Mision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaminoMision" (
    "caminoId" INTEGER NOT NULL,
    "misionId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "CaminoMision_pkey" PRIMARY KEY ("caminoId","misionId")
);

-- CreateTable
CREATE TABLE "Objeto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "datosHistoricos" TEXT,
    "codigoQr" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitante" (
    "id" SERIAL NOT NULL,
    "alias" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Objeto_codigoQr_key" ON "Objeto"("codigoQr");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Visitante_alias_key" ON "Visitante"("alias");

-- AddForeignKey
ALTER TABLE "CaminoMision" ADD CONSTRAINT "CaminoMision_caminoId_fkey" FOREIGN KEY ("caminoId") REFERENCES "Camino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaminoMision" ADD CONSTRAINT "CaminoMision_misionId_fkey" FOREIGN KEY ("misionId") REFERENCES "Mision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
