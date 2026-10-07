import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, TextInput, View, Alert, ActivityIndicator, LogBox, Modal, FlatList } from "react-native";
import { useState, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { API_URL } from "../../../config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

LogBox.ignoreLogs([
  'findNodeHandle is deprecated in StrictMode',
  'Warning: findNodeHandle is deprecated'
]);

export default function DetalleCaminoScreen(){
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();

    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [duracion, setDuracion] = useState("");
    const [activo, setActivo] = useState(true);
    const [misionesSeleccionadas, setMisionesSeleccionadas] = useState<any[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [misionesDisponibles, setMisionesDisponibles] = useState<any[]>([]);
    const [cargandoMisiones, setCargandoMisiones] = useState(false);

    useFocusEffect(
        useCallback(() => {
        const cargarCamino = async () => {
            try {
                const respuesta = await fetch(`${API_URL}/caminos/${id}`)
                if (respuesta.ok) {
                    const camino = await respuesta.json();
                    setNombre(camino.nombre);
                    setDescripcion(camino.descripcion);
                    setDuracion(camino.duracion ? camino.duracion.toString() : "");
                    setActivo(camino.activo);

                    if (camino.misiones) {
                        const misionesMapeadas = camino.misiones.map((relacion: any) => ({
                            id: relacion.mision.id,
                            titulo: relacion.mision.titulo,
                            tipo: relacion.mision.tipo,
                            descripcion: relacion.mision.descripcion,
                            activo: relacion.mision.activo, // Capturamos estado de la misión
                            objeto: relacion.mision.objeto  // Capturamos el objeto asociado
                        }));
                        setMisionesSeleccionadas(misionesMapeadas);
                    }
                } else {
                    Alert.alert("Error", "No se pudo cargar el camino");
                    router.replace("/(admin)/caminos");
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "No se pudo conectar con el servidor");
            } finally {
                setCargando(false);
            }
        }
        cargarCamino();

        return () => {};
    }, [id])
    );
    
    const editarCamino = async () => {
        try {
            if (!nombre.trim() || !descripcion.trim()) {
                Alert.alert("Error", "El nombre y la descripcion no pueden estar vacios");
                return;
            }

            setProcesando(true);

            const respuesta = await fetch(`${API_URL}/caminos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    descripcion,
                    duracion: Number(duracion),
                    activo,
                    misiones: misionesSeleccionadas.map((m, index) => ({
                        misionId: m.id,
                        orden: index + 1
                    }))
                }),
            });

            if (respuesta.ok) {
                Alert.alert("Éxito", "El camino fue actualizado correctamente");
                router.replace("/(admin)/caminos");
            } else {
                Alert.alert("Error", "Hubo un error al actualizar el camino");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo conectar con el servidor");
        } finally {
            setProcesando(false);
        }
    }

    const confirmarEliminar = async () => {
        Alert.alert("¿Eliminar camino?", "Esta acción no se puede deshacer", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: async () => {
                setProcesando(true);
                try {
                    const respuesta = await fetch(`${API_URL}/caminos/${id}`, { method: 'DELETE' });

                    if (respuesta.ok) {
                        Alert.alert("Éxito", "El camino fue eliminado");
                        router.replace("/(admin)/caminos")
                    } else {
                        Alert.alert("Error", "Hubo un problema al eliminar el camino");
                        setProcesando(false);
                    }
                } catch (error) {
                    console.error(error);
                    Alert.alert("Error", "No se pudo conectar con el servidor");
                } finally {
                    setProcesando(false);
                }
            }}
        ]);
    };

    const abrirModalMisiones = async () => {
        setModalVisible(true);
        setCargandoMisiones(true);
        try {
            const respuesta = await fetch(`${API_URL}/misiones`);
            if (respuesta.ok) {
                const data = await respuesta.json();
                // Filtramos para que el admin solo pueda agregar misiones sanas (activas y sin objetos inactivos)
                const misionesSanas = data.filter((m: any) => m.activo && (!m.objeto || m.objeto.activo !== false));
                setMisionesDisponibles(misionesSanas);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar las misiones");
        } finally {
            setCargandoMisiones(false);
        }
    };

    const agregarMision = (mision: any) => {
        if (misionesSeleccionadas.some(m => m.id === mision.id)) {
            Alert.alert("Aviso", "Esta misión ya está en el recorrido");
            return;
        }
        setMisionesSeleccionadas([...misionesSeleccionadas, mision]);
        setModalVisible(false);
    };

    const removerMision = (id: number) => {
        setMisionesSeleccionadas(misionesSeleccionadas.filter(m => m.id !== id));
    };

    if (cargando) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            
            <View className="flex-row items-center px-4 py-4 border-b border-slate-100">
                <Pressable onPress={() => router.replace("/(admin)/caminos")} className="p-2 -ml-2 active:bg-slate-100 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </Pressable>
                <Text className="text-lg font-bold text-slate-800 ml-2">Detalle del camino</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="gap-6">
                    <View>
                        <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Nombre del recorrido</Text>
                        <Input placeholder="Ej: Tour Jurásico Interactivo" value={nombre} onChangeText={setNombre} />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Duración estimada (minutos)</Text>
                        <Input placeholder="Ej: 45" keyboardType="numeric" value={duracion} onChangeText={setDuracion} />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Descripción</Text>
                        <TextInput 
                            placeholder="Describe el recorrido y lo que los visitantes aprenderán."
                            multiline
                            numberOfLines={4}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 focus:border-blue-500"
                            style={{ minHeight: 100, textAlignVertical: 'top' }}
                        />
                    </View>
                </View>

                <View className="pt-6 border-t border-slate-100 mt-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-lg font-bold text-slate-800">Misiones del Recorrido</Text>
                            <Text className="text-xs text-slate-500">Agregá los retos en orden</Text>
                        </View>
                    </View>

                    <Pressable onPress={abrirModalMisiones} className="flex-row items-center justify-center bg-blue-50 py-3 rounded-xl border border-blue-200 border-dashed mb-4 active:bg-blue-100">
                        <FontAwesome6 name="plus" size={16} color="#2563eb" />
                        <Text className="text-blue-600 font-bold ml-2">Seleccionar Misión</Text>
                    </Pressable>

                    <View className="gap-2">
                        {misionesSeleccionadas.map((mision, index) => {
                            // Evaluamos si debe mostrarse gris/inactiva
                            const misionInactiva = mision.activo === false;
                            const objetoInactivo = mision.objeto && mision.objeto.activo === false;
                            const estaDeshabilitada = misionInactiva || objetoInactivo;

                            return (
                                <View 
                                    key={mision.id} 
                                    className={`flex-row items-center p-3 rounded-xl border ${estaDeshabilitada ? 'bg-slate-100 border-slate-200 opacity-80' : 'bg-slate-50 border-slate-200'}`}
                                >
                                    <View className="bg-slate-200 h-6 w-6 rounded-full items-center justify-center mr-3">
                                        <Text className="text-xs font-bold text-slate-700">{index + 1}</Text>
                                    </View>
                                    
                                    <View className="flex-1 pr-2">
                                        <Text className={`font-semibold ${estaDeshabilitada ? 'text-slate-500' : 'text-slate-700'}`}>
                                            {mision.titulo}
                                        </Text>
                                        
                                        {/* Alerta de Objeto Inactivo */}
                                        {objetoInactivo && (
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="warning-outline" size={12} color="#d97706" />
                                                <Text className="text-[10px] font-bold text-amber-700 ml-1">
                                                    Objeto inactivo (Paso bloqueado)
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {/* Alerta de Misión Inactiva */}
                                        {misionInactiva && !objetoInactivo && (
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="eye-off-outline" size={12} color="#475569" />
                                                <Text className="text-[10px] font-bold text-slate-500 ml-1">
                                                    Misión inactiva manualmente
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <Pressable onPress={() => removerMision(mision.id)} className="p-2 active:bg-red-50 rounded-lg">
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View className="flex-row items-center justify-between py-4 border-t border-slate-100 mt-6">
                    <View>
                        <Text className="text-base font-bold text-slate-800">Camino Activo</Text>
                        <Text className="text-xs text-slate-500">Visible para los visitantes</Text>
                    </View>
                    <Pressable 
                        onPress={() => setActivo(!activo)}
                        className={`w-14 h-8 rounded-full justify-center px-1 transition-colors ${activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                        <View className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${activo ? 'translate-x-6' : 'translate-x-0'}`} />
                    </Pressable>
                </View>
            </ScrollView>

            <View className="p-6 border-t border-slate-100 bg-white flex-row gap-4" style={{ paddingBottom: insets.bottom + 20 }}>
                <Pressable onPress={confirmarEliminar} className="h-14 w-14 bg-red-50 rounded-2xl items-center justify-center border border-red-100 active:bg-red-100">
                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </Pressable>
                
                <View className="flex-1">
                    <Button label="Guardar Cambios" className="w-full bg-blue-600 rounded-2xl h-14" onPress={editarCamino} disabled={procesando} />
                </View>
            </View>

            {/* Modal para agregar misiones */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-slate-900/50">
                    <View className="bg-white rounded-t-3xl h-3/4 p-6" style={{ paddingBottom: insets.bottom }}>
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-slate-800">Agregar Misión</Text>
                                <Text className="text-sm text-slate-500">Seleccioná un reto para el recorrido</Text>
                            </View>
                            <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                                <Ionicons name="close" size={24} color="#64748b" />
                            </Pressable>
                        </View>

                        {cargandoMisiones ? (
                            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                        ) : (
                            <FlatList 
                                data={misionesDisponibles}
                                keyExtractor={(item: any) => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item}) => (
                                    <Pressable 
                                        onPress={() => agregarMision(item)}
                                        className="p-4 rounded-2xl border mb-3 flex-row items-center justify-between border-slate-200 bg-white active:bg-slate-50"
                                    >
                                        <View className="flex-1 pr-4">
                                            <Text className="text-base font-bold text-slate-700">{item.titulo}</Text>
                                            <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>{item.descripcion || "Sin descripción"}</Text>
                                        </View>
                                        <View className="bg-slate-100 px-3 py-1 rounded-full">
                                            <Text className="text-xs font-bold text-slate-500">{item.tipo}</Text>
                                        </View>
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <Text className="text-center text-slate-500 mt-10 font-medium">No hay misiones disponibles.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}