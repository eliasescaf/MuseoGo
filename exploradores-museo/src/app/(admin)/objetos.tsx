import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {API_URL} from "../../config/api";

export default function ObjetosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [objetos, setObjetos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(useCallback(()=>{
    fetch(`${API_URL}/objetos`)
      .then(response => response.json())
      .then((data) => {
        setObjetos(data);
        setCargando(false);
      }) 
      .catch((error) => {
        console.error('Error al obtener los objetos:', error);
        setCargando(false);
      });
    }, [])
  );


  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top + 20 }}>
      
      <View className="px-6 mb-6">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          Objetos
        </Text>
        <Text className="text-slate-500 font-semibold mt-1">
          Gestioná los objetos de tu museo
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <Pressable 
          onPress={() => router.push("/(admin)/crear-objeto")} 
          className="flex-row items-center gap-4 rounded-3xl bg-blue-500 px-5 py-4 shadow-sm active:bg-blue-600 mb-8"
        >
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesome6 name="plus" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Crear Nuevo Objeto
            </Text>
            <Text className="text-xs font-medium text-blue-100 mt-0.5">
              Registrá tu objeto para usarlo en misiones
            </Text>
          </View>
        </Pressable>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Objetos Existentes
        </Text>

        <View className="gap-3 pb-10">
          {cargando ? (
                      <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                    ) : objetos.length === 0 ? (
                      <Text className="text-center font-medium text-slate-400">No hay objetos disponibles</Text>
                    ) : (
          objetos.map((objeto: any) => (
            <Pressable
              onPress={() => router.push(`/(admin)/objetos/${objeto.id}`)} 
              key={objeto.id}
              className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 active:bg-slate-50"
            >
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-700">
                  {objeto.nombre}
                </Text>
                <Text className="text-xs font-medium text-slate-500 mt-1">
                  {objeto.descripcion}
                </Text>
              </View>
            </Pressable>
          )))}
          
        </View>

      </ScrollView>
    </View>
  );
}