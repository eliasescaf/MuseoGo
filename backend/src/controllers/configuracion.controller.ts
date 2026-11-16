import {Request, Response} from 'express';
import {prisma} from '../prisma';

// Configuración global por clave (ADM23). Por defecto, deshabilitado.
export const getConfiguracion = async (req: Request, res: Response) => {
    try {
        const clave = typeof req.params.clave === 'string' ? req.params.clave : undefined;
        if (clave) {
            const item = await prisma.configuracion.findUnique({ where: { clave } });
            return res.json({ clave, valor: item?.valor ?? 'OFF' });
        }
        const todos = await prisma.configuracion.findMany();
        res.json(todos);
    } catch (error) {
        console.error("Error al leer la configuración:", error);
        res.status(500).json({error: "Error al leer la configuración"});
    }
}

export const setConfiguracion = async (req: Request, res: Response) => {
    try {
        const {clave, valor} = req.body;
        if (!clave || typeof valor !== 'string') {
            return res.status(400).json({error: "Se requieren clave y valor"});
        }
        const item = await prisma.configuracion.upsert({
            where: { clave },
            update: { valor },
            create: { clave, valor }
        });
        res.json(item);
    } catch (error) {
        console.error("Error al guardar la configuración:", error);
        res.status(500).json({error: "Error al guardar la configuración"});
    }
}
