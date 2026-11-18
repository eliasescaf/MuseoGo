# MuseoGo – Exploradores del Museo 🏛️

**App móvil para recorrer el museo resolviendo misiones por salas** (QR, trivia y explicaciones con IA).

---

## 📦 Instalación (para compañeros/profesores)

1. Descargá el **APK** desde el enlace que te pasó el integrante del equipo.
2. En tu celular Android, permití la instalación de aplicaciones de origen desconocido:
   - **Configuración > Apps > Instalar apps desconocidas** (o "Orígenes desconocidos", según la versión de Android).
3. Abrí el archivo `.apk` descargado e instalalo.
4. Abrí la app **MuseoGo**.

> 💡 **No necesitás computadora ni backend local:** la app ya se conecta al servidor remoto.

---

## 🔐 Acceso de administrador

Para entrar al panel de admin usá estas credenciales:

| Campo | Valor |
|---|---|
| **Usuario** | `admin` |
| **Contraseña** | `admin` |

Desde el panel podés **crear caminos, misiones, activar/desactivar multijugador, ver rankings** y más.

---

## 🚶 Flujo rápido de visitante

1. Ingresá tu **alias** al abrir la app.
2. Elegí un **camino** disponible.
3. Resolvé las misiones **en orden**:
   - 🔍 **QR:** enfocá el código del objeto.
   - ❓ **Trivia:** elegí la opción correcta.
   - ✍️ **Explicación:** escribí tu respuesta con tus palabras.
4. Al terminar, mirá tus **resultados e insignias** ganadas.

---

## 👥 Multijugador (salas grupales)

Un visitante puede **crear una sala con un PIN de 6 dígitos** y compartirlo con sus compañeros para que se unan al mismo camino y vean el **ranking en vivo**.

---

## 📝 Notas

- ⏳ La primera vez que se abre la app puede tardar unos segundos en cargar (el servidor se "despierta").
- 🔄 Si una pantalla no responde, cerrá la app y volvé a abrirla.

---


Desarrollado con Expo + React Native + Node.js + Supabase.
