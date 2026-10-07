import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useState } from "react";

import { API_URL } from "../../config/api";

export default function MisionesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [misiones, setMisiones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchMisiones = async () => {
        setCargando(true); 
        try {
          const response = await fetch(`${API_URL}/misiones`);
          const data = await response.json();
          setMisiones(data);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setCargando(false); 
        }
      };
      fetchMisiones();
    }, [])
  );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top + 20 }}>
      
      <View className="px-6 mb-6">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          Misiones
        </Text>
        <Text className="text-slate-500 font-semibold mt-1">
          Gestioná los objetivos que cumplirán los visitantes
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <Pressable 
          onPress={() => router.push("/(admin)/crear-mision")} 
          className="flex-row items-center gap-4 rounded-3xl bg-blue-500 px-5 py-4 shadow-sm active:bg-blue-600 mb-8"
        >
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesome6 name="plus" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Crear Nueva Mision
            </Text>
            <Text className="text-xs font-medium text-blue-100 mt-0.5">
              Armar una nueva misión
            </Text>
          </View>
        </Pressable>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Misiones Existentes
        </Text>

        <View className="gap-3 pb-10">
          {cargando ? (
            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
          ): misiones.length === 0 ? (
            <Text className="text-center font-medium text-slate-400">No hay misiones disponibles</Text>
          ) : (
            misiones.map((mision: any) => {
              const dependeObjetoInactivo = mision.objeto && mision.objeto.activo === false;

              return (
                <Pressable
                  onPress={() => router.push(`/(admin)/misiones/${mision.id}`)} 
                  key={mision.id}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                    dependeObjetoInactivo 
                      ? 'bg-slate-100 border-slate-200 opacity-80' 
                      : 'bg-white border-slate-200 active:bg-slate-50'
                  }`}
                >
                  <View className="flex-1 pr-4"> 
                    <Text className={`text-base font-bold ${dependeObjetoInactivo ? 'text-slate-500' : 'text-slate-700'}`}>
                      {mision.titulo}
                    </Text>
                    <Text className="text-xs font-medium text-slate-500 mt-1" numberOfLines={1}>
                        {mision.descripcion}
                    </Text>
                    {dependeObjetoInactivo && (
                      <View className="flex-row items-center mt-2 bg-amber-100 self-start px-2 py-1 rounded-md">
                        <Ionicons name="warning-outline" size={12} color="#d97706" />
                        <Text className="text-[10px] font-bold text-amber-700 ml-1">
                          Objeto inactivo
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="items-end gap-2 shrink-0"> 
                    {mision.duracion ? (
                      <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Ionicons name="time-outline" size={12} color="#64748b" />
                        <Text className="text-[10px] font-bold text-slate-500 ml-1">
                          {mision.duracion} min
                        </Text>
                      </View>
                    ) : null}
                    
                    <View className={`px-3 py-1 rounded-full ${mision.activo ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <Text className={`text-[10px] font-bold ${mision.activo ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {mision.activo ? 'ACTIVO' : 'INACTIVO'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}