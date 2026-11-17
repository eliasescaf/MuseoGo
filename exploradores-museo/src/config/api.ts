import Constants from "expo-constants";

/**
 * CONFIGURACIÓN DE URL DEL BACKEND
 *
 * - Desarrollo (__DEV__ true, Expo Go / dev client): conecta al backend
 *   local de la PC, detectando la IP del debugger automáticamente.
 * - Builds EAS (APK de prueba o producción, __DEV__ false): conecta al
 *   backend desplegado en Render. Así el APK sirve en cualquier dispositivo
 *   sin tocar código.
 */
const CUSTOM_BACKEND_URL = 'https://museogo.onrender.com/api';

const debuggerHost = Constants.expoConfig?.hostUri;
const ipLocal = debuggerHost ? debuggerHost.split(':')[0] : '192.168.18.69';

const API_URL = __DEV__
    ? `http://${ipLocal}:3000/api`
    : CUSTOM_BACKEND_URL;

console.log('🔗 API URL:', API_URL, __DEV__ ? '(desarrollo)' : '(build EAS)');

export { API_URL };
