import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../../config/api';
import { useVisitanteStore } from '../../../store/useVisitanteStore';
import Zoomable from '../../../components/Zoomable';

export default function UnirseSalaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id: visitanteId } = useVisitanteStore();

    const [codigo, setCodigo] = useState('');
    const [uniendose, setUniendose] = useState(false);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            router.replace('/(visitante)/caminos');
            return true;
        });
        return () => backHandler.remove();
    }, [router]);

    const unirse = async () => {
        const pin = codigo.trim();
        if (pin.length !== 6) {
            Alert.alert("Error", "El PIN tiene 6 dígitos");
            return;
        }
        if (uniendose) return;
        setUniendose(true);
        try {
            const respuesta = await fetch(`${API_URL}/salas/unirse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: pin, visitanteId })
            });
            if (respuesta.ok) {
                const sala = await respuesta.json();
                router.replace(`/(visitante)/sala/${sala.id}`);
            } else {
                const error = await respuesta.json().catch(() => null);
                Alert.alert("Error", error?.error ?? "No se pudo entrar a la sala");
                setUniendose(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo conectar al servidor");
            setUniendose(false);
        }
    };

    return (
        <Zoomable>
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center px-4 py-4 border-b border-slate-100 bg-white">
                <Pressable
                    onPress={() => router.replace('/(visitante)/caminos')}
                    className="p-2 -ml-2 active:bg-slate-100 rounded-full"
                >
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </Pressable>
                <Text className="text-lg font-bold text-slate-800 ml-2">Unirse a una sala</Text>
            </View>

            <View className="flex-1 px-6 pt-10">
                <View className="items-center mb-10">
                    <View className="h-20 w-20 rounded-3xl bg-blue-50 items-center justify-center mb-4 border border-blue-100">
                        <MaterialCommunityIcons name="account-group" size={38} color="#2563eb" />
                    </View>
                    <Text className="text-2xl font-black text-slate-800 text-center">
                        Explorá con tu grupo
                    </Text>
                    <Text className="text-center text-slate-500 mt-2 leading-relaxed">
                        Ingresá el PIN de 6 dígitos que te compartió el anfitrión de la sala.
                    </Text>
                </View>

                <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
                        PIN de la sala
                    </Text>
                    <TextInput
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={codigo}
                        onChangeText={(texto) => setCodigo(texto.replace(/[^0-9]/g, ''))}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 text-center text-3xl font-black tracking-[10px] text-slate-800"
                        style={{ height: 64 }}
                        autoFocus
                    />
                    <Text className="text-xs text-slate-400 mt-1 ml-1 text-center">
                        Escribí el PIN de 6 dígitos que te pasó el anfitrión de la sala.
                    </Text>
                    <Pressable
                        onPress={unirse}
                        disabled={uniendose || codigo.trim().length !== 6}
                        className={`h-14 rounded-2xl items-center justify-center flex-row mt-4 ${
                            codigo.trim().length === 6 && !uniendose
                                ? 'bg-blue-600 active:bg-blue-700'
                                : 'bg-slate-300'
                        }`}
                    >
                        {uniendose ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="login-variant" size={20} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Entrar a la sala</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
        </Zoomable>
    );
}
