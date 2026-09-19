import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminLayout() {
    const insets = useSafeAreaInsets();

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
      {/* Pestaña 1: Misiones */}
      <Tabs.Screen
        name="misiones"
        options={{
          title: "Misiones",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="flag-checkered" size={22} color={color} />
          ),
        }}
      />

      {/* Pestaña 2: Caminos */}
      <Tabs.Screen
        name="caminos"
        options={{
          title: "Caminos",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="route" size={22} color={color} />
          ),
        }}
      />

      {/* Pestaña 3: Objetos */}
      <Tabs.Screen
        name="objetos"
        options={{
          title: "Objetos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cube-scan" size={26} color={color} />
          ),
        }}
      />

      {/* Pestaña 4: Config (Curador IA) */}
      <Tabs.Screen
        name="config"
        options={{
          title: "Config",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" size={24} color={color} />
          ),
        }}
      />

      {/* Esta pantalla existe pero no tiene botón en la barra inferior */}
        <Tabs.Screen
        name="crear-camino"
        options={{
            href: null,
        }}
        />

        <Tabs.Screen
        name="crear-objeto"
        options={{
            href: null,
        }}
        />

        <Tabs.Screen
        name="objetos/[id]"
        options={{
            href: null,
        }}
        />
    </Tabs>
  );
}