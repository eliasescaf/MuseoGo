import { Text, View, Pressable, LogBox, Alert, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { API_URL } from "../../config/api";
import Zoomable from "../../components/Zoomable";

LogBox.ignoreLogs([
  'findNodeHandle is deprecated in StrictMode',
  'Warning: findNodeHandle is deprecated'
]);

export default function Screen() {
  const [multijugador, setMultijugador] = useState<boolean | null>(null);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(useCallback(() => {
    fetch(`${API_URL}/config/MULTIJUGADOR`)
      .then(r => r.json())
      .then(data => setMultijugador(data.valor === 'ON'))
      .catch(() => setMultijugador(false));
    return () => {};
  }, []));

  const cambiarMultijugador = async () => {
    if (guardando || multijugador === null) return;
    const nuevoValor = !multijugador;
    setMultijugador(nuevoValor);
    setGuardando(true);
    try {
      const respuesta = await fetch(`${API_URL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: 'MULTIJUGADOR', valor: nuevoValor ? 'ON' : 'OFF' })
      });
      if (!respuesta.ok) setMultijugador(!nuevoValor);
    } catch (error) {
      console.error(error);
      setMultijugador(!nuevoValor);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Zoomable>
    <View className="flex-1 bg-slate-50 px-6 pt-16">

      <View className="mb-8">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          Configuración
        </Text>
        <Text className="text-slate-500 font-semibold mt-1">
          Preferencias del sistema
        </Text>
      </View>

      {/* ADM23: multijugador habilitado/deshabilitado */}
      <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <View className="flex-row items-center justify-between">

          <View className="flex-1 pr-4">
            <Text className="text-base font-bold text-slate-800">
              Multijugador
            </Text>
            <Text className="text-sm font-medium text-slate-500 mt-1">
              Permite que los visitantes creen salas de grupo con PIN y compitan entre ellos
            </Text>
          </View>

          {multijugador === null ? (
            <ActivityIndicator />
          ) : (
            <Pressable
              onPress={cambiarMultijugador}
              disabled={guardando}
              className={`w-14 h-8 rounded-full justify-center px-1 transition-colors ${multijugador ? 'bg-blue-500' : 'bg-slate-300'}`}
            >
              <View className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${multijugador ? 'translate-x-6' : 'translate-x-0'}`} />
            </Pressable>
          )}

        </View>
      </View>

    </View>
    </Zoomable>
  );
}
