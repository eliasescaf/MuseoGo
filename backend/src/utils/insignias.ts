// Evaluación de insignias al cerrar un camino (VIS11).
// Las condiciones son pre-armadas (ADM21): el admin solo elige el tipo.
import { prisma } from '../prisma';

export type EstadisticasCamino = {
    pistasUsadas: number;
    intentosFallidos: number;
    misionesPerfectas: number;
    totalMisiones: number;
};

const cumpleCondicion = (tipo: string, stats: EstadisticasCamino): boolean => {
    switch (tipo) {
        // Resolvió todo el camino sin pedir pistas
        case 'SIN_PISTAS':
            return stats.pistasUsadas === 0;
        // Todas las misiones al primer intento o con puntaje perfecto de la IA
        case 'PERFECTO':
            return stats.totalMisiones > 0 && stats.misionesPerfectas === stats.totalMisiones;
        // Ningún intento fallido en todo el camino
        case 'SIN_FALLOS':
            return stats.intentosFallidos === 0;
        default:
            return false;
    }
};

// Evalúa las insignias activas contra las estadísticas del camino cerrado.
// Devuelve únicamente las recién otorgadas (la restricción única
// visitante+insignia impide otorgar la misma dos veces).
export const evaluarInsignias = async (
    visitanteId: number,
    caminoId: number,
    stats: EstadisticasCamino
): Promise<Array<{ id: number; nombre: string; descripcion: string }>> => {
    const insigniasActivas = await prisma.insignia.findMany({ where: { activo: true } });
    const yaOtorgadas = await prisma.insigniaVisitante.findMany({
        where: { visitanteId },
        select: { insigniaId: true }
    });
    const idsYaOtorgadas = new Set(yaOtorgadas.map(o => o.insigniaId));

    const otorgadas: Array<{ id: number; nombre: string; descripcion: string }> = [];
    for (const insignia of insigniasActivas) {
        if (idsYaOtorgadas.has(insignia.id)) continue;
        if (!cumpleCondicion(insignia.tipo, stats)) continue;

        await prisma.insigniaVisitante.create({
            data: { visitanteId, insigniaId: insignia.id, caminoId }
        });
        otorgadas.push({
            id: insignia.id,
            nombre: insignia.nombre,
            descripcion: insignia.descripcion
        });
    }

    return otorgadas;
};
