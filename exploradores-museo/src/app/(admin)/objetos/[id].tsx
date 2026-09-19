import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Alert, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {API_URL} from "../../../config/api";
import { createClient } from "@supabase/supabase-js";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const SUPABASE_URL = "https://goayfftfasoqhqazlrqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_5wmNWlFry6jaIv1SmHCDFg_Cq-2L3hO"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function DetalleObjetosScreen(){
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {id} = useLocalSearchParams();

    const [cargando,setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [datosHistoricos, setDatosHistoricos] = useState("");
    const [codigoQr, setCodigoQr] = useState("");
    const [imagenUrl, setImagenUrl] = useState("");
    const qrRef = useRef<any>(null);

    useEffect(() => {
        const cargarObjeto = async () => {
            try {
                const respuesta = await fetch(`${API_URL}/objetos/${id}`)
                if(respuesta.ok){
                    const objeto = await respuesta.json();
                    setNombre(objeto.nombre);
                    setDescripcion(objeto.descripcion);
                    setDatosHistoricos(objeto.datosHistoricos || "");
                    setCodigoQr(objeto.codigoQr);
                    setImagenUrl(objeto.imagenUrl || "");
                } else {
                    Alert.alert("Error", "No se pudo cargar el objeto");
                    router.replace("/(admin)/objetos");
                }
            }
            catch(error){
                console.error(error);
                Alert.alert("Error", "No se pudo conectar al servidor");
            } finally{
                setCargando(false);
            }
        }
        cargarObjeto();
    }, [id]);

    const editarObjeto = async () => {
      if(!nombre.trim() || !descripcion.trim()){
        Alert.alert("Error", "El nombre y la descripción son obligatorios");
        return;
      }

      setProcesando(true);
      try{
        const resultado = await fetch(`${API_URL}/objetos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body:JSON.stringify({
            nombre: nombre,
            descripcion: descripcion,
            datosHistoricos: datosHistoricos,
          })
        });

        if(resultado.ok){
          Alert.alert('Exito', 'El objeto fue actualizado exitosamente');
          router.replace("/(admin)/objetos");
        }else{
          Alert.alert('Error', 'Hubo un problema al actualizar el objeto');
        }
      }
      catch(error){
        console.error(error);
        Alert.alert("Error", "No se pudo conectar al servidor");
      } finally{
        setProcesando(false);
      }
    }

    const confirmarEliminar = () => {
        Alert.alert("¿Eliminar objeto?", "Esta acción no se puede deshacer", [
            {text: "Cancelar", style: "cancel"},
            {text: "Eliminar", style: "destructive", onPress: async () => {
                setProcesando(true);
                try{
                  if(imagenUrl){
                    const nombreArchivo = imagenUrl.split('/').pop();

                    if(nombreArchivo){
                      const {error: errorStorage} = await supabase.storage
                        .from('fotos-objetos')
                        .remove([nombreArchivo]);

                        if(errorStorage){
                          console.error('Error al borrar foto de Supabase: ', errorStorage);
                        }
                    }
                  }
                  const respuesta = await fetch(`${API_URL}/objetos/${id}`, {
                    method: 'DELETE'
                  });

                  if(respuesta.ok){
                    Alert.alert('Exito', 'El objeto se eliminó del museo');
                    router.replace("/(admin)/objetos");
                  } else{
                    Alert.alert('Error', 'Hubo un problema al borrar el objeto');
                    setProcesando(false);
                  } 
                }
                catch(error){
                  console.error(error);
                  Alert.alert('Error', 'No se pudo conectar al servidor');
                } finally{
                  setProcesando(false);
                }
            }}
        ]);
    }

    if (cargando) {
        return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
        );
    }

    const confirmarDescargaQR= () => {
      Alert.alert("Descargar QR", "¿Desea descargar el QR?", [
        {text: "Cancelar", style: "cancel"},
        {text: "Descargar", onPress: descargarQR}
      ]);
    };

    const descargarQR = async () => {
      if(!qrRef.current){
        return;
      }

      qrRef.current.toDataURL(async (dataBase64: string) => {
        try {
          const rutaArchivo = FileSystem.documentDirectory + `QR_${codigoQr}.png`;
          await FileSystem.writeAsStringAsync(rutaArchivo, dataBase64, 
            { encoding: FileSystem.EncodingType.Base64});
          
          const puedeCompartir = await Sharing.isAvailableAsync();
          if(puedeCompartir){
            await Sharing.shareAsync(rutaArchivo,{
              dialogTitle: 'Compartir o guardar QR',
              mimeType: 'image/png',
            });
          } else {
            Alert.alert("Error", "Tu dispositivo no soporta la función de compartir.");
          }
        } catch(error){
          console.error("Error al guardar QR:", error);
          Alert.alert("Error", "Hubo un problema al guardar la imagen.");
        }
      });
    };

    return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      
      <View className="flex-row items-center px-4 py-4 border-b border-slate-100">
        <Pressable onPress={() => router.replace("/(admin)/objetos")} className="p-2 -ml-2 active:bg-slate-100 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800 ml-2">Detalle del Objeto</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row justify-between mb-8">
          <View className="items-center flex-1 mr-4">
            {imagenUrl ? (
              <Image source={{ uri: imagenUrl }} className="h-32 w-full rounded-3xl border border-slate-200" />
            ) : (
              <View className="h-32 w-full bg-slate-100 rounded-3xl border border-dashed border-slate-300 items-center justify-center">
                <MaterialCommunityIcons name="image-off-outline" size={32} color="#94a3b8" />
              </View>
            )}
            <Text className="text-xs font-bold text-slate-500 mt-2">Foto Actual</Text>
          </View>

          <View className="items-center bg-white p-3 rounded-3xl border border-emerald-100 shadow-sm flex-1 ml-4 justify-center">
            {codigoQr ? (
                <Pressable onPress={confirmarDescargaQR} className="active:opacity-80">
                  <QRCode value={codigoQr} getRef={(c) => (qrRef.current = c)} size={90} color="#064e3b" backgroundColor="transparent" />
                  <Text className="text-[10px] font-black text-emerald-700 mt-2 tracking-widest">{codigoQr}</Text>
                </Pressable>
            ) : null}
          </View>
        </View>

        <View className="gap-6 pb-20">
          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Nombre del objeto</Text>
            <Input value={nombre} onChangeText={setNombre} />
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Descripción</Text>
            <TextInput 
              multiline numberOfLines={6}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 focus:border-blue-500"
              style={{ minHeight: 120, textAlignVertical: 'top' }}
              value={descripcion} onChangeText={setDescripcion}
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Datos historicos</Text>
            <TextInput 
              multiline numberOfLines={6}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 focus:border-blue-500"
              style={{ minHeight: 120, textAlignVertical: 'top' }}
              value={datosHistoricos} onChangeText={setDatosHistoricos}
            />
          </View>
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
            onPress={editarObjeto}
            disabled={procesando} 
          />
        </View>
      </View>

    </View>
  );
}