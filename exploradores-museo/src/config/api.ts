import Constants from "expo-constants";

/**
 * CONFIGURACIÓN DE URL DEL BACKEND
 * 
 * Opciones:
 * - 'local': Conecta a IP local (para testing en tu PC/red)
 * - 'custom': Usa URL personalizada (incluye http/https)
 */
const BACKEND_MODE = 'local' as const;
const CUSTOM_BACKEND_URL = 'https://your-backend.render.com/api'; // Cambiar cuando uses deploy

const debuggerHost = Constants.expoConfig?.hostUri;

let API_URL: string;

if (BACKEND_MODE === 'custom') {
  API_URL = CUSTOM_BACKEND_URL;
} else {
  // Modo local: detecta IP automáticamente
  const ipAutomatica = debuggerHost ? debuggerHost.split(':')[0] : '192.168.18.69';
  API_URL = `http://${ipAutomatica}:3000/api`;
}

console.log('🔗 API URL:', API_URL);
console.log('📡 Debugger Host:', debuggerHost);

export { API_URL };
