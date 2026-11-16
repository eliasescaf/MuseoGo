// Chip del ranking de sala (GRP03): vive en el header de la misión, entre la
// X de salida y los PTS de la misión, mostrando el puesto del visitante en la
// sala activa. Es solo informativo (NO navega) y desaparece si no hay sala o
// si esta recién arrancó (ESPERANDO).
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config/api';
import { useVisitanteStore } from '../../store/useVisitanteStore';

type DatosPuesto = {
    posicion: number;
    total: number;
    puntos: number;
};

export default function ChipPuestoSala() {
    const { id: visitanteId } = useVisitanteStore();
    const [puesto, setPuesto] = useState<DatosPuesto | null>(null);

    const cargar = async () => {
        if (!visitanteId) { setPuesto(null); return; }
        try {
            const salaResponse = await fetch(`${API_URL}/salas/activa/${visitanteId}`);
            const salaActiva = await salaResponse.json();
            if (!salaActiva?.id) { setPuesto(null); return; }
            const detalle = await fetch(`${API_URL}/salas/${salaActiva.id}`).then(r => r.json());
            if ((detalle.estado ?? salaActiva.estado) === 'ESPERANDO') { setPuesto(null); return; }
            const filas = [...(detalle.participantes ?? [])].sort((a: any, b: any) => b.puntos - a.puntos);
            setPuesto({
                posicion: filas.findIndex((p: any) => p.visitanteId === visitanteId) + 1,
                total: filas.length,
                puntos: filas.find((p: any) => p.visitanteId === visitanteId)?.puntos ?? 0,
            });
        } catch {
            setPuesto(null);
        }
    };

    // Encuesta el ranking cada 5s mientras la misión esté abierta
    useEffect(() => {
        cargar();
        const intervalo = setInterval(cargar, 5000);
        return () => clearInterval(intervalo);
    }, [visitanteId]);

    if (!puesto) return null;

    return (
        <View className="flex-row items-center bg-blue-600 rounded-full px-3 py-1.5 shadow-sm">
            <MaterialCommunityIcons name="podium-gold" size={14} color="white" />
            <Text className="text-white font-bold text-[11px] ml-1">
                {puesto.posicion}° de {puesto.total} · {puesto.puntos} pts
            </Text>
        </View>
    );
}
