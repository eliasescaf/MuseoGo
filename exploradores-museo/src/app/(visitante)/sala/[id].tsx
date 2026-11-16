import { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../../config/api';
import { useVisitanteStore } from '../../../store/useVisitanteStore';
import Zoomable from '../../../components/Zoomable';

type Participante = {
    visitanteId: number;
    alias: string;
    esHost: boolean;
    puntos: number;
    misionesCompletadas: number;
    intentosFallidos: number;
    insignias?: string[];
};

type SalaData = {
    id: number;
    codigo: string;
    estado: 'ESPERANDO' | 'EN_JUEGO' | 'FINALIZADA';
    hostId: number;
    camino: { id: number; nombre: string; descripcion?: string; duracion?: number } | null;
    totalMisiones: number;
    participantes: Participante[];
};

export default function SalaScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id: visitanteId } = useVisitanteStore();
    const scrollRef = useRef(null);

    const [sala, setSala] = useState<SalaData | null>(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);

    const cargarSala = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/salas/${id}`);
            if (response.ok) {
                setSala(await response.json());
            } else {
                setSala(null);
            }
        } catch (error) {
            console.error('Error fetching sala:', error);
        } finally {
            setCargando(false);
        }
    }, [id]);

    // GRP03/GRP04: actualización "en vivo" por polling
    useFocusEffect(
        useCallback(() => {
            cargarSala();
            const intervalo = setInterval(cargarSala, 4000);
            return () => clearInterval(intervalo);
        }, [cargarSala])
    );

    const esHost = sala?.hostId === visitanteId;
    const enEspera = sala?.estado === 'ESPERANDO';
    const enJuego = sala?.estado === 'EN_JUEGO';
    const finalizada = sala?.estado === 'FINALIZADA';

    const iniciarPartida = async () => {
        setProcesando(true);
        try {
            const respuesta = await fetch(`${API_URL}/salas/${id}/iniciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitanteId })
            });
            if (respuesta.ok) cargarSala();
            else {
                const error = await respuesta.json().catch(() => null);
                Alert.alert("Error", error?.error ?? "No se pudo iniciar la partida");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcesando(false);
        }
    };

    const finalizarSala = async () => {
        Alert.alert("¿Finalizar la sala?", "Se cierra el grupo y queda el ranking final", [
            { text: "Cancelar", style: "cancel" },
            { text: "Finalizar", onPress: async () => {
                setProcesando(true);
                try {
                    const respuesta = await fetch(`${API_URL}/salas/${id}/finalizar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ visitanteId })
                    });
                    if (respuesta.ok) cargarSala();
                } catch (error) {
                    console.error(error);
                } finally {
                    setProcesando(false);
                }
            }}
        ]);
    };

    const abandonar = () => {
        Alert.alert(esHost && enEspera ? "¿Cerrar la sala?" : "¿Abandonar la sala?", undefined, [
            { text: "Cancelar", style: "cancel" },
            { text: esHost && enEspera ? "Cerrar" : "Salir", style: "destructive", onPress: async () => {
                setProcesando(true);
                try {
                    const respuesta = await fetch(`${API_URL}/salas/${id}/abandonar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ visitanteId })
                    });
                    if (respuesta.ok) {
                        const resultado = await respuesta.json().catch(() => null);
                        if (!resultado?.salaFinalizada) {
                            router.replace('/(visitante)/caminos');
                        }
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setProcesando(false);
                }
            }}
        ]);
    };

    if (cargando) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-4 font-bold text-slate-500">Buscando tu sala...</Text>
            </View>
        );
    }

    if (!sala) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
                <MaterialCommunityIcons name="door-closed" size={48} color="#94a3b8" />
                <Text className="text-center font-bold text-slate-600 mt-4">Esta sala ya no existe</Text>
                <Pressable
                    onPress={() => router.replace('/(visitante)/caminos')}
                    className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl active:bg-blue-700"
                >
                    <Text className="text-white font-bold">Volver a caminos</Text>
                </Pressable>
            </View>
        );
    }

    const chipEstado = enEspera
        ? { texto: 'ESPERANDO', color: '#0284c7', fondo: 'bg-sky-100' }
        : enJuego
            ? { texto: 'EN JUEGO', color: '#059669', fondo: 'bg-emerald-100' }
            : { texto: 'FINALIZADA', color: '#64748b', fondo: 'bg-slate-200' };

    return (
        <Zoomable scrollRef={scrollRef}>
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-slate-100 bg-white">
                <Pressable onPress={abandonar} disabled={procesando} className="p-2 -ml-2 active:bg-slate-100 rounded-full">
                    <Ionicons name="chevron-back" size={26} color="#334155" />
                </Pressable>
                <Text className="text-lg font-bold text-slate-800 ml-2">Sala de grupo</Text>
                <View className={`ml-auto px-3 py-1 rounded-full ${chipEstado.fondo}`}>
                    <Text className="text-[10px] font-bold" style={{ color: chipEstado.color }}>{chipEstado.texto}</Text>
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 20,
                    paddingBottom: insets.bottom + 40,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Camino + PIN */}
                <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
                    <Text className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
                        Camino del grupo
                    </Text>
                    <Text className="text-xl font-black text-slate-800">
                        {sala.camino?.nombre ?? 'Camino'}
                    </Text>
                    {enEspera && (
                        <View className="items-center mt-5">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                PIN para unirse
                            </Text>
                            <Text className="text-4xl font-black text-blue-600 tracking-[8px]">
                                {sala.codigo}
                            </Text>
                            <Text className="text-xs text-slate-500 mt-2 text-center">
                                Compartí este código con tus compañeros para que entren a la sala
                            </Text>
                        </View>
                    )}
                    {!enEspera && (
                        <View className="flex-row items-center mt-3">
                            <View className="bg-slate-100 px-2.5 py-1 rounded-md">
                                <Text className="text-[10px] font-bold text-slate-500">PIN {sala.codigo}</Text>
                            </View>
                            <View className="bg-slate-100 px-2.5 py-1 rounded-md ml-2">
                                <Text className="text-[10px] font-bold text-slate-500">{sala.totalMisiones} misiones</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Mensajes de estado */}
                {enEspera && (
                    <View className="flex-row items-center bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-6">
                        <MaterialCommunityIcons name="account-clock" size={20} color="#0284c7" />
                        <Text className="flex-1 text-sky-800 text-sm ml-3">
                            {esHost
                                ? 'Esperando que se unan tus compañeros. Pueden entrar con el PIN.'
                                : 'Listo para empezar. Esperando a que el anfitrión inicie la partida.'}
                        </Text>
                    </View>
                )}
                {finalizada && (
                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 mb-6">
                        <MaterialCommunityIcons name="flag-checkered" size={20} color="#64748b" />
                        <Text className="flex-1 text-slate-600 text-sm ml-3">
                            La sala finalizó. El recorrido grupal quedó cerrado.
                        </Text>
                    </View>
                )}

                {/* Botón para jugar (GRP03): el grupo recorre el mismo camino */}
                {enJuego && (
                    <Pressable
                        onPress={() => router.push(`/(visitante)/caminos/${sala.camino?.id}`)}
                        className="w-full h-14 bg-blue-600 rounded-2xl items-center justify-center flex-row shadow-sm active:bg-blue-700 mb-6"
                    >
                        <MaterialCommunityIcons name="play-circle" size={22} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">
                            {finalizada ? 'Ver camino' : 'Ir a las misiones'}
                        </Text>
                    </Pressable>
                )}

                {/* GRP04: controles del anfitrión */}
                {esHost && enEspera && (
                    <Pressable
                        onPress={iniciarPartida}
                        disabled={procesando}
                        className="w-full h-14 bg-emerald-600 rounded-2xl items-center justify-center flex-row shadow-sm active:bg-emerald-700 mb-6"
                    >
                        <MaterialCommunityIcons name="rocket-launch" size={20} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Iniciar partida</Text>
                    </Pressable>
                )}
                {esHost && enJuego && (
                    <Pressable
                        onPress={finalizarSala}
                        disabled={procesando}
                        className="w-full h-12 bg-slate-200 rounded-2xl items-center justify-center flex-row active:bg-slate-300 mb-6"
                    >
                        <MaterialCommunityIcons name="flag-checkered" size={18} color="#334155" />
                        <Text className="text-slate-700 font-bold ml-2">Finalizar sala</Text>
                    </Pressable>
                )}

                {/* GRP03: ranking en vivo */}
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                    {finalizada ? 'Resultado final' : 'Progreso del grupo'}
                </Text>
                <View className="gap-2">
                    {sala.participantes.map((p, index) => {
                        const soyYo = p.visitanteId === visitanteId;
                        return (
                            <View
                                key={p.visitanteId}
                                className={`flex-row items-center rounded-2xl p-3 border ${
                                    soyYo ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                                }`}
                            >
                                <View className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center mr-3">
                                    <Text className="text-xs font-black text-slate-600">{index + 1}</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="font-bold text-slate-800">{p.alias}</Text>
                                        {p.esHost && (
                                            <MaterialCommunityIcons name="crown" size={13} color="#d97706" />
                                        )}
                                        {soyYo && (
                                            <Text className="text-[10px] font-bold text-blue-600 ml-2">(vos)</Text>
                                        )}
                                    </View>
                                    <Text className="text-[11px] text-slate-500">
                                        {p.misionesCompletadas}/{sala.totalMisiones} misiones
                                    </Text>
                                    {p.insignias && p.insignias.length > 0 && (
                                        <View className="flex-row flex-wrap gap-1.5 mt-1.5">
                                            {p.insignias.map((nombre) => (
                                                <View key={nombre} className="flex-row items-center bg-amber-100 px-2 py-0.5 rounded-full">
                                                    <MaterialCommunityIcons name="medal" size={11} color="#b45309" />
                                                    <Text className="text-[10px] font-bold text-amber-800 ml-1">
                                                        {nombre}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                <View className="bg-amber-100 px-2.5 py-1 rounded-lg">
                                    <Text className="text-xs font-black text-amber-700">{p.puntos} PTS</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {!esHost && !finalizada && (
                    <Pressable onPress={abandonar} className="mt-8 items-center active:opacity-70">
                        <Text className="text-sm font-bold text-rose-600">Abandonar la sala</Text>
                    </Pressable>
                )}
            </ScrollView>
        </View>
        </Zoomable>
    );
}
