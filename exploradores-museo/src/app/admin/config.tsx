import { View } from "react-native";

// La pestaña "Salir" del tab bar nunca navega acá: el botón custom del layout
// intercepta el toque y muestra el diálogo de confirmación directamente.
// Esta pantalla es solo un placeholder para que la ruta exista.
export default function Screen() {
  return <View className="flex-1 bg-slate-50" />;
}
