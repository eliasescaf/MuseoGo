import { Stack, Slot } from "expo-router";
import Toast from "react-native-toast-message";
import {View} from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    // <Stack screenOptions={{ headerShown: false }}>
    //   <Stack.Screen name="index" />
    // </Stack>
    <View style={{ flex: 1 }}>
      {/* El Slot renderiza tus pantallas normales */}
      <Slot /> 
      
      {/* El Toast va al final para que quede por encima de todo */}
      <Toast />
    </View>
  );
}

