import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert, Pressable, Text, LogBox } from "react-native";
import { useRouter } from "expo-router";

LogBox.ignoreLogs([
  'findNodeHandle is deprecated in StrictMode',
  'Warning: findNodeHandle is deprecated'
]);

export default function AdminLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const confirmarSalida = () => {
        Alert.alert(
            "Salir del Admin",
            "¿Estás seguro?",
            [
                { text: "Cancelar", onPress: () => {}, style: "cancel" },
                {
                    text: "Salir",
                    onPress: () => router.replace("/"),
                    style: "destructive",
                },
            ]
        );
    };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          height: 70 + insets.bottom, 
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        }
      }}
    >
      {/* Pestaña 1: Caminos */}
      <Tabs.Screen
        name="caminos"
        options={{
          title: "Caminos",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="route" size={22} color={color as string} />
          ),
        }}
      />

      {/* Pestaña 2: Misiones */}
      <Tabs.Screen
        name="misiones"
        options={{
          title: "Misiones",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="flag-checkered" size={22} color={color as string} />
          ),
        }}
      />

      {/* Pestaña 3: Objetos */}
      <Tabs.Screen
        name="objetos"
        options={{
          title: "Objetos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cube-scan" size={26} color={color as string} />
          ),
        }}
      />

      {/* Pestaña 4: Insignias */}
      <Tabs.Screen
        name="insignias"
        options={{
          title: "Insignias",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="medal" size={22} color={color as string} />
          ),
        }}
      />

      {/* Pestaña 5: Salir — el botón muestra el diálogo directamente, sin navegar a ninguna pantalla */}
      <Tabs.Screen
        name="config"
        options={{
          title: "Salir",
          tabBarButton: () => (
            <Pressable
              onPress={confirmarSalida}
              className="flex-1 items-center justify-center active:opacity-60"
            >
              <FontAwesome6 name="door-open" size={22} color="#ef4444" />
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#ef4444", marginTop: 2 }}>
                Salir
              </Text>
            </Pressable>
          ),
        }}
      />

      {/* Esta pantalla existe pero no tiene botón en la barra inferior */}
        <Tabs.Screen
        name="crear-camino"
        options={{
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
        }}
        />

        <Tabs.Screen
        name="crear-objeto"
        options={{
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
        }}
        />

        <Tabs.Screen
        name="crear-mision"
        options={{
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
        }}
        />

        <Tabs.Screen
        name="objetos/[id]"
        options={{
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
        }}
        />

        <Tabs.Screen
        name="caminos/[id]"
        options={{
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
        }}
        />

        <Tabs.Screen
        name="misiones/[id]"
        options={{
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
        }}
        />
    </Tabs>
  );
}
