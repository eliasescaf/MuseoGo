import { Request, Response } from "express";
import { prisma } from "../prisma";
import { evaluarRespuestaAbierta } from "../ai/evaluador";

const TIPOS_RESPUESTA_ABIERTA = new Set(["EXPLICACION", "ACERTIJO"]);
const MAX_CARACTERES_RESPUESTA = 1500;

type ResultadoIntento = {
    puntaje: number;
    correcto: boolean;
    feedback: string;
    evaluadoPorIA: boolean;
};

export const evaluarRespuesta = async (req: Request, res: Response) => {
    try {
        const { visitanteId, misionId, respuesta } = req.body ?? {};

        const visitanteNumerico = Number(visitanteId);
        const misionNumerica = Number(misionId);
        const textoRespuesta = typeof respuesta === "string" ? respuesta.trim() : "";

        if (!Number.isInteger(visitanteNumerico) || visitanteNumerico <= 0) {
            return res.status(400).json({ error: "El visitanteId no es válido" });
        }

        if (!Number.isInteger(misionNumerica) || misionNumerica <= 0) {
            return res.status(400).json({ error: "El misionId no es válido" });
        }

        if (!textoRespuesta) {
            return res.status(400).json({ error: "La respuesta es obligatoria" });
        }

        if (textoRespuesta.length > MAX_CARACTERES_RESPUESTA) {
            return res.status(400).json({
                error: `La respuesta no puede superar los ${MAX_CARACTERES_RESPUESTA} caracteres`,
            });
        }

        const [visitante, mision] = await Promise.all([
            prisma.visitante.findUnique({
                where: { id: visitanteNumerico },
            }),
            prisma.mision.findUnique({
                where: { id: misionNumerica },
                include: { objeto: true },
            }),
        ]);

        if (!visitante) {
            return res.status(404).json({ error: "Visitante no encontrado" });
        }

        if (!mision) {
            return res.status(404).json({ error: "Misión no encontrada" });
        }

        if (!mision.activo) {
            return res.status(400).json({ error: "La misión está desactivada" });
        }

        const intentosPrevios = await prisma.intentoMision.count({
            where: {
                visitanteId: visitanteNumerico,
                misionId: misionNumerica,
            },
        });

        let resultado: ResultadoIntento;

        if (mision.tipo === "QR_OBJETO") {
            resultado = evaluarQR(mision.objeto, mision.objetoId, textoRespuesta);
        } else if (TIPOS_RESPUESTA_ABIERTA.has(mision.tipo)) {
            const contextoObjeto = [
                mision.objeto?.nombre
                    ? `Objeto: ${mision.objeto.nombre}`
                    : null,
                mision.objeto?.descripcion,
                mision.objeto?.datosHistoricos,
            ]
                .filter(Boolean)
                .join("\n");

            resultado = await evaluarRespuestaAbierta({
                titulo: mision.titulo,
                consigna: mision.descripcion ?? "",
                respuestaEsperada: mision.respuestaCorrecta ?? "",
                contextoObjeto,
                respuestaVisitante: textoRespuesta,
            });
        } else if (mision.tipo === "TRIVIA") {
            resultado = evaluarTrivia(mision, textoRespuesta);
        } else {
            return res.status(400).json({
                error: "Este tipo de misión no se evalúa con una respuesta de texto",
            });
        }

        const intento = await prisma.intentoMision.create({
            data: {
                visitanteId: visitanteNumerico,
                misionId: misionNumerica,
                respuesta: textoRespuesta,
                puntaje: resultado.puntaje,
                correcto: resultado.correcto,
                feedback: resultado.feedback,
                evaluadoPorIA: resultado.evaluadoPorIA,
                intentoNumero: intentosPrevios + 1,
            },
        });

        return res.json({
            intentoId: intento.id,
            intentoNumero: intento.intentoNumero,
            puntaje: intento.puntaje,
            correcto: intento.correcto,
            feedback: intento.feedback,
            evaluadoPorIA: intento.evaluadoPorIA,
        });
    } catch (error) {
        console.error("Error al evaluar la respuesta:", error);
        return res.status(500).json({ error: "No se pudo evaluar la respuesta" });
    }
};

// Valida el código leído del QR del objeto; cierra la misión (evaluación única)
function evaluarQR(
    objeto: { codigoQr: string | null } | null,
    objetoId: number | null,
    lecturaQR: string
): ResultadoIntento {
    const codigoEsperado = (objeto?.codigoQr ?? "").trim().toUpperCase();
    const leido = (lecturaQR || "").trim().toUpperCase();
    const idObjeto = objetoId?.toString();

    const correcto =
        (!!codigoEsperado && leido === codigoEsperado) ||
        (!!codigoEsperado && leido.includes(codigoEsperado)) ||
        (!!idObjeto && leido === idObjeto) ||
        (!!idObjeto && new RegExp(`(id=|/objeto/)${idObjeto}($|[^0-9])`).test(lecturaQR));

    return {
        puntaje: correcto ? 100 : 0,
        correcto,
        feedback: correcto
            ? "¡Encontraste el objeto! Escaneaste la pieza correcta."
            : "Ese no es el código correcto. Revisá el objeto y volvé a escanear.",
        evaluadoPorIA: false,
    };
}

function evaluarTrivia(
    mision: { respuestaCorrecta: string | null; opciones: string | null },
    respuestaVisitante: string
): ResultadoIntento {
    let respuesta = respuestaVisitante;
    const indice = Number(respuestaVisitante);

    if (Number.isInteger(indice) && mision.opciones) {
        try {
            const opciones = JSON.parse(mision.opciones);

            if (Array.isArray(opciones) && typeof opciones[indice] === "string") {
                respuesta = opciones[indice];
            }
        } catch {
            // Si las opciones no son JSON válido, se compara el texto recibido.
        }
    }

    const esperada = normalizarOpcion(mision.respuestaCorrecta ?? "");
    const recibida = normalizarOpcion(respuesta);
    const correcto = esperada.length > 0 && esperada === recibida;

    return {
        puntaje: correcto ? 100 : 0,
        correcto,
        feedback: correcto
            ? "¡Correcto! Avanzá con la próxima misión."
            : "No es la opción correcta. Intentá de nuevo.",
        evaluadoPorIA: false,
    };
}

function normalizarOpcion(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}
