// Dificultad calculada de un camino: promedio entre la duración estimada
// y la cantidad de misiones. No se guarda en la DB, se deriva en cada consulta.
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
    const promedio = (indiceDuracion(duracion) + indiceMisiones(cantidadMisiones)) / 2;
    if (promedio <= 1.5) return "BAJA";
    if (promedio <= 2.5) return "MEDIA";
    return "ALTA";
};
