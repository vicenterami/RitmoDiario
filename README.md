# 🥁 RitmoDiario

Una aplicación móvil de seguimiento de hábitos de alto rendimiento, diseñada para gestionar progresos dinámicos, estadísticas a largo plazo y persistencia de datos local offline-first.

## 🚀 Tecnologías

Este proyecto utiliza una arquitectura moderna y robusta:

- **Framework:** React Native (vía Expo Development Builds).
- **Lenguaje:** TypeScript.
- **Base de Datos:** WatermelonDB (SQLite nativo con JSI).
- **Estilos:** NativeWind (TailwindCSS).
- **Enrutamiento:** Expo Router (File-based routing).

## 🛠️ Requisitos Previos

- Node.js & npm.
- Android Studio (para compilar en local) o un dispositivo Android físico.
- JDK 17.

## 🏃‍♂️ Cómo ejecutar el proyecto

Este proyecto utiliza **Development Builds**, por lo que no funcionará correctamente en "Expo Go" estándar debido a las dependencias nativas (JSI/SQLite).

---

### 1. Instalación

```bash
npm install
```

### 2. Generar código nativo (Prebuild)

Si es la primera vez o has cambiado dependencias nativas:

```bash
npx expo prebuild --platform android
```

### 3. Compilar e instalar en el dispositivo

Con el celular conectado por USB:
```bash
npx expo run:android
```

### 4. Desarrollo diario (Una vez instalada la app)

Simplemente inicia el servidor Metro:
```bash
npx expo start
```

Abre la app "RitmoDiario" en tu celular (ícono blanco/custom).

---

## 🎯 Visión del Proyecto

El objetivo es crear un tracker de hábitos que supere las limitaciones de los trackers simples (booleanos):

**Progreso Dinámico:** Soportar hábitos numéricos (ej. "Leer 20 páginas", "Beber 2 litros").

**Histórico:** Cálculo de rachas y estadísticas semanales/mensuales/anuales.

**Offline-first:** Los datos viven en el dispositivo y son persistentes.