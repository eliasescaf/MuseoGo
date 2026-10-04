import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, TextInput, View, Alert, ActivityIndicator, LogBox, Switch, Modal, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { API_URL } from "../../../config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

LogBox.ignoreLogs([
  'findNodeHandle is deprecated in StrictMode',
  'Warning: findNodeHandle is deprecated'
]);

const TIPOS_MISION = [
    { id: "QR_OBJETO", titulo: "Encontrar Objeto", icono: "qrcode-scan", color: "bg-blue-500" },
    { id: "TRIVIA", titulo: "Trivia múltiple", icono: "format-list-checks", color: "bg-violet-500" },
    { id: "ACERTIJO", titulo: "Adivinanza", icono: "head-lightbulb-outline", color: "bg-amber-500" }
];

export default function DetalleMisionScreen(){
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {id} = useLocalSearchParams();

    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
    const [puntos, setPuntos] = useState("10"); 
    
    const [opcionA, setOpcionA] = useState("");
    const [opcionB, setOpcionB] = useState("");
    const [opcionC, setOpcionC] = useState("");
    const [respuestaAcertijo, setRespuestaAcertijo] = useState("");
    const [objetoId, setObjetoId] = useState<number | null>(null);

    const [objetos, setObjetos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreObjeto, setNombreObjeto] = useState("");
    const [cargandoObjetos, setCargandoObjetos] = useState(false);

    useEffect(() => {
        const cargarMision = async () => {
            try {
                const respuesta = await fetch(`${API_URL}/misiones/${id}`);
                if (respuesta.ok) {
                    const mision = await respuesta.json();
                    
                    setTitulo(mision.titulo || "");
                    setDescripcion(mision.descripcion || "");
                    setTipoSeleccionado(mision.tipo || null);
                    setActivo(mision.activo);
                    setPuntos(mision.puntos ? mision.puntos.toString() : "10");
                    setObjetoId(mision.objetoId || null);
                    setNombreObjeto(mision.objeto?.nombre || "");

                    if (mision.tipo === "TRIVIA" && mision.opciones) {
                        const arrayOpciones = typeof mision.opciones === 'string' ? JSON.parse(mision.opciones) : mision.opciones;
                        setOpcionA(arrayOpciones[0] || "");
                        setOpcionB(arrayOpciones[1] || "");
                        setOpcionC(arrayOpciones[2] || "");
                    } else if (mision.tipo === "ACERTIJO") {
                        setRespuestaAcertijo(mision.respuestaCorrecta || "");
                    }
                    
                } else {
                    Alert.alert("Error", "No se pudo cargar la misión");
                    router.replace("/(admin)/misiones");
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "No se pudo conectar con el servidor");
            } finally {
                setCargando(false);
            }
        };
        cargarMision();
    }, [id]);
    
    const editarMision = async () => {
        if (!titulo.trim() || !tipoSeleccionado) {
            Alert.alert("Error", "El título y el tipo no pueden estar vacíos");
            return;
        }
        if (tipoSeleccionado === "QR_OBJETO" && !objetoId) {
            Alert.alert("Error", "Debes seleccionar un objeto del museo para este tipo de misión");
            return;
        }

        setProcesando(true);

        const payload: any = {
            titulo,
            descripcion,
            tipo: tipoSeleccionado,
            puntos: parseInt(puntos) || 10,
            objetoId,
            activo
        };

        if (tipoSeleccionado === "TRIVIA") {
            payload.opciones = [opcionA, opcionB, opcionC];
            payload.respuestaCorrecta = opcionA;
        } else if (tipoSeleccionado === "ACERTIJO") {
            payload.respuestaCorrecta = respuestaAcertijo;
        }

        try {
            const respuesta = await fetch(`${API_URL}/misiones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (respuesta.ok) {
                Alert.alert("Éxito", "La misión fue actualizada correctamente");
                router.back();
            } else {
                Alert.alert("Error", "Hubo un error al actualizar la misión");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo conectar con el servidor");
        } finally {
            setProcesando(false);
        }
    };

    const confirmarEliminar = () => {
        Alert.alert("¿Eliminar misión?", "Esta acción borrará la misión permanentemente.", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: async () => {
                    setProcesando(true);
                    try {
                        const respuesta = await fetch(`${API_URL}/misiones/${id}`, {
                            method: 'DELETE'
                        });

                        if (respuesta.ok) {
                            Alert.alert("Éxito", "La misión fue eliminada");
                            router.replace("/(admin)/misiones");
                        } else {
                            Alert.alert("Error", "Hubo un problema al eliminar la misión");
                        }
                    } catch (error) {
                        console.error(error);
                        Alert.alert("Error", "Fallo de conexión");
                    } finally {
                        setProcesando(false);
                    }
                }
            }
        ]);
    };

    if (cargando) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 font-medium text-slate-500">Cargando misión...</Text>
            </View>
        );
    }

    const abrirModalObjetos = async () => {
        setModalVisible(true);
        setCargandoObjetos(true);
        try {
            const respuesta = await fetch(`${API_URL}/objetos`);
            if (respuesta.ok) {
                const data = await respuesta.json();
                setObjetos(data);
            } else {
                Alert.alert("Error", "No se pudieron cargar los objetos");
            }
        } catch (error) {
            console.error("Error al cargar objetos:", error);
        } finally {
            setCargandoObjetos(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-100 bg-white">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:bg-slate-100 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="#334155" />
                    </Pressable>
                    <Text className="text-lg font-bold text-slate-800 ml-2">Editar Misión</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                
                <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 mb-6">
                    <View>
                        <Text className="text-base font-bold text-slate-800">Misión Activa</Text>
                        <Text className="text-xs text-slate-500 mt-0.5">Visibilidad en los recorridos</Text>
                    </View>
                    <Switch
                        value={activo}
                        onValueChange={setActivo}
                        trackColor={{ false: "#cbd5e1", true: "#3b82f6" }}
                        thumbColor={"#ffffff"}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Tipo de Reto (No editable)</Text>
                    <View className="flex-row items-center p-4 rounded-2xl border border-slate-200 bg-slate-100 opacity-80">
                        {TIPOS_MISION.map(t => t.id === tipoSeleccionado && (
                            <View key={t.id} className="flex-row items-center">
                                <View className={`h-10 w-10 rounded-xl items-center justify-center ${t.color}`}>
                                    <MaterialCommunityIcons name={t.icono as any} size={20} color="white" />
                                </View>
                                <Text className="ml-3 text-base font-bold text-slate-700">{t.titulo}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Título de la misión</Text>
                    <TextInput value={titulo} onChangeText={setTitulo} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 mb-4" />
                    
                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Descripción</Text>
                    <TextInput value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 mb-4" style={{ minHeight: 80, textAlignVertical: 'top' }} />

                    <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Puntos de recompensa</Text>
                    <TextInput value={puntos} onChangeText={setPuntos} keyboardType="numeric" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800" />
                </View>

                <View className="pt-6 border-t border-slate-200">
                    <Text className="text-base font-bold text-slate-800 mb-4">Detalles del Reto</Text>

                    {tipoSeleccionado === "QR_OBJETO" && (
                        <Pressable 
                            onPress={abrirModalObjetos}
                            className="bg-blue-50 p-4 rounded-2xl border border-blue-200 items-center justify-center py-6 border-dashed active:bg-blue-100"
                        >
                            <MaterialCommunityIcons name="cube-scan" size={32} color="#3b82f6" />
                            <Text className="text-blue-700 font-bold mt-2 text-center">
                                {objetoId 
                                    ? `Objeto vinculado: ${nombreObjeto ? `${nombreObjeto}` : ''}` 
                                    : "Tocar para cambiar el Objeto del museo"}
                            </Text>
                        </Pressable>
                    )}

                    {tipoSeleccionado === "TRIVIA" && (
                        <View className="gap-3">
                            <TextInput value={opcionA} onChangeText={setOpcionA} placeholder="Opción A (Correcta)" className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base" />
                            <TextInput value={opcionB} onChangeText={setOpcionB} placeholder="Opción B (Falsa)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base" />
                            <TextInput value={opcionC} onChangeText={setOpcionC} placeholder="Opción C (Falsa)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base" />
                        </View>
                    )}

                    {tipoSeleccionado === "ACERTIJO" && (
                        <View>
                            <TextInput value={respuestaAcertijo} onChangeText={setRespuestaAcertijo} placeholder="Palabra clave o respuesta secreta" className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-base" />
                        </View>
                    )}
                </View>
            </ScrollView>

            <View className="p-6 border-t border-slate-100 bg-white flex-row gap-4" style={{ paddingBottom: insets.bottom + 20 }}>
                <Pressable 
                onPress={confirmarEliminar}
                className="h-14 w-14 bg-red-50 rounded-2xl items-center justify-center border border-red-100 active:bg-red-100"
                >
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </Pressable>
                
                <View className="flex-1">
                <Button 
                    label="Guardar Cambios" 
                    className="w-full bg-blue-600 rounded-2xl h-14"
                    onPress={editarMision}
                    disabled={procesando} 
                />
                </View>
            </View>
        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-slate-900/50">
                    <View className="bg-white rounded-t-3xl h-3/4 p-6" style={{ paddingBottom: insets.bottom }}>
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-slate-800">Seleccionar Objeto</Text>
                                <Text className="text-sm text-slate-500">¿Qué pieza deben escanear?</Text>
                            </View>
                            <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                                <Ionicons name="close" size={24} color="#64748b" />
                            </Pressable>
                        </View>

                        {cargandoObjetos ? (
                            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                        ) : (
                            <FlatList 
                                data={objetos}
                                keyExtractor={(item: any) => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => (
                                    <Pressable 
                                        onPress={() => {
                                            setObjetoId(item.id);
                                            setNombreObjeto(item.nombre);
                                            setModalVisible(false);
                                        }}
                                        className={`p-4 rounded-2xl border mb-3 flex-row items-center justify-between ${
                                            objetoId === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        <View className="flex-1">
                                            <Text className="text-base font-bold text-slate-700">{item.nombre}</Text>
                                            <Text className="text-xs text-slate-500 mt-1" numberOfLines={1}>{item.descripcion}</Text>
                                        </View>
                                        {objetoId === item.id && (
                                            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                                        )}
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <Text className="text-center text-slate-500 mt-10 font-medium">No hay objetos cargados.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}