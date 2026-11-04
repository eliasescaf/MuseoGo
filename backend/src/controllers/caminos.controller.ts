import {Request, Response} from 'express';
import {prisma} from '../prisma';
import { calcularDificultad } from '../utils/dificultad';

const parsearIdVisitante = (valor: unknown): number | null => {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
};

export const getCaminos = async (req: Request, res: Response) => {
    try {
        const caminos = await prisma.camino.findMany({
            include: {
                _count: { select: { misiones: true } },
                // El nombre del camino requerido, para avisos de bloqueo precisos
                caminoRequerido: { select: { id: true, nombre: true } }
            }
        });

        const visitanteId = parsearIdVisitante(req.query.visitanteId);
        const completados = visitanteId
            ? await prisma.caminoCompletado.findMany({
                where: { visitanteId },
                select: { caminoId: true }
            })
            : [];
        const idsCompletados = new Set(completados.map(c => c.caminoId));

        res.json(caminos.map(camino => {
            const bloqueado = !!camino.caminoRequeridoId && !idsCompletados.has(camino.caminoRequeridoId);
            return {
                ...camino,
                dificultad: calcularDificultad(camino.duracion, camino._count.misiones),
                bloqueado,
                completado: idsCompletados.has(camino.id)
            };
        }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener los caminos'});
    }
}

export const createCamino = async (req: Request, res: Response) => {
    try{
        const {nombre, descripcion, duracion, activo, misiones, caminoRequeridoId} = req.body;
        if (!nombre || !descripcion) {
            return res.status(400).json({ message: "El nombre y la descripción son obligatorios" });
        }
        const nuevoCamino = await prisma.camino.create({
            data: {
                nombre,
                descripcion,
                duracion: duracion ? Number(duracion) : 0,
                activo: activo !== undefined ? activo : true,
                caminoRequeridoId: caminoRequeridoId ? Number(caminoRequeridoId) : null,
                
                misiones: {
                    create: (misiones ?? []).map((m: any) => ({
                        misionId: m.misionId,
                        orden: m.orden
                    }))
                }
            }
        });

        res.status(201).json(nuevoCamino);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Error al crear un camino"});
    }
}

export const getCaminoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const camino = await prisma.camino.findUnique({
            where: { id: Number(id) },
            include: {
                caminoRequerido: {
                    select: { id: true, nombre: true }
                },
                misiones: {
                    include: { 
                        mision: {
                            include: {
                                objeto: true 
                            }
                        }
                    },
                    orderBy: { orden: 'asc' } 
                }
            }
        });

        if (!camino) {
            return res.status(404).json({ error: "Camino no encontrado" });
        }

        const visitanteId = parsearIdVisitante(req.query.visitanteId);
        const completados = visitanteId
            ? await prisma.caminoCompletado.findMany({
                where: { visitanteId },
                select: { caminoId: true }
            })
            : [];
        const idsCompletados = new Set(completados.map(c => c.caminoId));

        res.json({
            ...camino,
            dificultad: calcularDificultad(camino.duracion, camino.misiones.length),
            bloqueado: !!camino.caminoRequeridoId && !idsCompletados.has(camino.caminoRequeridoId),
            completado: idsCompletados.has(camino.id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el camino" });
    }
}

export const duplicarCamino = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idOrigen = Number(id);
        if (isNaN(idOrigen)) {
            return res.status(400).json({ error: "El ID proporcionado no es válido" });
        }

        const origen = await prisma.camino.findUnique({
            where: { id: idOrigen },
            include: { misiones: { orderBy: { orden: 'asc' } } }
        });

        if (!origen) {
            return res.status(404).json({ error: "Camino no encontrado" });
        }

        const copia = await prisma.camino.create({
            data: {
                nombre: `${origen.nombre} (Copia)`,
                descripcion: origen.descripcion,
                duracion: origen.duracion,
                // Se crea inactivo: el admin la ajusta y la activa cuando quiera
                activo: false,
                // No hereda el camino requerido: cada variante define su propio desbloqueo
                caminoRequeridoId: null,
                misiones: {
                    create: origen.misiones.map(m => ({
                        misionId: m.misionId,
                        orden: m.orden
                    }))
                }
            }
        });

        res.status(201).json(copia);
    } catch (error) {
        console.error("Error al duplicar el camino:", error);
        res.status(500).json({ message: "Error al duplicar el camino" });
    }
}

export const updateCamino = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, duracion, activo, misiones, caminoRequeridoId } = req.body;
        const idNumerico = Number(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: "El ID proporcionado no es válido" });
        }

        if (caminoRequeridoId && Number(caminoRequeridoId) === idNumerico) {
            return res.status(400).json({ error: "Un camino no puede requerirse a sí mismo" });
        }

        // Evitamos ciclos de desbloqueo (A requiere B y B requiere A)
        if (caminoRequeridoId) {
            const visitados = new Set<number>();
            let actual: number | null = Number(caminoRequeridoId);
            while (actual) {
                if (actual === idNumerico) {
                    return res.status(400).json({ error: "El desbloqueo generaría un ciclo entre caminos" });
                }
                if (visitados.has(actual)) break;
                visitados.add(actual);
                const requerido: { caminoRequeridoId: number | null } | null = await prisma.camino.findUnique({
                    where: { id: actual },
                    select: { caminoRequeridoId: true }
                });
                actual = requerido?.caminoRequeridoId ?? null;
            }
        }

        const caminoActualizado = await prisma.camino.update({
            where: { id: idNumerico },
            data: {
                nombre,
                descripcion,
                duracion: duracion ? Number(duracion) : 0,
                activo: activo !== undefined ? activo : true,
                caminoRequeridoId: caminoRequeridoId ? Number(caminoRequeridoId) : null,
                
                misiones: {
                    deleteMany: {}, 
                    create: (misiones ?? []).map((m: any) => ({
                        misionId: m.misionId,
                        orden: m.orden
                    }))
                }
            }
        });

        res.json(caminoActualizado);
    } catch (error) {
        console.error("Error al actualizar el camino:", error);
        res.status(500).json({ message: "Error al actualizar el camino" });
    }
}

export const deleteCamino = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.camino.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(204).send();
        console.error("Error al borrar:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar el camino" });
    }
}