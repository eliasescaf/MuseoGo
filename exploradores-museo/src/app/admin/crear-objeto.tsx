import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect} from "expo-router";
import { useState, useCallback } from "react";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from "expo-image-picker";
import { Pressable, ScrollView, Text, TextInput, View, Alert, Image} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";


import { API_URL } from "../../config/api";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://goayfftfasoqhqazlrqr.supabase.co";
const SUPABASE_KEY = "sb_publishable_5wmNWlFry6jaIv1SmHCDFg_Cq-2L3hO"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function CrearObjetoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [datosHistoricos, setDatosHistoricos] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [assetFoto, setAssetFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useFocusEffect(useCallback(() => {
    setNombre("");
    setDescripcion("");
    setDatosHistoricos("");
    setImagenUrl("");
    setAssetFoto(null);
    setGuardando(false);
    }, [])
  );

  const elegirFuente = async () => {
    Alert.alert("Foto del objeto", "¿Cómo querés agregar la imagen?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Tomar foto", onPress: tomarFoto },
      { text: "Elegir de la galería", onPress: elegirGaleria },
    ]);
  };

  const tomarFoto = async () => {
    const permiso  = await ImagePicker.requestCameraPermissionsAsync();
    if(!permiso.granted){
      Alert.alert("Permiso denegado", "No se puede acceder a la cámara");
      return;
    }

    await seleccionar(() => ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      exif: false,
    }));
  }

  const elegirGaleria = async () => {
    // La mayoría de los Android no pide permiso para la galería; igual lo pedimos por seguridad
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permiso.granted){
      Alert.alert("Permiso denegado", "No se puede acceder a la galería");
      return;
    }

    await seleccionar(() => ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      exif: false,
    }));
  }

  const seleccionar = async (invocar: () => Promise<ImagePicker.ImagePickerResult>) => {
    const resultado = await invocar();

    if(!resultado.canceled){
      const asset = resultado.assets[0];
      setImagenUrl(asset.uri);
      setAssetFoto(asset);
    }
  }

  const guardarObjeto = async () => {
    if(!nombre.trim() || !descripcion.trim()){
      Alert.alert("Error", "El nombre y la descripción deben ser obligatorios");
      return;
    }
    setGuardando(true);

    const codigoQr = "OBJ-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    try{
      let urlFinalFoto = null;

      if(imagenUrl){
        // Respetamos el formato real de la foto (jpeg/png/webp); la galería puede devolver PNG
        const mime = assetFoto?.mimeType && assetFoto.mimeType.startsWith('image/')
          ? assetFoto.mimeType
          : 'image/jpeg';
        const extension = mime.split('/')[1].replace('jpeg', 'jpg');
        const nombreArchivo = `${Date.now()}_foto.${extension}`;

        const base64 = await FileSystem.readAsStringAsync(imagenUrl, { 
          encoding: FileSystem.EncodingType.Base64 
        });
      

      const {error: errorStorage} = await supabase.storage
        .from("fotos-objetos")
        .upload(nombreArchivo, decode(base64), {
          contentType: mime,
        });

      if (errorStorage){
        console.error("Error de Supabase Storage:", errorStorage); 
        
        Alert.alert("Error de la nube", errorStorage.message); 
        
        setGuardando(false);
        return;
      }

      const {data: publicUrlData} = supabase.storage
        .from("fotos-objetos")
        .getPublicUrl(nombreArchivo);

        urlFinalFoto = publicUrlData.publicUrl;
      }

      const respuesta = await fetch(`${API_URL}/objetos`, {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          descripcion: descripcion,
          datosHistoricos: datosHistoricos,
          codigoQr: codigoQr,
          imagenUrl: urlFinalFoto || null
        })
      })

      if(respuesta.ok){
        Alert.alert("Exito", "El objeto se creó correctamente");
        router.replace("/admin/objetos");
      } else {
        Alert.alert("Error", "Hubo un problema al crear el objeto");
      }
    }
    catch(error){
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    }finally{
      setGuardando(false);
    }
  }  
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      
      <View className="flex-row items-center px-4 py-4 border-b border-slate-100">
        <Pressable 
          onPress={() => router.replace("/admin/objetos")} 
          className="p-2 -ml-2 active:bg-slate-100 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800 ml-2">
          Nuevo Objeto
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-8">
          {imagenUrl ? (
            <Pressable onPress={elegirFuente} className="active:opacity-80">
              <Image
                source={{uri: imagenUrl}}
                className="h-32 w-32 rounded-3xl border-2 border-slate-300"
              ></Image>
              <Text className="text-xs font-bold text-slate-500 mt-2 text-center">Tocar para cambiar</Text>
            </Pressable>
          ):(
            <View className="flex-row gap-3">
              <Pressable onPress={tomarFoto} className="h-32 px-5 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 items-center justify-center active:bg-slate-200">
                <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                <Text className="text-xs font-medium text-slate-500 mt-2">Tomar Foto</Text>
              </Pressable>
              <Pressable onPress={elegirGaleria} className="h-32 px-5 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 items-center justify-center active:bg-slate-200">
                <MaterialCommunityIcons name="image-plus" size={32} color="#94a3b8" />
                <Text className="text-xs font-medium text-slate-500 mt-2">De la Galería</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* <View className="p-4 rounded-2xl border border-emerald-100 mb-8 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-sm font-bold text-emerald-800">
              Código QR
            </Text>
            {codigoQr ? (
              <Text className="text-xs text-emerald-600 mt-0.5 font-bold">
                {codigoQr}
              </Text> 
            ): (
              <Text className="text-xs text-emerald-600 mt-0.5">
              Generá el código para imprimir y pegar junto al objeto.
            </Text>
            )}
          </View>
          <Pressable onPress={generarQr} className="bg-emerald-600 px-4 py-2 rounded-xl active:bg-emerald-700">
            <Text className="text-white font-bold text-sm">
              {codigoQr ? "Rehacer" : "Generar"}
              </Text>
          </Pressable>
        </View> */}

        <View className="gap-6 pb-20">
          
          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
              Nombre del objeto
            </Text>
            <Input 
            placeholder="Ej: Vasija de cerámica Diaguita" 
            value={nombre}
            onChangeText={setNombre}
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
             Descripción
            </Text>
            <TextInput 
              placeholder="Información corta que leerá el visitante"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 focus:border-blue-500"
              value={descripcion}
              onChangeText={setDescripcion}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
             Datos historicos
            </Text>
            <TextInput 
              placeholder="Descripción más extensa que leerá el visitante en la app y que utilizará el Curador IA"
              multiline
              numberOfLines={6}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 focus:border-blue-500"
              value={datosHistoricos}
              onChangeText={setDatosHistoricos}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>
        </View>        
      </ScrollView>

      <View className="p-6 border-t border-slate-100 bg-white" style={{ paddingBottom: insets.bottom + 20 }}>
        <Button 
          label="Guardar Objeto" 
          className="w-full bg-blue-600 rounded-full h-14"
          onPress={guardarObjeto}
          disabled={guardando} 
        />
      </View>

    </View>
  );
}