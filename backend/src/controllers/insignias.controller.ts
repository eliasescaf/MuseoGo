import {Request, Response} from 'express';
import {prisma} from '../prisma';

// Los tipos debían coincidir con las condiciones que evalúa el backend (utils/insignias.ts)
export const TIPOS_INSIGNIA = ['SIN_PISTAS', 'PERFECTO', 'SIN_FALLOS'] as const;

export const getTiposInsignia = async (req: Request, res: Response) => {
    res.json(TIPOS_INSIGNIA);
}

export const getInsignias = async (req: Request, res: Response) => {
    try {
        const insignias = await prisma.insignia.findMany({
            orderBy: { createdAt: 'asc' },
            include: { _count: { select: { otorgadas: true } } }
        });
        res.json(insignias);
    } catch (error) {
        console.error("Error al listar insignias:", error);
        res.status(500).json({error: "Error al obtener las insignias"});
    }
}

// Insignias ganadas por un visitante (para su progreso)
export const getInsigniasVisitante = async (req: Request, res: Response) => {
    try {
        const visitanteId = parseInt(req.params.visitanteId as string);
        if (isNaN(visitanteId)) {
            return res.status(400).json({error: "IDs inválidos"});
        }
        const ganadas = await prisma.insigniaVisitante.findMany({
            where: { visitanteId },
            include: { insignia: true },
            orderBy: { otorgadaEn: 'desc' }
        });
        res.json(ganadas.map(g => ({
            id: g.insignia.id,
            nombre: g.insignia.nombre,
            descripcion: g.insignia.descripcion,
            tipo: g.insignia.tipo,
            otorgadaEn: g.otorgadaEn
        })));
    } catch (error) {
        console.error("Error al obtener insignias del visitante:", error);
        res.status(500).json({error: "Error al obtener las insignias del visitante"});
    }
}

export const createInsignia = async (req: Request, res: Response) => {
    try {
        const {nombre, descripcion, tipo, activo} = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).json({error: "El nombre y la descripción son obligatorios"});
        }
        if (!TIPOS_INSIGNIA.includes(tipo)) {
            return res.status(400).json({error: "La condición elegida no es válida"});
        }

        const insignia = await prisma.insignia.create({
            data: {
                nombre,
                descripcion,
                tipo,
                activo: activo !== undefined ? activo : true
            }
        });
        res.status(201).json(insignia);
    } catch (error) {
        console.error("Error al crear insignia:", error);
        res.status(500).json({error: "Error al crear la insignia"});
    }
}

export const updateInsignia = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {nombre, descripcion, tipo, activo} = req.body;
        const idNumerico = Number(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({error: "El ID proporcionado no es válido"});
        }
        if (tipo !== undefined && !TIPOS_INSIGNIA.includes(tipo)) {
            return res.status(400).json({error: "La condición elegida no es válida"});
        }

        const insignia = await prisma.insignia.update({
            where: {id: idNumerico},
            data: {
                ...(nombre !== undefined && {nombre}),
                ...(descripcion !== undefined && {descripcion}),
                ...(tipo !== undefined && {tipo}),
                ...(activo !== undefined && {activo})
            }
        });
        res.json(insignia);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({error: "Insignia no encontrada"});
        }
        console.error("Error al actualizar insignia:", error);
        res.status(500).json({error: "Error al actualizar la insignia"});
    }
}

export const deleteInsignia = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        await prisma.insignia.delete({
            where: {id: Number(id)}
        });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(204).send();
        console.error("Error al eliminar insignia:", error);
        res.status(500).json({error: "Error al eliminar la insignia"});
    }
}
