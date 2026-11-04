const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const API = 'http://localhost:3000/api';
const prisma = new PrismaClient();

const creados = { visitanteId: null, misionIds: [], caminoIds: [] };

const req = async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} -> ${res.status} ${JSON.stringify(body)}`);
    return body;
};
const post = (path, data) => req(path, { method: 'POST', body: JSON.stringify(data) });
const check = (cond, msg) => {
    if (!cond) throw new Error(`FALLO: ${msg}`);
    console.log(`OK  ${msg}`);
};

const limpiar = async () => {
    try {
        if (creados.visitanteId) {
            await prisma.intentoMision.deleteMany({ where: { visitanteId: creados.visitanteId } });
            await prisma.caminoCompletado.deleteMany({ where: { visitanteId: creados.visitanteId } });
        }
        if (creados.caminoIds.length) {
            await prisma.camino.deleteMany({ where: { id: { in: creados.caminoIds } } });
        }
        if (creados.misionIds.length) {
            await prisma.mision.deleteMany({ where: { id: { in: creados.misionIds } } });
        }
        if (creados.visitanteId) {
            await prisma.visitante.delete({ where: { id: creados.visitanteId } });
        }
        console.log('\nDatos de prueba eliminados de Supabase.');
    } catch (e) {
        console.error('Error limpiando datos de prueba:', e.message);
    } finally {
        await prisma.$disconnect();
    }
};

const run = async () => {
    const visitante = await post('/visitantes', { alias: `Sprint4-verif-${Date.now()}` });
    creados.visitanteId = visitante.id;
    console.log('Visitante temporal', visitante.id);

    const misionA = await post('/misiones', {
        titulo: 'Verificación Sprint4 - pista',
        descripcion: '¿Cuánto descuenta la pista?',
        tipo: 'TRIVIA',
        puntos: 100,
        opciones: ['10%', '30%', '50%'],
        respuestaCorrecta: '30%',
        pista: 'La respuesta está en el cartel de la sala.',
    });
    creados.misionIds.push(misionA.id);
    check(misionA.pista === 'La respuesta está en el cartel de la sala.', 'Supabase guarda Mision.pista');

    const caminoA = await post('/caminos', {
        nombre: 'Verificación Sprint4 - base',
        descripcion: 'Camino temporal',
        duracion: 10,
        activo: true,
        misiones: [{ misionId: misionA.id, orden: 1 }],
    });
    creados.caminoIds.push(caminoA.id);

    const misionesB = [];
    for (let i = 1; i <= 5; i++) {
        const m = await post('/misiones', {
            titulo: `Verificación Sprint4 - B ${i}`,
            tipo: 'TRIVIA',
            puntos: 20,
            opciones: ['Sí', 'No'],
            respuestaCorrecta: 'Sí',
        });
        misionesB.push(m);
        creados.misionIds.push(m.id);
    }

    const caminoB = await post('/caminos', {
        nombre: 'Verificación Sprint4 - desbloqueable',
        descripcion: 'Camino temporal bloqueado',
        duracion: 45,
        activo: true,
        caminoRequeridoId: caminoA.id,
        misiones: misionesB.map((m, i) => ({ misionId: m.id, orden: i + 1 })),
    });
    creados.caminoIds.push(caminoB.id);

    const listado = await req(`/caminos?visitanteId=${visitante.id}`);
    const a = listado.find(c => c.id === caminoA.id);
    const b = listado.find(c => c.id === caminoB.id);
    check(a.dificultad === 'BAJA', `dificultad BAJA (${a.dificultad})`);
    check(b.dificultad === 'ALTA', `dificultad ALTA (${b.dificultad})`);
    check(b.bloqueado === true, 'camino B bloqueado antes de completar A');

    const detalleB = await req(`/caminos/${caminoB.id}?visitanteId=${visitante.id}`);
    check(detalleB.caminoRequerido?.nombre === caminoA.nombre, 'detalle B informa el camino requerido');

    const evaluacion = await post('/ia/evaluar', {
        visitanteId: visitante.id,
        misionId: misionA.id,
        respuesta: '30%',
        usoPista: true,
    });
    check(evaluacion.puntaje === 100 && evaluacion.usoPista === true, 'evaluación guarda usoPista');

    const resultados = await req(`/visitantes/${visitante.id}/caminos/${caminoA.id}/resultados`);
    check(resultados.puntosGanados === 70, `penalización 30%: ${resultados.puntosGanados} pts (esperado 70)`);
    check(resultados.estadisticas.pistasUsadas === 1, 'estadística de pistas');
    check(resultados.desbloqueados.some(c => c.id === caminoB.id), 'resultados anuncian el desbloqueo');

    const listado2 = await req(`/caminos?visitanteId=${visitante.id}`);
    check(listado2.find(c => c.id === caminoB.id).bloqueado === false, 'camino B desbloqueado tras completar A');
    check(listado2.find(c => c.id === caminoA.id).completado === true, 'camino A completado');

    console.log('\nVERIFICACIÓN REMOTA OK');
};

run()
    .catch((e) => {
        console.error('\n' + e.message);
        process.exitCode = 1;
    })
    .finally(limpiar);
