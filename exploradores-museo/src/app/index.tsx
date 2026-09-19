import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-sky-50 pt-12">

      <View className="px-8 mb-4">
        <Text className="text-5xl font-nunito text-blue-500 tracking-tighter">
          MuseoGo
        </Text>
        <Text className="text-xl font-bold text-slate-500">Explorá jugando</Text>
      </View>

      <View className=" flex-1 mt-8 pb-12 px-8 justify-around">

        <View className="items-center mb-10">
          <View className="bg-emerald-100 rounded-full mb-3 px-4 py-1.5 border border-emerald-200 flex-row items-center gap-2">
            <FontAwesome6 name="trophy" size={8} color="black" />
            <Text className="text-xs text-emerald-700 tracking-widest">Misiones y descubrimientos</Text>
          </View>
          <Text className="text-2xl text-center text-slate-700 font-black mb-6">
            ¡Empezá tu propia aventura!
          </Text>
          <Text className="text-gray-400 text-center font-semibold">
            Generá salas para jugar con un equipo o realizá misiones en solitario.
          </Text>
        </View>

        <View className="gap-4 mb-8 w-full">
          
          <Pressable 
            onPress={() => router.push("/(visitante)/ingreso")} 
            className="flex-row min-h-[76px] items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-sm border border-slate-200 active:opacity-80"
            style={{ transform: [{ scale: 1 }] }} // Evita bugs de renderizado con active en algunos celus
          >
            <View className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
              <FontAwesome6 name="map-location-dot" size={24} color="#3b82f6" />
            </View>
            
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-800">
                Soy Visitante
              </Text>
              <Text className="text-sm font-semibold text-slate-500 mt-0.5">
                Ingresá tu apodo para jugar
              </Text>
            </View>

            <View className="items-center justify-center">
              <Text className="text-sm font-extrabold text-blue-500 uppercase tracking-wider">
                Jugar
              </Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => router.push("/(admin)/misiones")}
            className="flex-row min-h-[76px] items-center gap-4 rounded-3xl bg-sky-50/50 px-5 py-4 border border-slate-200/60 active:opacity-80"
          >
            <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200/50">
              <Ionicons name="settings-sharp" size={20} color="#64748b" />
            </View>
            
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-700">
                Administrador
              </Text>
              <Text className="text-xs font-semibold text-slate-500 mt-0.5">
                Gestión de salas y misiones
              </Text>
            </View>

            <View className="items-center justify-center">
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </View>
          </Pressable>

        </View>
      </View>
    </View>
  );
}