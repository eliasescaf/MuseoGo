import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useState } from "react";

import {API_URL} from "../../config/api";

export default function CaminosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [caminos, setCaminos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(useCallback(() => {
    setCargando(true);
    fetch(`${API_URL}/caminos`)
      .then(response => response.json())
      .then((data) => {
        setCaminos(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al obtener los caminos:', error);
        setCargando(false);
      })
  }, [])
  );
  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top + 20 }}>
      
      <View className="px-6 mb-6">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          Caminos
        </Text>
        <Text className="text-slate-500 font-semibold mt-1">
          Gestioná los recorridos temáticos
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <Pressable 
          onPress={() => router.push("/(admin)/crear-camino")} 
          className="flex-row items-center gap-4 rounded-3xl bg-blue-500 px-5 py-4 shadow-sm active:bg-blue-600 mb-8"
        >
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesome6 name="plus" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Crear Nuevo Camino
            </Text>
            <Text className="text-xs font-medium text-blue-100 mt-0.5">
              Armar un recorrido con misiones
            </Text>
          </View>
        </Pressable>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Caminos Existentes
        </Text>

        <View className="gap-3 pb-10">
          {cargando ? (
            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
          ): caminos.length === 0 ? (
            <Text className="text-center font-medium text-slate-400">No hay caminos disponibles</Text>
          ) : (
            caminos.map((camino: any) => (
            <Pressable
              onPress={() => router.push(`/(admin)/caminos/${camino.id}`)} 
              key={camino.id}
              className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 active:bg-slate-50"
            >
              <View className="flex-1 pr-4"> 
                <Text className="text-base font-bold text-slate-700">
                  {camino.nombre}
                </Text>
                <Text className="text-xs font-medium text-slate-500 mt-1" numberOfLines={1}>
                    {camino.descripcion}
                </Text>
              </View>

              <View className="items-end gap-2"> 
                
                {camino.duracion ? (
                  <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Ionicons name="time-outline" size={12} color="#64748b" />
                    <Text className="text-[10px] font-bold text-slate-500 ml-1">
                      {camino.duracion} min
                    </Text>
                  </View>
                ) : null}
                <View className={`px-3 py-1 rounded-full ${camino.activo ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  <Text className={`text-[10px] font-bold ${camino.activo ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {camino.activo ? 'ACTIVO' : 'INACTIVO'}
                  </Text>
                </View>

              </View>
            </Pressable>
          )))}
        </View>
      </ScrollView>
    </View>
  );
}