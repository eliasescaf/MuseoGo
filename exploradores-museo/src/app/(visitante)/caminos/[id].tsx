import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../../config/api';

export default function DetalleCaminoScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const [camino, setCamino] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchDetalleCamino = async () => {
                setCargando(true);
                try {
                    const response = await fetch(`${API_URL}/caminos/${id}`);
                    const data = await response.json();
                    console.log(data)
                    setCamino(data);
                } catch (error) {
                    console.error('Error fetching detalle camino:', error);
                } finally {
                    setCargando(false);
                }
            };
            fetchDetalleCamino();
        }, [id])
    );

    if (cargando) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!camino) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center px-6">
                <Text className="text-lg text-slate-500 text-center">No se pudo cargar la información del camino.</Text>
                <Pressable onPress={() => router.back()} className="mt-4 bg-blue-100 px-6 py-3 rounded-xl">
                    <Text className="text-blue-700 font-bold">Volver</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} 
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-6 pb-4 bg-white border-b border-slate-200" style={{ paddingTop: insets.top + 10 }}>
                    <Pressable 
                        onPress={() => router.back()} 
                        className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mb-4 active:bg-slate-200"
                    >
                        <Ionicons name="arrow-back" size={20} color="#334155" />
                    </Pressable>
                    
                    <Text className="text-3xl font-black text-slate-800 tracking-tight">
                        {camino.titulo || camino.nombre}
                    </Text>
                    
                    <View className="flex-row items-center gap-4 mt-3">
                        {camino.dificultad && (
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="speedometer" size={16} color="#64748b" />
                                <Text className="text-sm font-semibold text-slate-600 ml-1 uppercase">
                                    {camino.dificultad}
                                </Text>
                            </View>
                        )}
                        {camino.duracion && (
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={16} color="#64748b" />
                                <Text className="text-sm font-semibold text-slate-600 ml-1">
                                    {camino.duracion} min
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="px-6 py-6">
                    <Text className="text-base text-slate-600 leading-relaxed">
                        {camino.descripcion}
                    </Text>
                </View>

                <View className="px-6 mt-2">
                    <Text className="text-lg font-bold text-slate-800 mb-6">
                        Misiones del Camino
                    </Text>

                    {camino.misiones?.length > 0 ? (
                        camino.misiones.map((item: any, index: number) => {
                            const misionData = item.mision; 
                            
                            return (
                                <View key={item.misionId} className="flex-row items-start mb-6 relative">
                                    {index !== camino.misiones.length - 1 && (
                                        <View className="absolute left-[15px] top-8 w-0.5 h-full bg-blue-200 -z-10" />
                                    )}
                                    
                                    <View className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 items-center justify-center mr-4 mt-1 bg-white">
                                        <Text className="text-blue-600 font-black text-xs">
                                            {item.orden}
                                        </Text>
                                    </View>

                                    <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <Text className="font-bold text-slate-800 text-base mb-1">
                                            {misionData.titulo}
                                        </Text>
                                        <View className="flex-row justify-between items-center mt-2">
                                            <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                {misionData.tipo === 'QR_OBJETO' ? 'Escaneo QR' : 
                                                 misionData.tipo === 'EXPLICACION' ? 'Respuesta Libre' : 
                                                 misionData.tipo || 'Misión'}
                                            </Text>
                                            <View className="bg-amber-100 px-2 py-1 rounded-md flex-row items-center">
                                                <MaterialCommunityIcons name="star-circle" size={14} color="#d97706" />
                                                <Text className="text-[10px] font-bold text-amber-700 ml-1">
                                                    {misionData.puntos || 0} PTS
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="items-center py-6 bg-slate-100 rounded-2xl border border-slate-200 border-dashed">
                            <Text className="text-slate-500 font-medium">Este camino aún no tiene misiones.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 w-full bg-white border-t border-slate-200">
                <View className="px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
                    <Pressable
                        onPress={() => {
                            const primera = [...(camino.misiones ?? [])].sort((a: any, b: any) => a.orden - b.orden)[0];
                            router.push(`/(visitante)/mision-activa/${primera.misionId}?caminoId=${camino.id}`);
                        }}
                        disabled={!camino.misiones?.length}
                        className={`h-14 rounded-2xl items-center justify-center shadow-sm flex-row ${
                            camino.misiones?.length ? 'bg-blue-600 active:bg-blue-700' : 'bg-slate-300'
                        }`}
                    >
                        <Text className="text-white font-bold text-lg mr-2">
                            Iniciar Camino
                        </Text>
                        {camino.misiones?.length > 0 && (
                            <Ionicons name="play" size={20} color="white" />
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}