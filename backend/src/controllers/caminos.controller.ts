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