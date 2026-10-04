import { useState, useCallback } from 'react';
import { API_URL } from '../../config/api';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router'; 
import { Button } from '../../components/ui/button';

const TIPOS_MISION = [
    {
        id: "QR_OBJETO",
        titulo: "Encontrar Objeto",
        descripcion: "El visitante debe escanear el QR de una pieza",
        icono: "qrcode-scan",
        color: "bg-blue-500",
        colorLight: "bg-blue-50",
        textColor: "text-blue-600"
    },
    {
        id: "TRIVIA",
        titulo: "Trivia múltiple",
        descripcion: "Pregunta con opciones sobre piezas especificas",
        icono: "format-list-checks",
        color: "bg-violet-500",
        colorLight: "bg-violet-50",
        textColor: "text-violet-600"
    },
    {
        id: "ACERTIJO",
        titulo: "Adivinanza",
        descripcion: "Texto libre donde deben adivinar una palabra",
        icono: "head-lightbulb-outline",
        color: "bg-amber-500",
        colorLight: "bg-amber-50",
        textColor: "text-amber-600"
    }
];

export default function CrearMisionScreen() {
    const insets = useSafeAreaInsets();
    const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [puntos, setPuntos] = useState("10");
    const [guardando, setGuardando] = useState(false);

    const [opcionA, setOpcionA] = useState("");
    const [opcionB, setOpcionB] = useState("");
    const [opcionC, setOpcionC] = useState("");
    const [respuestaAcertijo, setRespuestaAcertijo] = useState("");
    const [objetoId, setObjetoId] = useState(null);

    const [objetos, setObjetos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreObjeto, setNombreObjeto] = useState("");
    const [cargandoObjetos, setCargandoObjetos] = useState(false);
    
    useFocusEffect(useCallback(() => {
        setTitulo("");
        setDescripcion("");
        setTipoSeleccionado(null);
        setPuntos("");
        setGuardando(false);
        setOpcionA("");
        setOpcionB("");
        setOpcionC("");
        setRespuestaAcertijo("");
        setObjetoId(null);
        }, [])
      );

    const guardarMision = async () => {
        if(!titulo.trim() || !tipoSeleccionado){
          Alert.alert("Error", "El titulo y el tipo son obligatorios");
          return;
        }

      setGuardando(true);
      

      const payload: any = {
        titulo,
        descripcion,
        tipo: tipoSeleccionado,
        puntos: parseInt(puntos) || 10,
        objetoId
      };

      if(tipoSeleccionado === "TRIVIA"){
        payload.opciones = [opcionA, opcionB, opcionC];
        payload.respuestaCorrecta = opcionA
      }else if(tipoSeleccionado === "ACERTIJO"){
        payload.respuestaCorrecta = respuestaAcertijo;
      }

      try {
        const respuesta = await fetch(`${API_URL}/misiones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });

        if(respuesta.ok){
          Alert.alert("Éxito", "La misión se creó correctamente");
          router.back();
        } else {
          Alert.alert("Error", "Hubo un problema al guardar en el servidor");
        }
      }catch(error){
        console.error(error);
        Alert.alert("Error", "Falla en la conexión con el servidor");
      }finally{
        setGuardando(false);
      }
    }

    const abrirModalObjetos = async () => {
        setModalVisible(true);
        setCargandoObjetos(true);
        try {
            const respuesta = await fetch(`${API_URL}/objetos`);
            if (respuesta.ok) {
                const data = await respuesta.json();
                setObjetos(data);
            } else {
                Alert.alert("Error", "No se pudieron cargar los objetos");
            }
        } catch (error) {
            console.error("Error al cargar objetos:", error);
        } finally {
            setCargandoObjetos(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
            
            <View className="flex-row items-center px-4 py-4 border-b border-slate-100 bg-white">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:bg-slate-100 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </Pressable>
                <Text className="text-lg font-bold text-slate-800 ml-2">Nueva Misión</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                
                <View className="mb-8">
                    <Text className="text-base font-bold text-slate-800 mb-3">¿Qué tipo de reto es?</Text>
                    <View className="gap-3">
                        {TIPOS_MISION.map((tipo) => (
                            <Pressable
                                key={tipo.id}
                                onPress={() => setTipoSeleccionado(tipo.id)}
                                className={`flex-row items-center p-4 rounded-2xl border ${
                                    tipoSeleccionado === tipo.id 
                                        ? 'border-blue-500 bg-white' 
                                        : 'border-slate-200 bg-white opacity-60'
                                }`}
                            >
                                <View className={`h-12 w-12 rounded-xl items-center justify-center ${tipoSeleccionado === tipo.id ? tipo.color : 'bg-slate-100'}`}>
                                    <MaterialCommunityIcons 
                                        name={tipo.icono as any} 
                                        size={24} 
                                        color={tipoSeleccionado === tipo.id ? 'white' : '#94a3b8'} 
                                    />
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text className={`text-base font-bold ${tipoSeleccionado === tipo.id ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {tipo.titulo}
                                    </Text>
                                    <Text className="text-xs text-slate-400 mt-0.5">
                                        {tipo.descripcion}
                                    </Text>
                                </View>
                                
                                <View className={`h-5 w-5 rounded-full border-2 items-center justify-center ${tipoSeleccionado === tipo.id ? 'border-blue-500' : 'border-slate-300'}`}>
                                    {tipoSeleccionado === tipo.id && <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {tipoSeleccionado && (
                    <View className="pt-6 border-t border-slate-200">
                        <Text className="text-base font-bold text-slate-800 mb-4">Configurar Detalles</Text>
                        
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Título de la misión</Text>
                            <TextInput 
                                value={titulo}
                                onChangeText={setTitulo}
                                placeholder="Ej: El misterio del telégrafo"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800"
                            />
                        </View>
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Descripción (Opcional)</Text>
                            <TextInput 
                                value={descripcion}
                                onChangeText={setDescripcion}
                                placeholder="Explicá de qué trata la misión..."
                                multiline
                                numberOfLines={3}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800"
                                style={{ minHeight: 80, textAlignVertical: 'top' }}
                            />
                        </View>
                        <View className="mb-6">
                            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Puntos de recompensa</Text>
                            <TextInput 
                                value={puntos}
                                onChangeText={setPuntos}
                                keyboardType="numeric"
                                placeholder="Ej: 10"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800"
                            />
                        </View>

                        {tipoSeleccionado === "QR_OBJETO" && (
                            <Pressable 
                                onPress={abrirModalObjetos}
                                className="bg-blue-50 p-4 rounded-2xl border border-blue-200 items-center justify-center py-6 border-dashed active:bg-blue-100"
                            >
                                <MaterialCommunityIcons name="cube-scan" size={32} color="#3b82f6" />
                                <Text className="text-blue-700 font-bold mt-2 text-center">
                                    {objetoId ? `Objeto seleccionado: ${nombreObjeto}` : "Tocar para seleccionar un Objeto del museo"}
                                </Text>
                            </Pressable>
                        )}
                        {tipoSeleccionado === "TRIVIA" && (
                            <View className="gap-3">
                                <TextInput value={opcionA} onChangeText={setOpcionA} placeholder="Opción A (Correcta)" className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base" />
                                <TextInput value={opcionB} onChangeText={setOpcionB} placeholder="Opción B (Falsa)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base" />
                                <TextInput value={opcionC} onChangeText={setOpcionC} placeholder="Opción C (Falsa)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base" />
                            </View>
                        )}

                        {tipoSeleccionado === "ACERTIJO" && (
                            <View>
                                <TextInput value={respuestaAcertijo} onChangeText={setRespuestaAcertijo} placeholder="Palabra clave o respuesta secreta" className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-base" />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
            <View className="p-6 border-t border-slate-100 bg-white" style={{ paddingBottom: insets.bottom + 20 }}>
              <Button 
                  label="Guardar Misión" 
                  className="w-full bg-blue-600 rounded-full h-14"
                  onPress={guardarMision}
                  disabled={guardando} 
              />
             </View>
             <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
              >
                  <View className="flex-1 justify-end bg-slate-900/50">
                      <View className="bg-white rounded-t-3xl h-3/4 p-6" style={{ paddingBottom: insets.bottom }}>
                          <View className="flex-row justify-between items-center mb-6">
                              <View>
                                  <Text className="text-xl font-bold text-slate-800">Seleccionar Objeto</Text>
                                  <Text className="text-sm text-slate-500">¿Qué pieza deben escanear?</Text>
                              </View>
                              <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                                  <Ionicons name="close" size={24} color="#64748b" />
                              </Pressable>
                          </View>

                          {cargandoObjetos ? (
                              <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                          ) : (
                              <FlatList 
                                  data={objetos}
                                  keyExtractor={(item: any) => item.id.toString()}
                                  showsVerticalScrollIndicator={false}
                                  renderItem={({item}) => (
                                      <Pressable 
                                          onPress={() => {
                                              setObjetoId(item.id);
                                              setNombreObjeto(item.nombre); // Asegurate que tu modelo Prisma tenga "nombre"
                                              setModalVisible(false);
                                          }}
                                          className={`p-4 rounded-2xl border mb-3 flex-row items-center justify-between ${
                                              objetoId === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                                          }`}
                                      >
                                          <View className="flex-1">
                                              <Text className="text-base font-bold text-slate-700">{item.nombre}</Text>
                                              <Text className="text-xs text-slate-500 mt-1" numberOfLines={1}>{item.descripcion}</Text>
                                          </View>
                                          {objetoId === item.id && (
                                              <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                                          )}
                                      </Pressable>
                                  )}
                                  ListEmptyComponent={
                                      <Text className="text-center text-slate-500 mt-10 font-medium">No hay objetos cargados en el museo aún.</Text>
                                  }
                              />
                          )}
                      </View>
                  </View>
              </Modal>
        </View>
    );
}