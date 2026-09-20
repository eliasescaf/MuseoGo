import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import {API_URL} from "../../config/api";

export default function CrearCaminoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(useCallback(()=>{
    setNombre("");
    setDuracion("");
    setDescripcion("");
  }, [])
  );

    

  const [misionesSeleccionadas, setMisionesSeleccionadas] = useState([
    {id: 1, titulo: "Misión 1"}
  ]);

  const guardarCamino = async () => {
    if(!nombre.trim() || !descripcion.trim()){{
      Alert.alert("Error", "El nombre y la descripción son obligatorios.");
      return;
    }}

    setGuardando(true);

    try{
      const respuesta = await fetch(`${API_URL}/caminos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          descripcion: descripcion,
          duracion: parseInt(duracion),
          activo: true
        }),
      });
      
      if(respuesta.ok){
        Alert.alert("Exito", "El camino se creó correctamente");
        router.replace("/(admin)/caminos");
      } else {
        Alert.alert("Error", "Hubo un problema al crear el camino");
      }
    } catch (error){
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setGuardando(false);
    }
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
          Nuevo Camino
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>


        <View className="gap-6 pb-20">
          
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

        <View className="pt-6 border-t border-slate-100 pb-20">
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
      </ScrollView>

      <View className="p-6 border-t border-slate-100 bg-white" style={{ paddingBottom: insets.bottom + 20 }}>
        <Button 
          label="Guardar Camino" 
          className="w-full bg-blue-600 rounded-full h-14"
          onPress={guardarCamino}
          disabled={guardando} 
        />
      </View>

    </View>
  );
}