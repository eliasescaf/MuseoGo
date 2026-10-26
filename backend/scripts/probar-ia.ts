import { evaluarRespuestaAbierta } from "../src/ai/evaluador";

async function main() {
    const resultado = await evaluarRespuestaAbierta({
        titulo: "Vasija diaguita",
        consigna: "Explicá por qué es importante esta pieza.",
        respuestaEsperada:
            "Es importante porque muestra la cerámica de la cultura diaguita y su uso ritual.",
        contextoObjeto:
            "Vasija de cerámica de la cultura diaguita, utilizada en contextos rituales.",
        respuestaVisitante:
            "Porque muestra cómo hacían cerámica los diaguitas.",
    });

    console.log(resultado);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
