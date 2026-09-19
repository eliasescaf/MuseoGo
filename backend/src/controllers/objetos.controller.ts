import {Response, Request} from 'express';
import {prisma} from '../prisma';

export const getObjetos = async (req: Request, res: Response) => {
    try {
        const objetos = await prisma.objeto.findMany();
        res.json(objetos);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Error al obtener los objetos'});
    }
} 

export const createObjeto = async (req: Request, res: Response) => {
    try{
        const datos = req.body;
        const nuevoObjeto = await prisma.objeto.create({
            data: datos
        });
        
        res.status(201).json(nuevoObjeto);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Error al crear un objeto'});
    }
}

export const getObjetoById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        const objeto = await prisma.objeto.findUnique({
            where: {
                id: Number(id)
            }
        })

        if(!objeto){
            return res.status(404).json({
                error: "Objeto no encontrado"
            })
        }
        res.json(objeto);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Error al obtener el objeto"});
    }
}


export const updateObjeto = async (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        const datos = req.body;
        const idNumerico = Number(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: "El ID proporcionado no es válido" });
        }

        const objetoActualizado = await prisma.objeto.update({
            where: {id: idNumerico},
            data: {
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                datosHistoricos: datos.datosHistoricos,
                ...(datos.imagenUrl && {imagenUrl: datos.imagenUrl})
            }
        });

        res.json(objetoActualizado);
    }
    catch(error){
        console.error("Error al actualizar: ", error);
        res.status(500).json({error: "Hubo un problema al actualizar objeto"});
    }
}

export const deleteObjeto = async (req: Request, res: Response) => {
    try{
        const {id} = req.params;

        await prisma.objeto.delete({
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
        res.status(500).json({error: "Hubo un problema al eliminar el objeto"});
    }
}
