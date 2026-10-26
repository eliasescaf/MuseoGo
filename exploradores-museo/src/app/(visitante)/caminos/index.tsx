import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../../config/api';
import { useVisitanteStore } from '../../../store/useVisitanteStore';

export default function CaminosVisitanteScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { alias } = useVisitanteStore();

    const [caminos, setCaminos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchCaminos = async () => {
                setCargando(true);
                try {
                    const response = await fetch(`${API_URL}/caminos`);
                    const data = await response.json();
                    const caminosActivos = data.filter((c: any) => c.activo);
                    setCaminos(caminosActivos);
                } catch (error) {
                    console.error('Error fetching caminos:', error);
                } finally {
                    setCargando(false);
                }
            };
            fetchCaminos();
        }, [])
    );

    const getBadgeDificultad = (minutos: number) => {
        if (!minutos) return null;
        if (minutos <= 15) return { texto: 'BAJA', colores: 'text-emerald-700 bg-emerald-100' };
        if (minutos <= 30) return { texto: 'MEDIA', colores: 'text-amber-700 bg-amber-100' };
        return { texto: 'ALTA', colores: 'text-rose-700 bg-rose-100' };
    };

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top + 20 }}>
            
            <View className="px-6 mb-6">
                <Text className="text-base font-semibold text-blue-600 uppercase tracking-wider">
                    Exploración
                </Text>
                <Text className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                    ¡Hola, {alias}!
                </Text>
                <Text className="text-slate-500 font-medium mt-2">
                    Elegí un camino para empezar tu aventura en el museo.
                </Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="gap-4 pb-10">
                    {cargando ? (
                        <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                    ) : caminos.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <MaterialCommunityIcons name="compass-off-outline" size={48} color="#94a3b8" />
                            <Text className="text-center font-medium text-slate-400 mt-4">
                                No hay caminos disponibles en este momento.
                            </Text>
                        </View>
                    ) : (
                        caminos.map((camino: any) => {
                            const badge = getBadgeDificultad(camino.duracion);
                            
                            return (
                                <Pressable
                                    onPress={() => router.push({
                                        pathname: "/(visitante)/caminos/[id]",
                                        params: { id: camino.id }
                                    })}
                                    key={camino.id}
                                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm active:scale-95 transition-transform"
                                >
                                    <View className="flex-row items-start justify-between mb-4">
                                        <View className="flex-1 pr-4">
                                            <Text className="text-xl font-bold text-slate-800 mb-1">
                                                {camino.titulo || camino.nombre}
                                            </Text>
                                            <Text className="text-sm text-slate-500 line-clamp-2" numberOfLines={2}>
                                                {camino.descripcion}
                                            </Text>
                                        </View>
                                        <View className="h-12 w-12 rounded-2xl bg-blue-50 items-center justify-center shrink-0">
                                            <MaterialCommunityIcons name="map-search-outline" size={24} color="#2563eb" />
                                        </View>
                                    </View>

                                    {/* Badges de Dificultad Dinámica y Duración[cite: 2] */}
                                    <View className="flex-row items-center gap-3">
                                        {camino.duracion ? (
                                            <>
                                                {badge && (
                                                    <View className={`px-3 py-1.5 rounded-xl ${badge.colores.split(' ')[1]}`}>
                                                        <Text className={`text-xs font-bold ${badge.colores.split(' ')[0]}`}>
                                                            {badge.texto}
                                                        </Text>
                                                    </View>
                                                )}
                                                
                                                <View className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-xl">
                                                    <Ionicons name="time-outline" size={14} color="#64748b" />
                                                    <Text className="text-xs font-bold text-slate-600 ml-1">
                                                        {camino.duracion} min
                                                    </Text>
                                                </View>
                                            </>
                                        ) : null}
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
}