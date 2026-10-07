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