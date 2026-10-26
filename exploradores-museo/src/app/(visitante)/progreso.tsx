import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../config/api';
import { useVisitanteStore } from '../../store/useVisitanteStore';

type ProgresoData = {
    alias: string;
    puntosTotales: number;
    caminosCompletados: Array<{
        caminoId: number;
        nombre: string;
        descripcion?: string;
        duracion?: number;
        puntosGanados: number;
        completadoEn: string;
    }>;
};

const formatearFecha = (iso: string) => {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ProgresoScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { alias } = useVisitanteStore();

    const [progreso, setProgreso] = useState<ProgresoData | null>(null);
    const [cargando, setCargando] = useState(true);

    // useFocusEffect igual a caminos: recarga al volver a la pestaña
    useFocusEffect(
        useCallback(() => {
            const fetchProgreso = async () => {
                const visitanteId = useVisitanteStore.getState().id;
                if (!visitanteId) {
                    setCargando(false);
                    return;
                }
                setCargando(true);
                try {
                    const response = await fetch(`${API_URL}/visitantes/${visitanteId}/progreso`);
                    if (response.ok) {
                        setProgreso(await response.json());
                    }
                } catch (error) {
                    console.error('Error fetching progreso:', error);
                } finally {
                    setCargando(false);
                }
            };
            fetchProgreso();
        }, [])
    );

    if (cargando) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 font-bold text-slate-500">Cargando tu progreso...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top + 20 }}>

            {/* Header idéntico a la pantalla de caminos */}
            <View className="px-6 mb-6">
                <Text className="text-base font-semibold text-blue-600 uppercase tracking-wider">
                    Mi Progreso
                </Text>
                <Text className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                    ¡Hola, {progreso?.alias || alias}!
                </Text>
                <Text className="text-slate-500 font-medium mt-2">
                    {progreso && progreso.caminosCompletados.length > 0
                        ? 'Estos son los recorridos que ya completaste.'
                        : 'Completá misiones en un camino para ver acá tus puntos y tu avance.'}
                </Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="gap-4 pb-10">
                    {/* Tarjeta de puntos totales */}
                    <View className="bg-blue-600 rounded-3xl p-5 shadow-sm flex-row items-start justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-xl font-bold text-white mb-1">
                                {progreso?.puntosTotales ?? 0} PTS
                            </Text>
                            <Text className="text-sm text-blue-100">
                                Puntos acumulados en el museo
                            </Text>
                        </View>
                        <View className="h-12 w-12 rounded-2xl bg-white/20 items-center justify-center shrink-0">
                            <MaterialCommunityIcons name="star-shooting" size={24} color="white" />
                        </View>
                    </View>

                    {!progreso || progreso.caminosCompletados.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <MaterialCommunityIcons name="trophy-outline" size={48} color="#94a3b8" />
                            <Text className="text-center font-medium text-slate-400 mt-4">
                                Todavía no completaste ningún camino.
                            </Text>
                        </View>
                    ) : (
                        progreso.caminosCompletados.map((camino) => (
                            <Pressable
                                onPress={() => router.push({
                                    pathname: "/(visitante)/resultados-camino",
                                    params: { caminoId: camino.caminoId }
                                })}
                                key={camino.caminoId}
                                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm active:scale-95 transition-transform"
                            >
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-xl font-bold text-slate-800 mb-1">
                                            {camino.nombre}
                                        </Text>
                                        <Text className="text-sm text-slate-500" numberOfLines={2}>
                                            {camino.descripcion || `Completado el ${formatearFecha(camino.completadoEn)}`}
                                        </Text>
                                    </View>
                                    <View className="h-12 w-12 rounded-2xl bg-emerald-50 items-center justify-center shrink-0">
                                        <MaterialCommunityIcons name="check-decagram-outline" size={24} color="#10b981" />
                                    </View>
                                </View>

                                {/* Badges de puntos ganados y fecha */}
                                <View className="flex-row items-center gap-3">
                                    <View className="px-3 py-1.5 rounded-xl bg-amber-100">
                                        <Text className="text-xs font-bold text-amber-700">
                                            +{camino.puntosGanados} PTS
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-xl">
                                        <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                        <Text className="text-xs font-bold text-slate-600 ml-1">
                                            {formatearFecha(camino.completadoEn)}
                                        </Text>
                                    </View>

                                    {camino.duracion ? (
                                        <View className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-xl">
                                            <Ionicons name="time-outline" size={14} color="#64748b" />
                                            <Text className="text-xs font-bold text-slate-600 ml-1">
                                                {camino.duracion} min
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
