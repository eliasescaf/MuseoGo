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
        const datos = req.body;
        const nuevoCamino = await prisma.camino.create({
            data: datos
        })

        res.status(201).json(nuevoCamino);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Error al crear un camino"});
    }
}

export const updateCamino = async (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        const datos = req.body;

        const caminoActualizado = await prisma.camino.update({
            where: {
                id: Number(id)
            },
            data: {
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                duracion: datos.duracion,
                activo: datos.activo
            }
        });

        res.json(caminoActualizado);
    }
    catch(error){
        console.error("Error al actualizar", error);
        res.status(500).json({error: "Hubo un problema al actualizar el camino"});
    }
}

export const deleteCamino = async (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        await prisma.camino.delete({
            where: {
                id: Number(id)
            }
        });

        res.status(204).send();
    }
    catch(error: any){
        if(error.code === 'P2025'){
            return res.status(204).send();
        }

        console.error("Error al eliminar", error);
        res.status(500).json({error: "Hubo un problema al borrar el camino"});
    }
}

export const getCaminoById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        
        const camino = await prisma.camino.findUnique({
            where: {id: Number(id)}
        })

        if(!camino){
            res.status(404).json({
                error: "Objeto no encontrado"
            })
        }
        res.json(camino);
    }
    catch(error){
        console.error("Error al buscar camino", error);
        res.status(500).json({error: "Hubo un problema al buscar un camino"});
    }
}