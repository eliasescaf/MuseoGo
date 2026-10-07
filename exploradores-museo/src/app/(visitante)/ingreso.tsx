import {useState} from 'react';
import {View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { API_URL } from '../../config/api';
import { useVisitanteStore } from '../../store/useVisitanteStore';


export default function IngresoVisitanteScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cargando, setCargando] = useState(false);
    const [alias, setAlias] = useState("");
    const {login} = useVisitanteStore();

    const ingresar = async () => {
        if(!alias.trim()){
            Alert.alert("Error", "El alias es obligatorio para empezar");
            return;
        }

        setCargando(true);
        try{
            const respuesta = await fetch(`${API_URL}/visitantes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({alias: alias.trim()})
            });

            if(respuesta.ok){
                const data = await respuesta.json();
                login(data.id, data.alias);
                Toast.show({
                    type: 'info',
                    text1: '¡Bienvenido al Museo!',
                    text2: 'Preparate para tu recorrido',
                    position: 'top',
                    visibilityTime: 3000,
                });
                router.replace("(visitante)/caminos");
            }else{
                Alert.alert("Error", "No se pudo registrar el alias. Intente nuevamente");
            }
        }
        catch(error){
            console.error(error);
            Alert.alert("Error", "No se pudo conectar con el servidor");
        }finally {
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
                        <MaterialCommunityIcons name="compass-outline" size={64} color="#2563eb" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-800 text-center">
                        MuseoGo
                    </Text>
                    <Text className="text-base text-slate-500 text-center mt-2">
                        Ingresá tu alias para registrar tus descubrimientos
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Tu Alias</Text>
                    <TextInput 
                        value={alias}
                        onChangeText={setAlias}
                        placeholder="Ej: IndianaJones99"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-800 mb-6 focus:border-blue-500 focus:bg-white"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Pressable 
                        onPress={ingresar}
                        disabled={cargando}
                        className={`w-full rounded-2xl h-14 items-center justify-center flex-row ${
                            cargando || !alias.trim() ? 'bg-blue-300' : 'bg-blue-600 active:bg-blue-700'
                        }`}
                    >
                        <Text className="text-white font-bold text-lg mr-2">
                            {cargando ? 'Ingresando...' : 'Comenzar Recorrido'}
                        </Text>
                        {!cargando && <MaterialCommunityIcons name="arrow-right" size={20} color="white" />}
                    </Pressable>
                </View>

            </View>
        </KeyboardAvoidingView>
    ); 
}