import Constants from "expo-constants";

const debuggerHost = Constants.expoConfig?.hostUri;

const ipAutomatica = debuggerHost ? debuggerHost.split(':')[0] : '192.168.18.69'

export const API_URL = `http://${ipAutomatica}:3000/api`;