import {Request, Response} from 'express';
import {prisma} from '../prisma'
import bcrypt from 'bcrypt';

export const loginAdmin = async (req: Request, res: Response) => {
    try{
        const {identificador, password} = req.body;
        if(!identificador || identificador.trim() === "" || !password || password.trim() === ""){
            return res.status(400).json({message: "La credencial y password son obligatorias"});
        }

        let admin = await prisma.administrador.findFirst({
            where: {
                OR: [
                    {nombre: identificador.trim()},
                    {email: identificador.trim()}
                ],
            }
        });

        if(!admin){
            return res.status(401).json({error: "Credenciales incorrectas"});
        }

        const passwordMatch = await bcrypt.compare(password.trim(), admin.password);
        if(!passwordMatch){
            return res.status(401).json({error: "Credenciales incorrectas"});
        }

        res.status(200).json({
            id: admin.id,
            nonbre: admin.nombre,
            email: admin.email
        });


    }catch(error){
        console.error("Error al loguear admin: ", error);
        res.status(500).json({error: "Hubo un error al ingresar"});
    }
}