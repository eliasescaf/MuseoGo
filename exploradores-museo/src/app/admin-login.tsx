import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config/api';
import { useAdminStore } from '../store/useAdminStore';

export default function IngresoAdminScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cargando, setCargando] = useState(false);
    
    const [credencial, setCredencial] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAdminStore();

    const ingresar = async () => {
        if (!credencial.trim() || !password.trim()) {
            Alert.alert("Error", "El nombre/email y la contraseña son obligatorios");
            return;
        }

        setCargando(true);
        try {
            const respuesta = await fetch(`${API_URL}/admin/login`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identificador: credencial.trim(), 
                    password: password.trim()
                })
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                login(data.id, data.nombre, data.email);
                Toast.show({
                    type: 'success', 
                    text1: '¡Hola de nuevo!',
                    text2: 'Iniciaste sesión como Administrador',
                    position: 'top',
                    visibilityTime: 3000, 
                    topOffset: 50, 
                });
                router.replace("/(admin)/caminos");
            } else {
                const errorData = await respuesta.json();
                console.log("El backend respondió:", respuesta.status, errorData);
                Alert.alert("Error", "Credenciales incorrectas. Intentá nuevamente.");
            }
        }
        catch (error) {
            console.error("Error de Fetch en React Native:", error);
            Alert.alert("Error", "No se pudo conectar con el servidor");
        } finally {
            setCargando(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <View className="flex-1 px-6 justify-center" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                
                <View className="items-center mb-10">
                    <View className="bg-blue-100 p-6 rounded-full mb-4">
                        <MaterialCommunityIcons name="shield-account-outline" size={64} color="#2563eb" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-800 text-center">
                        Panel de Control
                    </Text>
                    <Text className="text-base text-slate-500 text-center mt-2">
                        Ingresá tus credenciales para administrar el museo
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Nombre o Email</Text>
                    <TextInput 
                        value={credencial}
                        onChangeText={setCredencial}
                        placeholder="Ej: admin o admin@museo.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-800 mb-6 focus:border-blue-500 focus:bg-white"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Contraseña</Text>
                    <TextInput 
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true} 
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-800 mb-6 focus:border-blue-500 focus:bg-white"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Pressable 
                        onPress={ingresar}
                        disabled={cargando}
                        className={`w-full rounded-2xl h-14 items-center justify-center flex-row ${
                            cargando || !credencial.trim() || !password.trim() ? 'bg-blue-300' : 'bg-blue-600 active:bg-blue-700'
                        }`}
                    >
                        <Text className="text-white font-bold text-lg mr-2">
                            {cargando ? 'Ingresando...' : 'Ingresar al Panel'}
                        </Text>
                        {!cargando && <MaterialCommunityIcons name="arrow-right" size={20} color="white" />}
                    </Pressable>
                </View>

            </View>
        </KeyboardAvoidingView>
    ); 
}