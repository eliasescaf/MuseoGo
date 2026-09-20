import { useLocalSearchParams, useRouter } from "expo-router";
import {Ionicons, MaterialCommunityIcons, FontAwesome6} from '@expo/vector-icons';
import { Pressable, ScrollView, Text, TextInput, View, Alert, Image, ActivityIndicator, LogBox } from "react-native";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {API_URL} from "../../../config/api";
import {useSafeAreaInsets} from "react-native-safe-area-context";

LogBox.ignoreLogs([
  'findNodeHandle is deprecated in StrictMode',
  'Warning: findNodeHandle is deprecated'
]);

export default function DetalleCaminoScreen(){
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {id} = useLocalSearchParams();

    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [duracion, setDuracion] = useState("");
    const [activo, setActivo] = useState(true);
    const [misionesSeleccionadas, setMisionesSeleccionadas] = useState<any[]>([]);

    useEffect(() => {
        const cargarCamino = async () => {
            try{
                const respuesta = await fetch(`${API_URL}/caminos/${id}`)
                    if(respuesta.ok){
                        const camino = await respuesta.json();
                        setNombre(camino.nombre);
                        setDescripcion(camino.descripcion);
                        setDuracion(camino.duracion ? camino.duracion.toString() : "");
                        setActivo(camino.activo);
                    }else{
                        Alert.alert("Error", "No se pudo cargar el camino");
                        router.replace("/(admin)/caminos");
                    }
            }
            catch(error){
                console.error(error);
                Alert.alert("Error", "No se pudo conectar con el servidor");
            }finally{
                setCargando(false);
            }
        }
        cargarCamino();
    }, [id]);
    
    const editarCamino = async () => {
        try{
            if(!nombre.trim() || !descripcion.trim()){
                Alert.alert("Error", "El nombre y la descripcion no pueden estar vacios");
                return;
            }

            setProcesando(true);

            const respuesta = await fetch(`${API_URL}/caminos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    nombre: nombre,
                    descripcion: descripcion,
                    duracion: Number(duracion),
                    activo: activo
                }),
            });

            if(respuesta.ok){
                Alert.alert("Exito", "El camino fue actualizado correctamente");
                router.replace("/(admin)/caminos");
            }else{
                Alert.alert("Error", "Hubo un error al actualizar el camino");
            }
        }
        catch(error){
            console.error(error);
            Alert.alert("Error", "No se pudo conectar con el servidor");
        }finally{
            setProcesando(false);
        }
    }

    const confirmarEliminar = async () => {
        Alert.alert("¿Eliminar camino?", "Esta acción no se puede deshacer", [
            {text: "Cancelar", style:"cancel"},
            {text: "Eliminar", style:"destructive", onPress: async () => {
                setProcesando(true);
                try{
                    const respuesta = await fetch(`${API_URL}/caminos/${id}`, {
                        method: 'DELETE'
                    });

                    if(respuesta.ok){
                        Alert.alert("Exito", "El camino fue eliminado");
                        router.replace("/(admin)/caminos")
                    }else{
                        Alert.alert("Error", "Hubo un problema al eliminar el camino");
                        setProcesando(false);
                    }
                }
                catch(error){
                    console.error(error);
                    Alert.alert("Error", "No se pudo conectar con el servidor");
                } finally{
                    setProcesando(false);
                }
            }}
        ]);
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
        <Pressable 
          onPress={() => router.replace("/(admin)/caminos")} 
          className="p-2 -ml-2 active:bg-slate-100 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800 ml-2">
          Detalle del camino
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="gap-6">
          
          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Nombre del recorrido
            </Text>
            <Input 
              placeholder="Ej: Tour Jurásico Interactivo" 
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Duración estimada (minutos)
            </Text>
            <Input 
              placeholder="Ej: 45" 
              keyboardType="numeric"
              value={duracion}
              onChangeText={setDuracion}
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Descripción
            </Text>
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

        <View className="pt-6 border-t border-slate-100">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-bold text-slate-800">Misiones del Recorrido</Text>
              <Text className="text-xs text-slate-500">Agregá los retos en orden</Text>
            </View>
          </View>

          <Pressable className="flex-row items-center justify-center bg-blue-50 py-3 rounded-xl border border-blue-200 border-dashed mb-4 active:bg-blue-100">
            <FontAwesome6 name="plus" size={16} color="#2563eb" />
            <Text className="text-blue-600 font-bold ml-2">Seleccionar Misión</Text>
          </Pressable>

          <View className="gap-2">
            {misionesSeleccionadas.map((mision, index) => (
              <View key={mision.id} className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <View className="bg-slate-50 h-6 w-6 items-center justify-center mr-3">
                  <Text className="text-xs font-bold text-slate-500">{index+1}</Text>
                </View>
                <Text className="flex-1 font-semibold text-slate-700">{mision.titulo}</Text>
                <Pressable className="p-1">
                  <MaterialCommunityIcons name="trash-can-outline" size={20} onChange={() => {}} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
            <View className="flex-row items-center justify-between py-4 border-t border-slate-100">
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
        onPress={editarCamino}
        disabled={procesando} 
      />
    </View>
  </View>
            

    </View>
  );
}
