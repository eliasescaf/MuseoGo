import {Request, Response} from 'express';
import {prisma} from '../prisma';

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
        const visitanteId = parseInt(req.params.visitanteId);
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
        const visitanteId = parseInt(req.params.visitanteId);
        const caminoId = parseInt(req.params.caminoId);

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

        const intentosExitosos = await prisma.intentoMision.findMany({
            where: {
                visitanteId: visitanteId,
                misionId: { in: misionIds },
                correcto: true
            },
            distinct: ['misionId'],
            orderBy: { createdAt: 'desc' }
        });

        // El intento guarda el puntaje de la IA (0-100); convertimos a puntos proporcionales
        const puntosGanados = intentosExitosos.reduce(
            (sum, intento) => sum + Math.round((puntosMision.get(intento.misionId) ?? 0) * intento.puntaje / 100),
            0
        );
        const misionesCorrectas = intentosExitosos.length;

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

        const todosLosCaminos = await prisma.caminoCompletado.findMany({
            where: { visitanteId }
        });
        
        const puntosTotales = todosLosCaminos.reduce((sum, c) => sum + c.puntosGanados, 0);

        await prisma.visitante.update({
            where: { id: visitanteId },
            data: { puntosTotales }
        });

        return res.json({
            camino: { titulo: camino.nombre },
            puntosGanados,
            misionesCorrectas,
            totalMisiones: misionIds.length,
            puntosTotalesHistoricos: puntosTotales
        });

    } catch (error) {
        console.error("Error al calcular resultados:", error);
        return res.status(500).json({ error: "Fallo al procesar resultados" });
    }
};