# 🎓 MemoClass AI — De Apuntes Rápidos a Plan de Estudio Inteligente

**MemoClass AI** es una **Progressive Web App (PWA)** educativa diseñada con enfoque **Mobile-First** que utiliza Inteligencia Artificial para transformar apuntes rápidos, fragmentados o tomados "a la ligera" durante las clases en un **Plan de Estudio Estructurado** listo para repasar.

---

## 👨‍💻👩‍💻 Créditos y Autoría Oficial

- **Autores / Desarrolladores:**
  - **Iván Andrés Urbano Rivera**
  - **Lucy Adriana Muñoz Cabrera**

---

## 📋 1. Contexto y Planteamiento del Problema

Los estudiantes sufren problemas de retención de memoria y pérdida de información porque durante las clases deben prestar atención y tomar apuntes *"a la ligera"* simultáneamente, lo que genera notas incompletas, desordenadas y difíciles de entender después.

**MemoClass AI** resuelve este problema utilizando Inteligencia Artificial para transformar esos apuntes rápidos y desordenados de cada clase en un plan de estudio estructurado en **4 bloques visuales**:

1. **📖 Bloque 1 — Lo que se aprendió:** Resumen coherente y bien redactado que reconstruye el hilo conductor de la clase a partir de las notas sueltas.
2. **🔑 Bloque 2 — Conceptos clave a tener en cuenta:** Glosario estructurado con los términos más importantes mencionados en la sesión y su relevancia académica.
3. **🎯 Bloque 3 — Qué estudiar y reforzar para la próxima clase:** Detección automática de vacíos/dudas en los apuntes y tareas concretas de refuerzo con **checklists interactivos** para medir el progreso de estudio.
4. **🃏 Bloque 4 — Tarjetas de Memoria (Flashcards 3D):** 3 tarjetas interactivas que giran en 3D al tocarlas para entrenar la memoria activa.

---

## 📱 2. Arquitectura Técnica (PWA & Responsive Mobile-First)

- **Diseño Mobile-First y Responsive:** Optimizado para pantallas táctiles de celulares Android (como la familia **Moto G**) y adaptable a pantallas de escritorio, con barra superior fija (**App Bar**), tarjetas modernas y barra de navegación inferior (**Bottom Navigation**).
- **Configuración PWA Completa e Instalable:**
  - [`manifest.json`](./manifest.json) configurado con nombre, colores de tema, orientación vertical (`portrait`), `display: "standalone"` e íconos vectoriales SVG y PNG (`192x192` y `512x512`).
  - [`sw.js`](./sw.js) (**Service Worker**) registrado para almacenamiento en caché (*Stale-While-Revalidate* / *Offline-First*) y funcionamiento sin conexión de la interfaz.
  - Botón **"Instalar App"** en la barra superior que captura el evento `beforeinstallprompt`.
- **Motor de Inteligencia Artificial Dual:**
  - **Google Gemini API (`gemini-2.5-flash`):** Conexión mediante `fetch` con ventana de configuración de API Key.
  - **Modo Simulación Inteligente Local (Fallback 100% funcional):** Procesa localmente cualquier apunte ingresado o los ejemplos de prueba cuando no hay API Key configurada o no hay conexión a internet.
- **Dictado por Voz:** Integración con `SpeechRecognition` / `webkitSpeechRecognition` para dictar apuntes hablando al celular al terminar la clase.
- **Persistencia Local:** Uso de `localStorage` para almacenar el historial de clases, el avance de los checklists de refuerzo y la configuración de API Key.

---

## 📂 3. Estructura de Archivos del Proyecto

```text
Proyecto IA/
├── index.html               # Estructura semántica HTML5, vistas y modales de la PWA
├── styles.css               # Estilos Mobile-First, glassmorphism y animaciones 3D de Flashcards
├── app.js                   # Lógica modular ES6+, motor IA (Gemini + Simulación), voz y persistencia
├── manifest.json            # Manifiesto Web App para instalación nativa en Android (Moto G)
├── sw.js                    # Service Worker para almacenamiento en caché y soporte offline
├── README.md                # Documentación oficial del proyecto y créditos de autoría
└── icons/
    ├── icon.svg             # Ícono vectorial principal de MemoClass AI
    ├── icon-maskable.svg    # Ícono adaptable (maskable) para Android
    ├── icon-192.png         # Ícono rasterizado 192x192 px
    └── icon-512.png         # Ícono rasterizado 512x512 px
```
