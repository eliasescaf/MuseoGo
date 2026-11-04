// Dificultad calculada de un camino: la define el factor más exigente (regla OR)
// entre la duración estimada y la cantidad de misiones. No se guarda en la DB,
// se deriva en cada consulta.
export type Dificultad = "BAJA" | "MEDIA" | "ALTA";

const indiceDuracion = (duracion: number): number => {
    if (!duracion || duracion <= 15) return 1;
    if (duracion <= 30) return 2;
    return 3;
};

const indiceMisiones = (cantidadMisiones: number): number => {
    if (cantidadMisiones <= 2) return 1;
    if (cantidadMisiones <= 4) return 2;
    return 3;
};

export const calcularDificultad = (duracion: number, cantidadMisiones: number): Dificultad => {
    // OR: la dificultad la determina el factor más alto de los dos,
    // sin promediar (un camino largo es exigente aunque tenga pocas misiones)
    const indice = Math.max(indiceDuracion(duracion), indiceMisiones(cantidadMisiones));
    if (indice === 1) return "BAJA";
    if (indice === 2) return "MEDIA";
    return "ALTA";
};
