// Accesibilidad: zoom con el gesto de "pellizco" (dos dedos).
// Implementación delegada a la librería react-native-zoom-reanimated
// (pinch, pan y doble toque, con física tipo Apple Photos y compatibilidad
// probada con react-native-gesture-handler v3 y Reanimated 4).
// Se aplica envolviendo el contenido de CADA pantalla (no el root, para no
// escalar los contenedores nativos de navegación, que pueden cerrar la app).
import Zoom from 'react-native-zoom-reanimated';
import type { ReactNode, RefObject } from 'react';

export default function Zoomable({ children, scrollRef }: { children: ReactNode; scrollRef?: RefObject<any> }) {
    // `scrollRef` queda aceptado por compatibilidad con las pantallas que pasan
    // el ref de su ScrollView; la librería maneja internamente la convivencia
    // con el scroll nativo.
    void scrollRef;

    return (
        // Se pisan los estilos del contenedor de la librería (alignItems:'center')
        // para que las pantallas ocupen todo el ancho y alto disponibles
        <Zoom
            minScale={1}
            maxScale={2.5}
            style={{ flex: 1, alignItems: 'stretch' }}
            contentContainerStyle={{ flex: 1, alignSelf: 'stretch' }}
        >
            {children}
        </Zoom>
    );
}
