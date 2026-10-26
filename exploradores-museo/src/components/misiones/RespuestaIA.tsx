import { useState, useEffect, useRef, type ComponentRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisitanteStore } from '../../store/useVisitanteStore';
import { API_URL } from '../../config/api';
import type { ResultadoMision } from '../../types/mision';

interface Mensaje {
    id: string;
    emisor: 'ai' | 'user';
    texto: string;
}

export default function RespuestaIA({ mision, onEvaluar }: { mision: any, onEvaluar: (resultado: ResultadoMision) => void }) {
    
    const { alias, id: visitanteId } = useVisitanteStore();
    const insets = useSafeAreaInsets();
    
    const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
    
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [input, setInput] = useState('');
    const [evaluando, setEvaluando] = useState(false);
    const [evaluado, setEvaluado] = useState(false);

    useEffect(() => {
        setMensajes([{
            id: '1',
            emisor: 'ai',
            texto: `¡Hola ${alias}! Soy el Curador IA del museo. ${mision.descripcion}`
        }]);
    }, [mision, alias]);

    const enviarRespuesta = async () => {
        if (!input.trim() || evaluando || evaluado) return;

        const textoUsuario = input.trim();
        const nuevoMensaje: Mensaje = {
            id: Date.now().toString(),
            emisor: 'user',
            texto: textoUsuario
        };

        setMensajes(prev => [...prev, nuevoMensaje]);
        setInput('');
        setEvaluando(true);

        try {
            const response = await fetch(`${API_URL}/ia/evaluar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitanteId: visitanteId, // Ahora TypeScript ya reconoce esta variable
                    misionId: mision.id,
                    respuesta: textoUsuario
                })
            });

            const data = await response.json();

            if (response.ok) {
                // La evaluación es única: se cierra el intento acá, sin pedir que siga respondiendo.
                const puntos = Math.round(((mision.puntos ?? 0) * (data.puntaje ?? 0)) / 100);

                setMensajes(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    emisor: 'ai',
                    texto: data.feedback || (data.correcto ? '¡Excelente deducción!' : 'Mmm, no es exactamente lo que buscaba.')
                }]);

                setEvaluado(true);

                setTimeout(() => {
                    onEvaluar({
                        // 100 = CORRECTO (puntos completos), >0 = PARCIAL (proporcionales), 0 = INCORRECTO (no suma)
                        estado: data.puntaje >= 100 ? 'CORRECTO' : data.puntaje > 0 ? 'PARCIAL' : 'INCORRECTO',
                        puntos,
                        feedback: data.feedback,
                    });
                }, 2200);
            } else {
                setMensajes(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    emisor: 'ai',
                    texto: data.error || 'Hubo un problema de conexión con el museo. ¿Podés repetirlo?'
                }]);
            }
        } catch (error) {
            console.error("Error consultando a la IA:", error);
            setMensajes(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                emisor: 'ai',
                texto: 'Se me cruzaron los cables. Intentá de nuevo.'
            }]);
        } finally {
            setEvaluando(false);
        }
    };
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                <View className="items-center mb-6">
                    <View className="bg-slate-200 px-4 py-1.5 rounded-full">
                        <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Reto de Análisis
                        </Text>
                    </View>
                </View>

                {mensajes.map((msg) => (
                    <View 
                        key={msg.id} 
                        className={`mb-4 flex-row ${msg.emisor === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.emisor === 'ai' && (
                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 mt-1">
                                <MaterialCommunityIcons name="robot" size={18} color="#2563eb" />
                            </View>
                        )}
                        
                        <View 
                            className={`px-4 py-3 max-w-[80%] rounded-2xl ${
                                msg.emisor === 'user' 
                                    ? 'bg-blue-600 rounded-tr-sm' 
                                    : 'bg-white border border-slate-200 rounded-tl-sm shadow-sm'
                            }`}
                        >
                            <Text className={`text-base ${msg.emisor === 'user' ? 'text-white' : 'text-slate-700'}`}>
                                {msg.texto}
                            </Text>
                        </View>
                    </View>
                ))}

                {evaluando && (
                    <View className="flex-row justify-start mb-4">
                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                            <MaterialCommunityIcons name="robot" size={18} color="#2563eb" />
                        </View>
                        <View className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex-row items-center gap-2">
                            <ActivityIndicator size="small" color="#94a3b8" />
                            <Text className="text-slate-500 text-sm italic">El curador está evaluando...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View
                className="px-4 pt-4 bg-white border-t border-slate-200 flex-row items-end"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder={evaluado ? 'Respuesta enviada' : 'Escribí tu respuesta acá...'}
                    multiline
                    maxLength={300}
                    editable={!evaluando && !evaluado}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base text-slate-800 max-h-32"
                />
                <Pressable 
                    onPress={enviarRespuesta}
                    disabled={!input.trim() || evaluando || evaluado}
                    className={`w-12 h-12 rounded-full items-center justify-center ml-3 ${
                        !input.trim() || evaluando || evaluado ? 'bg-slate-200' : 'bg-blue-600 active:bg-blue-700'
                    }`}
                >
                    <Ionicons name="send" size={20} color={!input.trim() || evaluando || evaluado ? '#94a3b8' : 'white'} style={{ marginLeft: 4 }} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}