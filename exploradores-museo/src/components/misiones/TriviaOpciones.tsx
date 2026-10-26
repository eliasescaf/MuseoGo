import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisitanteStore } from '../../store/useVisitanteStore';
import { API_URL } from '../../config/api';
import type { ResultadoMision } from '../../types/mision';

export default function TriviaOpciones({ mision, onEvaluar }: { mision: any, onEvaluar: (resultado: ResultadoMision) => void }) {
    const { id: visitanteId } = useVisitanteStore();
    const insets = useSafeAreaInsets();
    
    const [opciones, setOpciones] = useState<string[]>([]);
    const [seleccionada, setSeleccionada] = useState<string | null>(null);
    const [evaluando, setEvaluando] = useState(false);

    useEffect(() => {
        if (mision.opciones) {
            // Aseguramos que sea un array (dependiendo de cómo lo devuelva tu ORM)
            const parsedOptions = typeof mision.opciones === 'string' 
                ? JSON.parse(mision.opciones) 
                : mision.opciones;
            
            // Filtramos opciones vacías por seguridad
            const validOptions = parsedOptions.filter((o: string) => o && o.trim() !== '');

            // Algoritmo de Fisher-Yates rápido para mezclar las opciones aleatoriamente
            const mezcladas = [...validOptions].sort(() => Math.random() - 0.5);
            setOpciones(mezcladas);
        }
    }, [mision.opciones]);

    const enviarRespuesta = async () => {
        if (!seleccionada || evaluando) return;
        setEvaluando(true);

        try {
            const response = await fetch(`${API_URL}/ia/evaluar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitanteId,
                    misionId: mision.id,
                    // Enviamos el texto exacto; tu controlador normaliza y compara el texto (mision.respuestaCorrecta)
                    respuesta: seleccionada 
                })
            });

            const data = await response.json();

            if (response.ok) {
                const puntos = Math.round(((mision.puntos ?? 0) * (data.puntaje ?? 0)) / 100);

                // Pequeña pausa para que se vea el botón de carga antes de la transición
                setTimeout(() => {
                    onEvaluar({
                        estado: data.puntaje >= 100 ? 'CORRECTO' : 'INCORRECTO',
                        puntos,
                        feedback: data.feedback,
                    });
                }, 800);
            } else {
                console.error("Error validando trivia:", data.error);
                setEvaluando(false);
            }
        } catch (error) {
            console.error("Error de red:", error);
            setEvaluando(false);
        }
    };

    return (
        <View className="flex-1 px-2" style={{ paddingBottom: insets.bottom }}>
            <View className="items-center mb-6">
                <View className="bg-violet-100 px-4 py-1.5 rounded-full flex-row items-center">
                    <MaterialCommunityIcons name="format-list-checks" size={16} color="#8b5cf6" />
                    <Text className="text-xs font-bold text-violet-700 uppercase tracking-widest ml-1">
                        Seleccioná una opción
                    </Text>
                </View>
            </View>

            <View className="gap-3 mb-8">
                {opciones.map((opcion, index) => {
                    const esSeleccionada = seleccionada === opcion;
                    
                    return (
                        <Pressable 
                            key={index}
                            onPress={() => setSeleccionada(opcion)}
                            disabled={evaluando}
                            className={`p-4 rounded-2xl border-2 flex-row items-center justify-between transition-colors ${
                                esSeleccionada 
                                    ? 'bg-violet-50 border-violet-500' 
                                    : 'bg-white border-slate-200 active:bg-slate-50'
                            }`}
                        >
                            <Text className={`text-base font-medium flex-1 mr-4 ${
                                esSeleccionada ? 'text-violet-900 font-bold' : 'text-slate-700'
                            }`}>
                                {opcion}
                            </Text>
                            
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                esSeleccionada ? 'border-violet-500' : 'border-slate-300'
                            }`}>
                                {esSeleccionada && <View className="w-3 h-3 rounded-full bg-violet-500" />}
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <Pressable 
                onPress={enviarRespuesta}
                disabled={!seleccionada || evaluando}
                className={`w-full h-14 rounded-2xl items-center justify-center flex-row shadow-sm mt-auto mb-6 ${
                    !seleccionada || evaluando ? 'bg-slate-300' : 'bg-violet-600 active:bg-violet-700'
                }`}
            >
                {evaluando ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className="text-white font-bold text-lg mr-2">Confirmar Respuesta</Text>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                    </>
                )}
            </Pressable>
        </View>
    );
}