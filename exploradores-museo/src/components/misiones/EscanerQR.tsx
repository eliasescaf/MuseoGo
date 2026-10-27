import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVisitanteStore } from '../../store/useVisitanteStore';
import { API_URL } from '../../config/api';
import type { ResultadoMision } from '../../types/mision';

export default function EscanerQR({ mision, onEvaluar }: { mision: any, onEvaluar: (resultado: ResultadoMision) => void }) {
    const [permiso, pedirPermiso] = useCameraPermissions();
    const { id: visitanteId } = useVisitanteStore();
    const insets = useSafeAreaInsets();
    const [escaneado, setEscaneado] = useState(false);
    const [evaluando, setEvaluando] = useState(false);
    const [zoom, setZoom] = useState(0); 

    if (!permiso) {
        return <View className="flex-1 bg-slate-50 items-center justify-center"><ActivityIndicator size="large" color="#3b82f6" /></View>;
    }

    if (!permiso.granted) {
        return (
            <View className="flex-1 px-6 items-center justify-center bg-slate-50">
                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
                    <MaterialCommunityIcons name="camera-off" size={40} color="#3b82f6" />
                </View>
                <Text className="text-2xl font-black text-slate-800 mb-2 text-center">Cámara Bloqueada</Text>
                <Text className="text-slate-500 text-center mb-8">
                    Necesitamos acceso a tu cámara para poder identificar los objetos del museo mediante su código QR.
                </Text>
                <Pressable 
                    onPress={pedirPermiso}
                    className="w-full h-14 bg-blue-600 rounded-2xl items-center justify-center flex-row shadow-sm"
                >
                    <Text className="text-white font-bold text-lg mr-2">Habilitar Cámara</Text>
                    <Ionicons name="camera" size={20} color="white" />
                </Pressable>
            </View>
        );
    }

    const manejarEscaneo = async ({ data }: { data: string }) => {
        if (escaneado || evaluando) return;
        
        setEscaneado(true);
        setEvaluando(true);

        try {
            const response = await fetch(`${API_URL}/ia/evaluar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitanteId,
                    misionId: mision.id,
                    respuesta: data?.trim() || '',
                }),
            });

            const resultado = await response.json();

            if (!response.ok) {
                console.error("Error validando QR:", resultado.error);
                setEscaneado(false);
                setEvaluando(false);
                return;
            }

            const correcto = (resultado.puntaje ?? 0) >= 100;
            const puntos = Math.round(((mision.puntos ?? 0) * (resultado.puntaje ?? 0)) / 100);

            setTimeout(() => {
                onEvaluar({
                    estado: correcto ? 'CORRECTO' : 'INCORRECTO',
                    puntos,
                    feedback: resultado.feedback,
                });
            }, 600);
        } catch (error) {
            console.error("Error de red validando QR:", error);
            setEscaneado(false);
            setEvaluando(false);
        }
    };

    const acercar = () => setZoom(prev => Math.min(prev + 0.1, 1));
    const alejar = () => setZoom(prev => Math.max(prev - 0.1, 0));

    return (
        <View className="flex-1 rounded-3xl overflow-hidden border border-slate-200" style={{ marginBottom: insets.bottom + 16 }}>
            <CameraView 
                style={StyleSheet.absoluteFill}
                facing="back"
                zoom={zoom}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={escaneado ? undefined : manejarEscaneo}
            >
                <View className="flex-1 bg-black/40 justify-center items-center">
                    
                    <View className="w-64 h-64 border-2 border-white/50 rounded-2xl justify-center items-center bg-transparent">
                        <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                        <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                        
                        {evaluando && (
                            <View className="bg-black/60 p-4 rounded-xl flex-row items-center gap-2">
                                <ActivityIndicator color="white" />
                                <Text className="text-white font-bold text-sm">Validando objeto...</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white font-bold mt-8 text-center px-8 text-base drop-shadow-md">
                        Enfocá el código QR del objeto {"\n"} para completar la misión
                    </Text>

                    <View className="absolute bottom-8 flex-row items-center bg-black/60 rounded-full px-4 py-2 gap-6">
                        <Pressable 
                            onPress={alejar} 
                            disabled={zoom === 0}
                            className={`p-3 rounded-full ${zoom === 0 ? 'opacity-50' : 'active:bg-white/20'}`}
                        >
                            <MaterialCommunityIcons name="minus" size={28} color="white" />
                        </Pressable>
                        
                        <View className="items-center w-16">
                            <Text className="text-white font-bold text-sm">ZOOM</Text>
                            <Text className="text-blue-400 font-black text-xs">{Math.round(zoom * 10)}x</Text>
                        </View>

                        <Pressable 
                            onPress={acercar} 
                            disabled={zoom === 1}
                            className={`p-3 rounded-full ${zoom === 1 ? 'opacity-50' : 'active:bg-white/20'}`}
                        >
                            <MaterialCommunityIcons name="plus" size={28} color="white" />
                        </Pressable>
                    </View>

                </View>
            </CameraView>
        </View>
    );
}