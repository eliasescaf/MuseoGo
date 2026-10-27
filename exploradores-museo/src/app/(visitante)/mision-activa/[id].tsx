import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../../config/api';

import RespuestaIA from '../../../components/misiones/RespuestaIA';
import TriviaOpciones from '../../../components/misiones/TriviaOpciones';
import EscanerQR from '../../../components/misiones/EscanerQR';
import type { EstadoMision, ResultadoMision } from '../../../types/mision';

export default function MisionActivaScreen() {
    const { id, caminoId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [mision, setMision] = useState<any>(null);
    const [misionesCamino, setMisionesCamino] = useState<any[]>([]); // Almacena la ruta completa
    
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [animacionEntrada, setAnimacionEntrada] = useState(true);
    
    const [estadoResolucion, setEstadoResolucion] = useState<EstadoMision>('PENDIENTE');
    const [puntosGanados, setPuntosGanados] = useState(0);
    const [feedbackIA, setFeedbackIA] = useState<string | null>(null);

    useEffect(() => {
        const fetchDatos = async () => {
            // Al cambiar de misión (replace cambia params sin remontar la pantalla),
            // reseteamos el estado del intento anterior para que no se muestre el result
            setMision(null);
            setEstadoResolucion('PENDIENTE');
            setPuntosGanados(0);
            setFeedbackIA(null);
            setAnimacionEntrada(true);
            try {
                // 1. Traer los datos de la misión actual
                const resMision = await fetch(`${API_URL}/misiones/${id}`);
                if (!resMision.ok) throw new Error("Misión no encontrada");
                const dataMision = await resMision.json();
                setMision(dataMision);

                // 2. Traer el camino para saber qué misión sigue (El Orquestador)
                if (caminoId) {
                    const resCamino = await fetch(`${API_URL}/caminos/${caminoId}`);
                    if (resCamino.ok) {
                        const dataCamino = await resCamino.json();
                        // Ordenamos las misiones usando el campo "orden" de tu tabla intermedia
                        const misionesOrdenadas = dataCamino.misiones?.sort((a: any, b: any) => a.orden - b.orden) || [];
                        setMisionesCamino(misionesOrdenadas);
                    }
                }
            } catch (error) {
                console.error("Error cargando el alistamiento:", error);
            } finally {
                setCargandoDatos(false);
                setTimeout(() => setAnimacionEntrada(false), 3000);
            }
        };
        fetchDatos();
    }, [id, caminoId]);

    const manejarCompletado = ({ estado, puntos, feedback }: ResultadoMision) => {
        setFeedbackIA(feedback ?? null);
        setPuntosGanados(puntos);
        setEstadoResolucion(estado);
    };

    // LÓGICA DE ALISTAMIENTO Y TRANSICIÓN
    const irASiguienteMision = () => {
        const currentIndex = misionesCamino.findIndex(m => m.misionId.toString() === id?.toString());

        if (currentIndex !== -1 && currentIndex < misionesCamino.length - 1) {
            // Hay una misión siguiente: usamos replace para no apilar las pantallas en el historial del celular
            const siguienteMision = misionesCamino[currentIndex + 1];
            router.replace(`/(visitante)/mision-activa/${siguienteMision.misionId}?caminoId=${caminoId}`);
        } else {
            // Es la última misión del camino (VIS12)
            router.replace(`/(visitante)/resultados-camino?caminoId=${caminoId}`);
        }
    };

    const getMensajeError = () => {
        if (mision?.tipo === 'QR_OBJETO') return 'Ese no es el código correcto. Revisá el objeto y volvé a escanear.';
        if (mision?.tipo === 'TRIVIA') return 'Esa no es la respuesta correcta. Pensalo bien y reintentá.';
        return 'El curador determinó que tu respuesta no es del todo exacta. Podés reintentarlo.';
    };

    const esParcial = estadoResolucion === 'PARCIAL';
    const esExitoso = estadoResolucion === 'CORRECTO' || esParcial;
    // La trivia no tiene reintento: si se falla, la misión se cierra con 0 puntos y se continúa
    const esTriviaFallida = estadoResolucion === 'INCORRECTO' && mision?.tipo === 'TRIVIA';
    const comunicarContinuar = esExitoso || esTriviaFallida;

    if (cargandoDatos || animacionEntrada) {
        return (
            <View key="cargando" className="flex-1 bg-slate-50 items-center justify-center">
                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
                    <MaterialCommunityIcons name="timer-sand" size={40} color="#3b82f6" />
                </View>
                <Text className="text-2xl font-black text-slate-800">Preparando desafío...</Text>
                <Text className="text-slate-500 mt-2">Acomodando los artefactos del museo</Text>
                <ActivityIndicator size="large" color="#3b82f6" className="mt-8" />
            </View>
        );
    }

    if (!mision) {
        return (
            <View key="error" className="flex-1 bg-slate-50 items-center justify-center px-6">
                <Text className="text-lg text-slate-800 font-bold mb-2">Error de Sincronización</Text>
                <Text className="text-center text-slate-500 mb-6">No se pudo cargar la misión. Volvé al inicio del camino e intentá nuevamente.</Text>
                <Pressable onPress={() => router.back()} className="bg-blue-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Volver al Camino</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View key="contenido" className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            {/* Header para todas las misiones */}
            {estadoResolucion === 'PENDIENTE' && (
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
                        <Ionicons name="close" size={24} color="#64748b" />
                    </Pressable>
                    <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                        <MaterialCommunityIcons name="star-circle" size={16} color="#3b82f6" />
                        <Text className="text-blue-700 font-bold text-xs ml-1">{mision.puntos} PTS</Text>
                    </View>
                </View>
            )}

            <View className="flex-1">
                {estadoResolucion === 'PENDIENTE' ? (
                    <View className="flex-1">
                        {/* FLUJO ESPECIAL PARA QR_OBJETO */}
                        {mision.tipo === 'QR_OBJETO' ? (
                            <>
                                {/* Contexto compacto arriba */}
                                <View className="px-6 py-6 bg-white shadow-sm">
                                    <Text className="text-2xl font-black text-slate-800 mb-2">{mision.titulo}</Text>
                                    <Text className="text-base text-slate-600 leading-relaxed">{mision.descripcion}</Text>
                                </View>
                                
                                {/* Cámara ocupa el resto */}
                                <View className="flex-1">
                                    <EscanerQR mision={mision} onEvaluar={manejarCompletado} />
                                </View>
                            </>
                        ) : (
                            /* FLUJOS PARA TRIVIA Y EXPLICACION */
                            <>
                                <View className="px-6 py-6 bg-white shadow-sm mb-4">
                                    <Text className="text-2xl font-black text-slate-800 mb-2">{mision.titulo}</Text>
                                    <Text className="text-base text-slate-600 leading-relaxed">{mision.descripcion}</Text>
                                </View>

                                {mision.tipo === 'TRIVIA' && <TriviaOpciones mision={mision} onEvaluar={manejarCompletado} />}
                                {mision.tipo === 'EXPLICACION' && <RespuestaIA mision={mision} onEvaluar={manejarCompletado} />}
                            </>
                        )}
                    </View>
                ) : (
                    <View className="flex-1 justify-center">
                        <View className="items-center px-6">
                            <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                                estadoResolucion === 'CORRECTO' ? 'bg-emerald-100' : esParcial ? 'bg-amber-100' : 'bg-red-100'
                            }`}>
                                <Ionicons
                                    name={estadoResolucion === 'CORRECTO' ? 'checkmark-circle' : esParcial ? 'alert-circle' : 'close-circle'}
                                    size={64}
                                    color={estadoResolucion === 'CORRECTO' ? '#10b981' : esParcial ? '#d97706' : '#ef4444'}
                                />
                            </View>
                            <Text className="text-3xl font-black text-slate-800 mb-2 text-center">
                                {estadoResolucion === 'CORRECTO' ? '¡Misión Cumplida!' : esParcial ? 'Misión completada' : 'Misión Fallida'}
                            </Text>
                            <Text className="text-base text-slate-500 text-center mb-8">
                                {esExitoso
                                    ? `Ganaste ${puntosGanados} de ${mision.puntos} puntos.`
                                    : `Obtuviste ${puntosGanados} de ${mision.puntos} puntos.`}
                            </Text>

                            {/* Feedback QR correcto: mostrar datos históricos */}
                            {mision.tipo === 'QR_OBJETO' && estadoResolucion === 'CORRECTO' && mision.objeto?.datosHistoricos && (
                                <View className="w-full bg-blue-50 p-4 rounded-2xl border border-blue-200 mb-8">
                                    <Text className="text-sm text-blue-700 leading-relaxed italic">{mision.objeto.datosHistoricos}</Text>
                                </View>
                            )}

                            {/* Feedback QR incorrecto: mostrar mensaje de error */}
                            {mision.tipo === 'QR_OBJETO' && estadoResolucion === 'INCORRECTO' && (
                                <View className="w-full mb-8">
                                    <Text className="text-sm text-slate-500 text-center leading-relaxed italic">{getMensajeError()}</Text>
                                </View>
                            )}

                            {/* Feedback para Trivia incorrecto: mostrar el feedback del backend */}
                            {mision.tipo === 'TRIVIA' && esTriviaFallida && feedbackIA && (
                                <View className="w-full mb-8">
                                    <Text className="text-sm text-slate-500 text-center leading-relaxed italic">{feedbackIA}</Text>
                                </View>
                            )}

                            {/* Feedback para EXPLICACION parcial */}
                            {mision.tipo === 'EXPLICACION' && esParcial && feedbackIA && (
                                <View className="w-full mb-8">
                                    <Text className="text-sm text-slate-500 text-center leading-relaxed italic">{feedbackIA}</Text>
                                </View>
                            )}

                            <Pressable
                                onPress={
                                    comunicarContinuar
                                        ? irASiguienteMision
                                        : () => {
                                            setFeedbackIA(null);
                                            setPuntosGanados(0);
                                            setEstadoResolucion('PENDIENTE');
                                        }
                                }
                                className={`w-full h-14 rounded-2xl items-center justify-center flex-row mt-6 ${comunicarContinuar ? 'bg-blue-600' : 'bg-slate-800'}`}
                            >
                                <Text className="text-white font-bold text-lg mr-2">
                                    {comunicarContinuar ? 'Continuar Camino' : 'Reintentar'}
                                </Text>
                                <Ionicons name={comunicarContinuar ? "arrow-forward" : "refresh"} size={20} color="white" />
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
