import { Stack, Slot } from "expo-router";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {View} from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    // <Stack screenOptions={{ headerShown: false }}>
    //   <Stack.Screen name="index" />
    // </Stack>
    // Necesario para que los gestos (zoom de accesibilidad) funcionen
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* El Slot renderiza tus pantallas normales; el zoom (accesibilidad)
            se aplica dentro de cada pantalla, no acá, para no escalar
            los contenedores nativos de navegación */}
        <Slot />

        {/* El Toast va al final para que quede por encima de todo */}
        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}

