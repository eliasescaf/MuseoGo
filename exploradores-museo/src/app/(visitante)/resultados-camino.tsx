import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../config/api';
import { useVisitanteStore } from '../../store/useVisitanteStore';

export default function ResultadosCaminoScreen() {
    const { caminoId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id: visitanteId, alias } = useVisitanteStore();

    const [cargando, setCargando] = useState(true);
    const [resultados, setResultados] = useState({
        puntosObtenidos: 0,
        misionesCorrectas: 0,
        totalMisiones: 0,
        tituloCamino: 'Tu Camino'
    });

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                // Endpoint sugerido para obtener el resumen del camino para este visitante
                const response = await fetch(`${API_URL}/visitantes/${visitanteId}/caminos/${caminoId}/resultados`);
                
                if (response.ok) {
                    const data = await response.json();
                    setResultados({
                        puntosObtenidos: data.puntosGanados || 0,
                        misionesCorrectas: data.misionesCorrectas || 0,
                        totalMisiones: data.totalMisiones || 0,
                        tituloCamino: data.camino?.titulo || 'Camino Completado'
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
        <View className="flex-1 bg-slate-50 px-6" style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }}>
            
            {/* Encabezado Festivo */}
            <View className="items-center mb-10">
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

            {/* Tarjeta de Resumen */}
            <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-auto">
                <Text className="text-center text-slate-500 font-medium mb-6">
                    Resumen de tu expedición en el museo
                </Text>

                <View className="flex-row items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
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

                <View className="flex-row items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-100">
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
                </View>
            </View>

            {/* Controles */}
            <Pressable
                onPress={() => router.replace('/(visitante)/caminos')}
                className="w-full h-14 bg-blue-600 rounded-2xl items-center justify-center flex-row shadow-sm active:bg-blue-700 mb-4"
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
            
        </View>
    );
}