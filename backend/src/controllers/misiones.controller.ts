import {Request, Response} from 'express';
import {prisma} from '../prisma';

export const getMisiones = async(req: Request, res: Response) => {
    try{
        const misiones = await prisma.mision.findMany({include: {objeto: true}});
        res.json(misiones);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Error al obtener las misiones"});
    }
}

export const createMision = async(req: Request, res: Response) => {
    try{
        const {
            titulo,
            descripcion, 
            tipo,
            puntos,
            objetoId,
            opciones,
            respuestaCorrecta
        } = req.body;

        if (!titulo || !tipo) {
            return res.status(400).json({ message: "El título y el tipo son obligatorios" });
        }

        const nuevaMision = await prisma.mision.create({
            data: {
                titulo,
                descripcion: descripcion || null,
                tipo,
                puntos: puntos ? Number(puntos) : 10,
                objetoId: objetoId ? Number(objetoId) : null,
                opciones: opciones ? JSON.stringify(opciones) : null,
                respuestaCorrecta: respuestaCorrecta || null
            }
        });

        res.status(201).json(nuevaMision);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "No se pudo crear la misión"})
    }
}

export const getMisionById = async(req: Request, res: Response) => {
    try{
        const {id} = req.params;
        const mision = await prisma.mision.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                objeto: true
            }
        })

        if(!mision){
            return(
                res.status(404).json({error: "Mision no encontrada"})
            );
        }

        res.json(mision);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Error al obtener la misión"})
    }
}

export const updateMision = async(req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            titulo, 
            descripcion, 
            tipo, 
            puntos, 
            objetoId, 
            opciones, 
            respuestaCorrecta,
            activo 
        } = req.body;
        
        const idNumerico = Number(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: "El ID proporcionado no es válido" });
        }

        const misionActualizada = await prisma.mision.update({
            where: {
                id: idNumerico
            },
            data: {
                titulo,
                descripcion: descripcion || null,
                tipo,
                activo: activo !== undefined ? activo : true,
                puntos: puntos ? Number(puntos) : 10,
                objetoId: objetoId ? Number(objetoId) : null,
                opciones: opciones ? JSON.stringify(opciones) : null,
                respuestaCorrecta: respuestaCorrecta || null
            }
        });

        res.json(misionActualizada);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar una misión" });
    }
}

export const deleteMision = async (req: Request, res: Response) => {
    try{
        const {id} = req.params;

        await prisma.mision.delete({
            where: {
                id: Number(id)
            }
        })
        res.status(204).send();
    }
    catch(error: any){
        if(error.code === 'P2025'){
            return res.status(204).send();
        }
        console.error("Error al borrar: ", error);
        res.status(500).json({error: "Hubo un problema al eliminar la misión"});
    }
}
