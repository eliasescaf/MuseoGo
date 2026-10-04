import {Request, Response} from 'express';
import {prisma} from '../prisma';

export const getCaminos = async (req: Request, res: Response) => {
    try {
        const caminos = await prisma.camino.findMany();
        res.json(caminos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener los caminos'});
    }
}

export const createCamino = async (req: Request, res: Response) => {
    try{
        const {nombre, descripcion, duracion, activo, misiones} = req.body;
        if (!nombre || !descripcion) {
            return res.status(400).json({ message: "El nombre y la descripción son obligatorios" });
        }
        const nuevoCamino = await prisma.camino.create({
            data: {
                nombre,
                descripcion,
                duracion: duracion ? Number(duracion) : 0,
                activo: activo !== undefined ? activo : true,
                
                misiones: {
                    create: misiones.map((m: any) => ({
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
                misiones: {
                    include: { mision: true },
                    orderBy: { orden: 'asc' } 
                }
            }
        });

        if (!camino) {
            return res.status(404).json({ error: "Camino no encontrado" });
        }
        res.json(camino);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el camino" });
    }
}

export const updateCamino = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, duracion, activo, misiones } = req.body;
        const idNumerico = Number(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: "El ID proporcionado no es válido" });
        }

        const caminoActualizado = await prisma.camino.update({
            where: { id: idNumerico },
            data: {
                nombre,
                descripcion,
                duracion: duracion ? Number(duracion) : 0,
                activo: activo !== undefined ? activo : true,
                
                misiones: {
                    deleteMany: {}, 
                    create: misiones.map((m: any) => ({
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