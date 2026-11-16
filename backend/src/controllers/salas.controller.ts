import {Request, Response} from 'express';
import {prisma} from '../prisma';

const ESTADOS_SALA = ['ESPERANDO', 'EN_JUEGO', 'FINALIZADA'] as const;

const configValor = async (clave: string): Promise<string> => {
    const item = await prisma.configuracion.findUnique({ where: { clave } });
    return item?.valor ?? 'OFF';
};

const generarPinUnico = async (): Promise<string> => {
    for (let intento = 0; intento < 30; intento++) {
        const codigo = String(Math.floor(100000 + Math.random() * 900000));
        const existe = await prisma.sala.findUnique({ where: { codigo } });
        if (!existe) return codigo;
    }
    throw new Error('No se pudo generar un PIN único');
};

// El visitante no puede estar metido en dos salas activas a la vez
const salaActivaDe = async (visitanteId: number) => {
    const membresia = await prisma.salaVisitante.findFirst({
        where: { visitanteId, sala: { estado: { in: ['ESPERANDO', 'EN_JUEGO'] } } },
        include: { sala: { include: { camino: { select: { id: true, nombre: true } } } } }
    });
    return membresia?.sala ?? null;
};

export const crearSala = async (req: Request, res: Response) => {
    try {
        const {caminoId, visitanteId} = req.body;
        const caminoNumerico = Number(caminoId);
        const visitanteNumerico = Number(visitanteId);

        if (!Number.isInteger(caminoNumerico) || !Number.isInteger(visitanteNumerico)) {
            return res.status(400).json({error: "IDs inválidos"});
        }

        if ((await configValor('MULTIJUGADOR')) !== 'ON') {
            return res.status(403).json({error: "El multijugador está deshabilitado"});
        }

        const camino = await prisma.camino.findUnique({where: {id: caminoNumerico}});
        if (!camino || !camino.activo) {
            return res.status(404).json({error: "Camino no encontrado o inactivo"});
        }
        const anfitrion = await prisma.visitante.findUnique({where: {id: visitanteNumerico}});
        if (!anfitrion) {
            return res.status(404).json({error: "Visitante no encontrado"});
        }

        const salaActiva = await salaActivaDe(visitanteNumerico);
        if (salaActiva) {
            return res.status(409).json({
                error: "Ya tenés una sala activa",
                salaId: salaActiva.id
            });
        }

        const codigo = await generarPinUnico();
        const sala = await prisma.sala.create({
            data: {
                codigo,
                caminoId: caminoNumerico,
                hostVisitanteId: visitanteNumerico,
                estado: 'ESPERANDO',
                participantes: { create: { visitanteId: visitanteNumerico } }
            },
            include: { camino: { select: { id: true, nombre: true, duracion: true } } }
        });

        res.status(201).json(sala);
    } catch (error) {
        console.error("Error al crear la sala:", error);
        res.status(500).json({error: "Error al crear la sala"});
    }
};

export const unirseSala = async (req: Request, res: Response) => {
    try {
        const {codigo, visitanteId} = req.body;
        const visitanteNumerico = Number(visitanteId);

        if (!Number.isInteger(visitanteNumerico) || !codigo) {
            return res.status(400).json({error: "Se requieren el PIN y el visitante"});
        }

        if ((await configValor('MULTIJUGADOR')) !== 'ON') {
            return res.status(403).json({error: "El multijugador está deshabilitado"});
        }

        const sala = await prisma.sala.findUnique({
            where: { codigo: String(codigo).trim() },
            include: { camino: { select: { id: true, nombre: true, duracion: true } } }
        });
        if (!sala) {
            return res.status(404).json({error: "No existe una sala con ese PIN"});
        }
        if (sala.estado !== 'ESPERANDO') {
            return res.status(409).json({error: "La sala ya no acepta participantes"});
        }
        const visitante = await prisma.visitante.findUnique({where: {id: visitanteNumerico}});
        if (!visitante) {
            return res.status(404).json({error: "Visitante no encontrado"});
        }

        // Si ya está en la sala, devolvemos la sala (re-entrada, no duplicado)
        const yaDentro = await prisma.salaVisitante.findUnique({
            where: { salaId_visitanteId: { salaId: sala.id, visitanteId: visitanteNumerico } }
        });
        if (yaDentro) {
            return res.json(sala);
        }

        const otraSala = await salaActivaDe(visitanteNumerico);
        if (otraSala && otraSala.id !== sala.id) {
            return res.status(409).json({
                error: "Ya estás en otra sala activa",
                salaId: otraSala.id
            });
        }

        await prisma.salaVisitante.create({
            data: { salaId: sala.id, visitanteId: visitanteNumerico }
        });

        res.json(sala);
    } catch (error) {
        console.error("Error al unirse a la sala:", error);
        res.status(500).json({error: "Error al unirse a la sala"});
    }
};

export const getSalaActiva = async (req: Request, res: Response) => {
    try {
        const visitanteId = parseInt(req.params.visitanteId as string);
        if (isNaN(visitanteId)) {
            return res.status(400).json({error: "ID inválido"});
        }
        const sala = await salaActivaDe(visitanteId);
        if (!sala) return res.json(null);
        res.json(sala);
    } catch (error) {
        console.error("Error al buscar la sala activa:", error);
        res.status(500).json({error: "Error al buscar la sala activa"});
    }
};

// Progreso de los participantes dentro de la ventana temporal de la sala:
// usa los mismos intentos (y la misma fórmula de puntos) que los resultados
// individuales, filtrados por misión del camino y por fecha de la sala.
const calcularRanking = async (salaId: number) => {
    const sala = await prisma.sala.findUnique({ where: { id: salaId } });
    if (!sala) return null;

    const participantes = await prisma.salaVisitante.findMany({
        where: { salaId },
        include: { visitante: { select: { id: true, alias: true } } },
        orderBy: { unidoEn: 'asc' }
    });

    const caminoMisiones = await prisma.caminoMision.findMany({
        where: { caminoId: sala.caminoId },
        include: { mision: { select: { id: true, puntos: true } } },
        orderBy: { orden: 'asc' }
    });
    const misionIds = caminoMisiones.map(m => m.misionId);
    const puntosMision = new Map(caminoMisiones.map(m => [m.misionId, m.mision?.puntos ?? 0]));

    const filtroIntentos: any = {
        visitanteId: { in: participantes.map(p => p.visitante.id) },
        misionId: { in: misionIds },
        createdAt: { gte: sala.createdAt }
    };
    if (sala.finalizadaEn) filtroIntentos.createdAt.lte = sala.finalizadaEn;

    const intentos = await prisma.intentoMision.findMany({
        where: filtroIntentos,
        orderBy: { createdAt: 'asc' }
    });

    // Último intento exitoso por misión (igual que en los resultados del camino)
    const ultimoExitoso = new Map<string, (typeof intentos)[number]>(); // clave "visitanteId:misionId"
    for (const intento of intentos) {
        if (!intento.correcto) continue;
        ultimoExitoso.set(`${intento.visitanteId}:${intento.misionId}`, intento);
    }

    const filas = participantes.map(p => {
        let puntos = 0;
        let misionesCompletadas = 0;
        let intentosFallidos = 0;
        for (const intento of intentos) {
            if (intento.visitanteId !== p.visitante.id) continue;
            if (!intento.correcto) { intentosFallidos++; continue; }
        }
        for (const [clave, intento] of ultimoExitoso) {
            const [visId, misId] = clave.split(':').map(Number);
            if (visId !== p.visitante.id) continue;
            const factorPista = intento.usoPista ? 0.7 : 1;
            puntos += Math.round((puntosMision.get(misId) ?? 0) * intento.puntaje / 100 * factorPista);
            misionesCompletadas++;
        }
        return {
            visitanteId: p.visitante.id,
            alias: p.visitante.alias,
            esHost: p.visitante.id === sala.hostVisitanteId,
            puntos,
            misionesCompletadas,
            intentosFallidos,
            insignias: [] as string[]
        };
    });

    filas.sort((a, b) => b.puntos - a.puntos || b.misionesCompletadas - a.misionesCompletadas);

    // Insignias de cada participante (para que el grupo las vea en el ranking)
    const insigniasPorVisitante = new Map<number, string[]>();
    if (participantes.length > 0) {
        const otorgadas = await prisma.insigniaVisitante.findMany({
            where: { visitanteId: { in: participantes.map(p => p.visitante.id) } },
            include: { insignia: { select: { nombre: true } } },
            orderBy: { otorgadaEn: 'desc' }
        });
        for (const o of otorgadas) {
            const lista = insigniasPorVisitante.get(o.visitanteId) ?? [];
            lista.push(o.insignia.nombre);
            insigniasPorVisitante.set(o.visitanteId, lista);
        }
    }
    filas.forEach(f => { f.insignias = insigniasPorVisitante.get(f.visitanteId) ?? []; });

    return { filas, totalMisiones: misionIds.length, sala };
};

export const getSala = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        if (isNaN(id)) {
            return res.status(400).json({error: "ID inválido"});
        }
        const resultado = await calcularRanking(id);
        if (!resultado) {
            return res.status(404).json({error: "Sala no encontrada"});
        }
        const {filas, totalMisiones, sala} = resultado;

        const camino = await prisma.camino.findUnique({
            where: { id: sala.caminoId },
            select: { id: true, nombre: true, descripcion: true, duracion: true }
        });

        res.json({
            id: sala.id,
            codigo: sala.codigo,
            estado: sala.estado,
            createdAt: sala.createdAt,
            finalizadaEn: sala.finalizadaEn,
            hostId: sala.hostVisitanteId,
            camino,
            totalMisiones,
            participantes: filas
        });
    } catch (error) {
        console.error("Error al obtener la sala:", error);
        res.status(500).json({error: "Error al obtener la sala"});
    }
};

export const iniciarSala = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const {visitanteId} = req.body;
        const visitanteNumerico = Number(visitanteId);

        const sala = await prisma.sala.findUnique({ where: { id } });
        if (!sala) return res.status(404).json({error: "Sala no encontrada"});
        if (sala.hostVisitanteId !== visitanteNumerico) {
            return res.status(403).json({error: "Solo el anfitrión puede iniciar la partida"});
        }
        if (sala.estado !== 'ESPERANDO') {
            return res.status(409).json({error: "La sala ya fue iniciada o finalizada"});
        }

        await prisma.sala.update({ where: { id }, data: { estado: 'EN_JUEGO' } });
        res.json({ok: true});
    } catch (error) {
        console.error("Error al iniciar la sala:", error);
        res.status(500).json({error: "Error al iniciar la sala"});
    }
};

export const finalizarSala = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const {visitanteId} = req.body;
        const visitanteNumerico = Number(visitanteId);

        const sala = await prisma.sala.findUnique({ where: { id } });
        if (!sala) return res.status(404).json({error: "Sala no encontrada"});
        if (sala.hostVisitanteId !== visitanteNumerico) {
            return res.status(403).json({error: "Solo el anfitrión puede finalizar la sala"});
        }
        if (sala.estado === 'FINALIZADA') {
            return res.status(409).json({error: "La sala ya está finalizada"});
        }

        await prisma.sala.update({
            where: { id },
            data: { estado: 'FINALIZADA', finalizadaEn: new Date() }
        });
        res.json({ok: true});
    } catch (error) {
        console.error("Error al finalizar la sala:", error);
        res.status(500).json({error: "Error al finalizar la sala"});
    }
};

export const abandonarSala = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const {visitanteId} = req.body;
        const visitanteNumerico = Number(visitanteId);

        const sala = await prisma.sala.findUnique({ where: { id } });
        if (!sala) return res.status(404).json({error: "Sala no encontrada"});

        if (sala.hostVisitanteId === visitanteNumerico) {
            // El anfitrión no "abandona": en espera borra la sala; en juego la finaliza
            if (sala.estado === 'ESPERANDO') {
                await prisma.sala.delete({ where: { id } });
                return res.json({ok: true, salaEliminada: true});
            }
            await prisma.sala.update({
                where: { id },
                data: { estado: 'FINALIZADA', finalizadaEn: new Date() }
            });
            return res.json({ok: true, salaFinalizada: true});
        }

        const membresia = await prisma.salaVisitante.findUnique({
            where: { salaId_visitanteId: { salaId: id, visitanteId: visitanteNumerico } }
        });
        if (!membresia) return res.status(404).json({error: "No participás de esta sala"});

        await prisma.salaVisitante.delete({ where: { id: membresia.id } });
        res.json({ok: true});
    } catch (error) {
        console.error("Error al abandonar la sala:", error);
        res.status(500).json({error: "Error al abandonar la sala"});
    }
};
