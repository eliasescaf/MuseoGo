import {Request, Response} from 'express';
import {prisma} from '../prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const consultaGuiaVirtual = async (req: Request, res: Response) => {
    try {
        const {objetoId, preguntaUsuario} = req.body;
        const objeto = await prisma.objeto.findUnique({
            where: {
                id: Number(objetoId)
            }
        })

        if(!objeto){
            return res.status(404).json({error: "Objeto no encontrado"});
        }

        const promptSistema = `
            Sos un guía de museo experto, amable y conciso.
            El visitante está actualmente mirando esta pieza: "${objeto.nombre}"

            Información de la pieza:
            - Descripcion: ${objeto.descripcion}
            - Datos historicos: ${objeto.datosHistoricos || "No hay datos historicos registrados"}

            Reglas:
            1. Respondé a la pregunta del usuario basandote UNICAMENTE en la información provista arriba.
            2. Si la pregunta no tiene nada que ver con el museo o con los objetos, respondé amablemente que no te crearon para responder esa pregunta.
            3. Utiliza como máximo 3 parrafos para responder. No inventes información.

        `

        const completacion = await openai.chat.completions.create({
            model: "dots-studio/dots-3-note-preview:free",
            messages: [
                {role: "system", content: promptSistema},
                {role: "user", content: preguntaUsuario}
            ]
        })

        const respuestaIa = completacion.choices[0].message.content;
        res.json({respuesta: respuestaIa});
    }
    catch(error){
        console.error("Error en OpenRouter", error);
        res.status(500).json({error: "El guía virtual esta en reposo"});
    }
}