import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../config/api';
import { useVisitanteStore } from '../../store/useVisitanteStore';

type InsigniaObtenida = {
    id: number;
    nombre: string;
    descripcion: string;
};

type Desbloqueado = {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: number;
};

type Estadisticas = {
    pistasUsadas: number;
    intentosFallidos: number;
    misionesPerfectas: number;
};

export default function ResultadosCaminoScreen() {
    const { caminoId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id: visitanteId, alias } = useVisitanteStore();

    const [cargando, setCargando] = useState(true);
    const [resultados, setResultados] = useState({
        puntosObtenidos: 0,
        puntosPosibles: 0,
        misionesCorrectas: 0,
        totalMisiones: 0,
        tituloCamino: 'Tu Camino',
        puntosTotalesHistoricos: 0,
        estadisticas: { pistasUsadas: 0, intentosFallidos: 0, misionesPerfectas: 0 } as Estadisticas,
        insigniasObtenidas: [] as InsigniaObtenida[],
        desbloqueados: [] as Desbloqueado[],
    });

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                const response = await fetch(`${API_URL}/visitantes/${visitanteId}/caminos/${caminoId}/resultados`);
                
                if (response.ok) {
                    const data = await response.json();
                    setResultados({
                        puntosObtenidos: data.puntosGanados || 0,
                        puntosPosibles: data.puntosPosibles || 0,
                        misionesCorrectas: data.misionesCorrectas || 0,
                        totalMisiones: data.totalMisiones || 0,
                        tituloCamino: data.camino?.titulo || 'Camino Completado',
                        puntosTotalesHistoricos: data.puntosTotalesHistoricos || 0,
                        estadisticas: {
                            pistasUsadas: data.estadisticas?.pistasUsadas || 0,
                            intentosFallidos: data.estadisticas?.intentosFallidos || 0,
                            misionesPerfectas: data.estadisticas?.misionesPerfectas || 0,
                        },
                        desbloqueados: data.desbloqueados || [],
                        insigniasObtenidas: data.insigniasObtenidas || [],
                    });
                }
            } catch (error) {
                console.error("Error al obtener resultados:", error);
            } finally {
                setCargando(false);
            }
        };

        if (caminoId && visitanteId) {
            fetchResultados();
        } else {
            setCargando(false);
        }
    }, [caminoId, visitanteId]);

    if (cargando) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#d97706" />
                <Text className="mt-4 font-bold text-slate-500">Calculando tu puntaje final...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: insets.top + 32,
                    paddingBottom: insets.bottom + 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center mb-8">
                    <View className="w-28 h-28 bg-amber-100 rounded-full items-center justify-center mb-6 border-4 border-amber-200 shadow-sm">
                        <FontAwesome5 name="trophy" size={50} color="#d97706" />
                    </View>
                    <Text className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">
                        ¡Misión Cumplida, {alias}!
                    </Text>
                    <Text className="text-3xl font-black text-slate-800 text-center leading-tight">
                        {resultados.tituloCamino}
                    </Text>
                </View>

                <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                    <Text className="text-center text-slate-500 font-medium mb-6">
                        Resumen de tu expedición en el museo
                    </Text>

                    <View className="flex-row items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                                <Ionicons name="checkmark-done" size={20} color="#10b981" />
                            </View>
                            <View>
                                <Text className="text-sm text-slate-500 font-medium">Misiones resueltas</Text>
                                <Text className="text-lg font-black text-slate-800">
                                    {resultados.misionesCorrectas} <Text className="text-sm font-medium text-slate-400">/ {resultados.totalMisiones}</Text>
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-amber-200 rounded-full items-center justify-center">
                                <MaterialCommunityIcons name="star-shooting" size={22} color="#b45309" />
                            </View>
                            <View>
                                <Text className="text-sm text-amber-700 font-bold">Puntos obtenidos</Text>
                                <Text className="text-2xl font-black text-amber-600">
                                    +{resultados.puntosObtenidos} PTS
                                </Text>
                            </View>
                        </View>
                        {resultados.puntosPosibles > 0 && (
                            <Text className="text-xs font-bold text-amber-700/70">
                                de {resultados.puntosPosibles}
                            </Text>
                        )}
                    </View>

                    <View className="flex-row gap-2">
                        <View className="flex-1 bg-sky-50 border border-sky-100 rounded-2xl p-3 items-center">
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#0284c7" />
                            <Text className="text-lg font-black text-sky-700">{resultados.estadisticas.pistasUsadas}</Text>
                            <Text className="text-[10px] font-bold text-sky-600 uppercase">Pistas</Text>
                        </View>
                        <View className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 items-center">
                            <Ionicons name="refresh-circle-outline" size={18} color="#64748b" />
                            <Text className="text-lg font-black text-slate-700">{resultados.estadisticas.intentosFallidos}</Text>
                            <Text className="text-[10px] font-bold text-slate-500 uppercase">Fallos</Text>
                        </View>
                        <View className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 items-center">
                            <MaterialCommunityIcons name="star-circle-outline" size={18} color="#059669" />
                            <Text className="text-lg font-black text-emerald-700">{resultados.estadisticas.misionesPerfectas}</Text>
                            <Text className="text-[10px] font-bold text-emerald-600 uppercase">Perfectas</Text>
                        </View>
                    </View>
                </View>

                {/* Insignias recién ganadas: aviso discreto */}
                {resultados.insigniasObtenidas.length > 0 && (
                    <View className="flex-row items-center bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 mb-4">
                        <Ionicons name="medal-outline" size={17} color="#b45309" />
                        <Text className="flex-1 text-amber-800 text-sm ml-3" numberOfLines={2}>
                            Nueva insignia: {resultados.insigniasObtenidas.map(i => i.nombre).join(', ')}
                        </Text>
                    </View>
                )}

                {/* Caminos desbloqueados: solo un aviso simple, sin navegación */}
                {resultados.desbloqueados.length > 0 && (
                    <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-6">
                        <MaterialCommunityIcons name="lock-open-variant" size={20} color="#059669" />
                        <Text className="flex-1 text-emerald-800 font-bold ml-3">
                            ¡Desbloqueaste {resultados.desbloqueados.map((camino) => camino.nombre).join(' y ')}!
                        </Text>
                    </View>
                )}

                <Pressable
                    onPress={() => router.replace('/(visitante)/caminos')}
                    className="w-full h-14 bg-blue-600 rounded-2xl items-center justify-center flex-row shadow-sm active:bg-blue-700 mb-3"
                >
                    <Text className="text-white font-bold text-lg mr-2">Explorar otros caminos</Text>
                    <Ionicons name="map-outline" size={20} color="white" />
                </Pressable>

                <Pressable
                    onPress={() => router.replace('/(visitante)/progreso')}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl items-center justify-center flex-row active:bg-slate-50"
                >
                    <Text className="text-slate-700 font-bold text-base mr-2">Ver mi perfil</Text>
                    <Ionicons name="person-outline" size={18} color="#334155" />
                </Pressable>
            </ScrollView>
        </View>
    );
}
