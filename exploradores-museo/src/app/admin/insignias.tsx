import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Alert, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import { API_URL } from "../../config/api";

const TIPOS = [
  { valor: 'SIN_PISTAS', etiqueta: 'Sin pistas', detalle: 'Completó el camino sin pedir ninguna pista' },
  { valor: 'PERFECTO', etiqueta: 'Perfecto', detalle: 'Resolvió todas las misiones al primer intento' },
  { valor: 'SIN_FALLOS', etiqueta: 'Sin fallos', detalle: 'No falló ningún intento en todo el camino' },
];

const etiquetaTipo = (tipo: string) => TIPOS.find(t => t.valor === tipo)?.etiqueta ?? tipo;

interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  activo: boolean;
}

export default function InsigniasScreen() {
  const insets = useSafeAreaInsets();

  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal de crear/editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editable, setEditable] = useState<Insignia | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState('SIN_PISTAS');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(useCallback(() => {
    cargarInsignias();
    return () => {};
  }, []));

  const cargarInsignias = () => {
    setCargando(true);
    fetch(`${API_URL}/insignias`)
      .then(response => response.json())
      .then(data => {
        setInsignias(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al obtener las insignias:', error);
        setCargando(false);
      })
  };

  const abrirCrear = () => {
    setEditable(null);
    setNombre("");
    setDescripcion("");
    setTipo('SIN_PISTAS');
    setActivo(true);
    setModalVisible(true);
  };

  const abrirEditar = (insignia: Insignia) => {
    setEditable(insignia);
    setNombre(insignia.nombre);
    setDescripcion(insignia.descripcion);
    setTipo(insignia.tipo);
    setActivo(insignia.activo);
    setModalVisible(true);
  };

  const guardarInsignia = async () => {
    if (!nombre.trim() || !descripcion.trim()) {
      Alert.alert("Error", "El nombre y la descripción son obligatorios.");
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await fetch(editable ? `${API_URL}/insignias/${editable.id}` : `${API_URL}/insignias`, {
        method: editable ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, tipo, activo })
      });

      if (respuesta.ok) {
        setModalVisible(false);
        Alert.alert("Exito", editable ? "La insignia fue actualizada" : "La insignia fue creada");
        cargarInsignias();
      } else {
        const error = await respuesta.json().catch(() => null);
        Alert.alert("Error", error?.error ?? "Hubo un problema al guardar la insignia");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (insignia: Insignia) => {
    Alert.alert(
      "¿Eliminar insignia?",
      `"${insignia.nombre}" y su historial de otorgadas se borrarán`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const respuesta = await fetch(`${API_URL}/insignias/${insignia.id}`, { method: 'DELETE' });
              if (respuesta.ok) {
                setModalVisible(false);
                cargarInsignias();
              } else {
                Alert.alert("Error", "Hubo un problema al eliminar la insignia");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo conectar al servidor");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top + 20 }}>

      <View className="px-6 mb-6">
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          Insignias
        </Text>
        <Text className="text-slate-500 font-semibold mt-1">
          Recompensas por los logros de los visitantes
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        <Pressable
          onPress={abrirCrear}
          className="flex-row items-center gap-4 rounded-3xl bg-amber-500 px-5 py-4 shadow-sm active:bg-amber-600 mb-8"
        >
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesome6 name="medal" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Nueva Insignia
            </Text>
            <Text className="text-xs font-medium text-amber-50 mt-0.5">
              Definí la condición y la entregamos al completar un camino
            </Text>
          </View>
        </Pressable>

        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-6">
          <Text className="text-xs text-blue-800/90 leading-relaxed">
            La condición se evalúa al completar un camino, usando sus estadísticas: pistas pedidas, fallos y misiones perfectas. Cada insignia se entrega una sola vez por visitante y se les muestra en los resultados.
          </Text>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Insignias Existentes
        </Text>

        <View className="gap-3 pb-10">
          {cargando ? (
            <ActivityIndicator size="large" color="#d97706" className="mt-10" />
          ) : insignias.length === 0 ? (
            <Text className="text-center font-medium text-slate-400">No hay insignias creadas</Text>
          ) : insignias.map((insignia) => (
            <Pressable
              key={insignia.id}
              onPress={() => abrirEditar(insignia)}
              className="bg-white p-4 rounded-2xl border border-slate-200 active:opacity-70"
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="medal" size={16} color={insignia.activo ? "#d97706" : "#94a3b8"} />
                <Text className={`text-base font-bold ml-2 ${insignia.activo ? 'text-slate-700' : 'text-slate-400'}`}>
                  {insignia.nombre}
                </Text>
              </View>
              <Text className="text-xs font-medium text-slate-500 mt-1" numberOfLines={2}>
                {insignia.descripcion}
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] font-bold text-slate-500">
                    {etiquetaTipo(insignia.tipo)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-slate-900/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 12 }}>
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-xl font-bold text-slate-800">
                  {editable ? 'Editar insignia' : 'Nueva insignia'}
                </Text>
                <Text className="text-sm text-slate-500">Recompensa por un logro del museo</Text>
              </View>
              <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>

            <View className="gap-5">
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Nombre de la insignia</Text>
                <Input placeholder="Ej: Ojo de águila" value={nombre} onChangeText={setNombre} />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Mensaje que ve el visitante</Text>
                <TextInput
                  placeholder="Ej: Completaste el camino sin pedir pistas"
                  multiline
                  value={descripcion}
                  onChangeText={setDescripcion}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900"
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Condición para ganarla</Text>
                <View className="gap-2">
                  {TIPOS.map((t) => (
                    <Pressable
                      key={t.valor}
                      onPress={() => setTipo(t.valor)}
                      className={`p-3 rounded-2xl border flex-row items-center justify-between ${
                        tipo === t.valor ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <View className="flex-1 pr-2">
                        <Text className="font-bold text-slate-700">{t.etiqueta}</Text>
                        <Text className="text-xs text-slate-500 mt-0.5">{t.detalle}</Text>
                      </View>
                      {tipo === t.valor && (
                        <Ionicons name="checkmark-circle" size={22} color="#d97706" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {editable && (
                <View className="flex-row items-center justify-between bg-white rounded-2xl border border-slate-200 px-4 py-3">
                  <Text className="font-bold text-slate-700">Activa</Text>
                  <Pressable
                    onPress={() => setActivo(!activo)}
                    className={`w-14 h-8 rounded-full justify-center px-1 ${activo ? 'bg-amber-500' : 'bg-slate-300'}`}
                  >
                    <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${activo ? 'translate-x-6' : 'translate-x-0'}`} />
                  </Pressable>
                </View>
              )}
            </View>

            <View className="pt-5 gap-3">
              {editable && (
                <Button
                  label="Eliminar insignia"
                  className="w-full bg-red-500 rounded-2xl h-12"
                  onPress={() => confirmarEliminar(editable)}
                />
              )}
              <Button
                label={editable ? "Guardar cambios" : "Crear insignia"}
                className="w-full bg-amber-500 rounded-2xl h-14"
                onPress={guardarInsignia}
                disabled={guardando}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
