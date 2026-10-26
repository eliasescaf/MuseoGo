import { Tabs } from 'expo-router/js-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VisitanteLayout() {
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
            <Tabs.Screen
                name="caminos/index"
                options={{
                    title: 'Explorar',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-marker-path" size={24} color={color as string} />,
                }}
            />
            
            <Tabs.Screen
                name="progreso"
                options={{
                    title: 'Mi Progreso',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="trophy-outline" size={24} color={color as string} />,
                }}
            />

            {/* Rutas ocultas de la barra de navegación */}
            <Tabs.Screen
                name="caminos/[id]"
                options={{
                    tabBarButton: () => null,
                    tabBarItemStyle: { display: 'none' }, // Quita el slot del tab bar
                    tabBarStyle: { display: 'none' } // Oculta la barra en el detalle
                }}
            />
            
            <Tabs.Screen
                name="mision-activa/[id]"
                options={{
                    tabBarButton: () => null,
                    tabBarItemStyle: { display: 'none' },
                    tabBarStyle: { display: 'none' } // Oculta la barra durante la misión
                }}
            />
            
            <Tabs.Screen
                name="resultados-camino"
                options={{
                    tabBarButton: () => null,
                    tabBarItemStyle: { display: 'none' },
                    tabBarStyle: { display: 'none' }
                }}
            />
        </Tabs>
    );
}