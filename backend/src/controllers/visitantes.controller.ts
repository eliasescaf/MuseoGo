import {Request, Response} from 'express';
import {prisma} from '../prisma';
import {evaluarInsignias} from '../utils/insignias';

export const registrarVisitante = async (req: Request, res: Response) => {
    try{
        const {alias} = req.body;
        if(!alias || alias.trim() === ""){
            return res.status(400).json({message: "El alias es obligatorio"});
        }

        let visitante = await prisma.visitante.findUnique({
            where: {
                alias: alias.trim()
            }
        });

        if(!visitante){
            visitante = await prisma.visitante.create({
                data: {
                    alias: alias.trim()
                }
            });
        }

        res.status(200).json(visitante);
    }
    catch(error){
        console.error("Error al registrar visitante: ", error);
        res.status(500).json({error: "Hubo un error al ingresar"});
    }
}

// Resumen de progreso: puntos totales del visitante + caminos completados
export const obtenerProgreso = async (req: Request, res: Response) => {
    try {
        const visitanteId = parseInt(req.params.visitanteId as string);
        if (isNaN(visitanteId)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const visitante = await prisma.visitante.findUnique({
            where: { id: visitanteId },
            select: { id: true, alias: true, puntosTotales: true, createdAt: true }
        });

        if (!visitante) {
            return res.status(404).json({ error: "Visitante no encontrado" });
        }

        const caminosCompletados = await prisma.caminoCompletado.findMany({
            where: { visitanteId },
            include: { camino: { select: { id: true, nombre: true, descripcion: true, duracion: true } } },
            orderBy: { completadoEn: 'desc' }
        });

        return res.json({
            alias: visitante.alias,
            puntosTotales: visitante.puntosTotales,
            desde: visitante.createdAt,
            caminosCompletados: caminosCompletados.map((c: any) => ({
                caminoId: c.caminoId,
                nombre: c.camino?.nombre ?? 'Camino eliminado',
                descripcion: c.camino?.descripcion ?? null,
                duracion: c.camino?.duracion ?? null,
                puntosGanados: c.puntosGanados,
                completadoEn: c.completadoEn
            }))
        });
    } catch (error) {
        console.error("Error al obtener progreso: ", error);
        res.status(500).json({ error: "No se pudo obtener el progreso" });
    }
};

export const obtenerResultadosCamino = async (req: Request, res: Response) => {
    try {
        const visitanteId = parseInt(req.params.visitanteId as string);
        const caminoId = parseInt(req.params.caminoId as string);

        if (isNaN(visitanteId) || isNaN(caminoId)) {
            return res.status(400).json({ error: "IDs inválidos" });
        }

        const camino = await prisma.camino.findUnique({
            where: { id: caminoId },
            include: { misiones: { include: { mision: { select: { id: true, puntos: true } } } } }
        });

        if (!camino) {
            return res.status(404).json({ error: "Camino no encontrado" });
        }

        const misionIds = camino.misiones.map(m => m.misionId);
        // Mapa misiónId -> puntos máximos de la misión (para convertir el puntaje 0-100 a puntos reales)
        const puntosMision = new Map<number, number>(
            camino.misiones.map(m => [m.misionId, m.mision?.puntos ?? 0])
        );

        // La vuelta actual arranca cuando completó este camino por última vez.
        // Así las estadísticas y las insignias reflejan este recorrido y no todos
        // los intentos históricos (antes, repetir el camino impedía ganar insignias).
        const completadoPrevio = await prisma.caminoCompletado.findUnique({
            where: { visitanteId_caminoId: { visitanteId, caminoId } },
            select: { completadoEn: true, puntosGanados: true }
        });
        const desdeUltimaVuelta = completadoPrevio?.completadoEn ?? null;

        const intentosExitosos = await prisma.intentoMision.findMany({
            where: {
                visitanteId: visitanteId,
                misionId: { in: misionIds },
                correcto: true
            },
            distinct: ['misionId'],
            orderBy: { createdAt: 'desc' }
        });

        const todosLosIntentos = await prisma.intentoMision.findMany({
            where: {
                visitanteId: visitanteId,
                misionId: { in: misionIds }
            },
            orderBy: { createdAt: 'asc' }
        });

        // El intento guarda el puntaje de la IA (0-100); convertimos a puntos proporcionales.
        // Si el visitante usó la pista, se aplica la penalización del 30%.
        const puntosGanados = intentosExitosos.reduce((sum, intento) => {
            const factorPista = intento.usoPista ? 0.7 : 1;
            return sum + Math.round((puntosMision.get(intento.misionId) ?? 0) * intento.puntaje / 100 * factorPista);
        }, 0);
        const misionesCorrectas = intentosExitosos.length;
        const puntosPosibles = camino.misiones.reduce((sum, m) => sum + (m.mision?.puntos ?? 0), 0);

        // Estadísticas de la sesión para el resumen: solo los intentos de esta vuelta.
        const intentosDeLaVuelta = desdeUltimaVuelta
            ? todosLosIntentos.filter(i => i.createdAt > desdeUltimaVuelta)
            : todosLosIntentos;
        // Si ya había completado el camino pero la vuelta actual quedó a mitad
        // (empezó a repetirlo y no lo terminó), NO pisamos lo guardado: los
        // puntos y estadísticas de la vuelta anterior siguen siendo los válidos.
        const correctosEnVuelta = new Set(
            intentosDeLaVuelta.filter(i => i.correcto).map(i => i.misionId)
        );
        const esRevisita = !!completadoPrevio && intentosDeLaVuelta.length === 0;
        const vueltaIncompleta = !!completadoPrevio && !esRevisita && correctosEnVuelta.size < misionIds.length;
        const usarGuardados = !!completadoPrevio && (esRevisita || vueltaIncompleta);
        // Al reabrir los resultados de un camino ya completado no hay intentos nuevos:
        // usamos el acumulado para que la pantalla siga mostrando sus números.
        const intentosParaResumen = usarGuardados || intentosDeLaVuelta.length === 0
            ? todosLosIntentos
            : intentosDeLaVuelta;

        const pistasUsadas = intentosParaResumen.filter(i => i.usoPista).length;
        const intentosFallidos = intentosParaResumen.filter(i => !i.correcto).length;
        // Misión "perfecta": el primer intento de esa misión en la vuelta fue correcto
        // y con puntaje >= 70. Debajo de 70 la IA la considera parcial (aunque sume puntos),
        // así que no cuenta para esta insignia.
        const primerIntentoPorMision = new Map<number, (typeof intentosParaResumen)[number]>();
        for (const intento of intentosParaResumen) {
            if (!primerIntentoPorMision.has(intento.misionId)) {
                primerIntentoPorMision.set(intento.misionId, intento);
            }
        }
        const misionesPerfectas = [...primerIntentoPorMision.values()]
            .filter(i => i.correcto && i.puntaje >= 70).length;

        // Caminos que este camino desbloquea (VIS13)
        const desbloqueados = await prisma.camino.findMany({
            where: { caminoRequeridoId: caminoId, activo: true },
            select: { id: true, nombre: true, descripcion: true, duracion: true }
        });

        // Si es una revisita o la vuelta quedó a mitad, no movemos la fecha de
        // completado (inicio de la próxima vuelta) ni pisamos los puntos guardados.
        if (!usarGuardados) {
            await prisma.caminoCompletado.upsert({
                where: {
                    visitanteId_caminoId: { visitanteId, caminoId }
                },
                update: {
                    puntosGanados,
                    completadoEn: new Date()
                },
                create: {
                    visitanteId,
                    caminoId,
                    puntosGanados
                }
            });
        }

        const todosLosCaminos = await prisma.caminoCompletado.findMany({
            where: { visitanteId }
        });
        
        const puntosTotales = todosLosCaminos.reduce((sum, c) => sum + c.puntosGanados, 0);

        await prisma.visitante.update({
            where: { id: visitanteId },
            data: { puntosTotales }
        });

        // Insignias por estadísticas del camino (VIS11): se otorgan solo las nuevas
        const insigniasNuevas = await evaluarInsignias(visitanteId, caminoId, {
            pistasUsadas,
            intentosFallidos,
            misionesPerfectas,
            totalMisiones: misionIds.length
        });

        // Lo que se muestra: los puntos recalculados de la vuelta recién cerrada,
        // o los guardados si es una revisita / vuelta a mitad (así coinciden con
        // lo que lista Mi Progreso).
        const puntosGanadosMostrados = usarGuardados && completadoPrevio
            ? completadoPrevio.puntosGanados
            : puntosGanados;

        // Todas las insignias que este visitante ganó en ESTE camino (registradas
        // con este caminoId): así la pantalla de resultados siempre las muestra,
        // no solo cuando son recién otorgadas.
        const insigniasDelCamino = await prisma.insigniaVisitante.findMany({
            where: { visitanteId, caminoId },
            include: { insignia: { select: { id: true, nombre: true, descripcion: true } } },
            orderBy: { otorgadaEn: 'asc' }
        });
        const insigniasObtenidas = insigniasDelCamino.map(o => o.insignia);

        return res.json({
            camino: { titulo: camino.nombre },
            puntosGanados: puntosGanadosMostrados,
            puntosPosibles,
            misionesCorrectas,
            totalMisiones: misionIds.length,
            puntosTotalesHistoricos: puntosTotales,
            estadisticas: {
                pistasUsadas,
                intentosFallidos,
                misionesPerfectas
            },
            insigniasObtenidas,
            insigniasNuevas,
            desbloqueados
        });

    } catch (error) {
        console.error("Error al calcular resultados:", error);
        return res.status(500).json({ error: "Fallo al procesar resultados" });
    }
};