import { Text, View, Pressable, LogBox } from "react-native";
import { useState } from "react";

LogBox.ignoreLogs([
  'findNodeHandle is deprecated in StrictMode',
  'Warning: findNodeHandle is deprecated'
]);

export default function Screen() {
  const [activo, setActivo] = useState(true);

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      
      <View className="mb-8">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          Configuración
        </Text>
        <Text className="text-slate-500 font-semibold mt-1">
          Preferencias del sistema
        </Text>
      </View>

      <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <View className="flex-row items-center justify-between">
          
          <View className="flex-1 pr-4">
            <Text className="text-base font-bold text-slate-800">
              Modo Curador
            </Text>
            <Text className="text-sm font-medium text-slate-500 mt-1">
              Hace visible el contenido curado para los visitantes
            </Text>
          </View>
          
          <Pressable 
            onPress={() => setActivo(!activo)}
            className={`w-14 h-8 rounded-full justify-center px-1 transition-colors ${activo ? 'bg-blue-500' : 'bg-slate-300'}`}
          >
            <View className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${activo ? 'translate-x-6' : 'translate-x-0'}`} />
          </Pressable>
          
        </View>
      </View>

    </View>
  );
}