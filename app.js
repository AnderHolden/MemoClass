/**
 * ============================================================================
 * MemoClass AI - Motor Principal de Aplicación (PWA Educativa + IA)
 * ============================================================================
 * Autores y Desarrolladores Oficiales:
 *   - Iván Andrés Urbano Rivera
 *   - Lucy Adriana Muñoz Cabrera
 *
 * Descripción:
 *   Transforma apuntes rápidos y desordenados tomados en clase en un plan
 *   de estudio estructurado en 4 bloques:
 *     1. Lo que se aprendió (Reconstrucción coherente)
 *     2. Conceptos clave a tener en cuenta (Glosario estructurado)
 *     3. Qué estudiar y reforzar para la próxima clase (Vacíos + Checklist)
 *     4. Tarjetas de Memoria / Flashcards 3D interactivas
 *
 *   Incluye integración con Google Gemini API (gemini-2.5-flash), Modo
 *   Simulación Inteligente Local (100% funcional sin llave o sin conexión),
 *   Dictado por Voz (Web Speech API), Persistencia en localStorage y soporte
 *   completo de instalación PWA para Android (familia Moto G) y escritorio.
 * ============================================================================
 */

const APP_METADATA = Object.freeze({
  appName: 'MemoClass AI',
  version: '1.0.0',
  authors: [
    'Iván Andrés Urbano Rivera',
    'Lucy Adriana Muñoz Cabrera'
  ],
  geminiModel: 'gemini-2.5-flash'
});

const STORAGE_KEYS = Object.freeze({
  CLASSES: 'memoclass_ai_classes_v1',
  ACTIVE_CLASS_ID: 'memoclass_ai_active_id_v1',
  API_KEY: 'memoclass_ai_gemini_key_v1'
});

/**
 * Escenarios de prueba realistas para demostraciones rápidas en clase
 */
const DEMO_EXAMPLES = [
  {
    subject: 'Biología Celular: Ciclo Celular y Mitosis',
    rawNotes:
      'prof explicó hoy división celular eucariotas... interfase ocupa 90% del ciclo (G1 crece, S duplica ADN, G2 prepara mitosis). ' +
      'Fases mitosis PMAT: 1) Profase se condensa cromatina y desaparece envoltura nuclear, sale huso mitótico. ' +
      '2) Metafase cromosomas alineados en placa ecuatorial (importante para cariotipo!!). ' +
      '3) Anafase se separan cromátidas hermanas hacia polos opuestos x acortamiento de microtúbulos cinetocóricos?? ' +
      '4) Telofase vuelve núcleo y citocinesis divide citoplasma. OJO: no alcancé a copiar bien diferencia entre citocinesis animal (anillo contráctil actina) y vegetal (fragmoplasto??) ni puntos de control ciclinas CDK para el quiz del próximo martes.',
    curatedPlan: {
      learnedSummary: [
        'Durante la sesión de Biología Celular se estudió el mecanismo mediante el cual las células eucariotas proliferan y conservan su información genética a través del ciclo celular. Se estableció que la célula pasa aproximadamente el 90% de su vida en Interfase —dividida en las etapas G1 (crecimiento celular), S (replicación exacta del ADN) y G2 (preparación energética y síntesis de proteínas para la división)— antes de ingresar a la fase M (Mitosis y Citocinesis).',
        'Asimismo, se analizó la secuencia ordenada de la mitosis mediante el acrónimo PMAT (Profase, Metafase, Anafase y Telofase). En este proceso, el material genético duplicado se condensa en cromosomas visibles, se alinea en el ecuador celular gracias al huso mitótico y finalmente separa sus cromátidas hermanas hacia polos opuestos para originar dos células hijas genéticamente idénticas.'
      ],
      keyTakeaways: [
        'La replicación del ADN ocurre exclusivamente en la fase S de la interfase, previo al inicio de la mitosis.',
        'La Metafase es la etapa ideal para realizar estudios de cariotipo porque los cromosomas alcanzan su máxima condensación y alineación ecuatorial.',
        'La separación equitativa del material genético en Anafase depende de la tracción de los microtúbulos cinetocóricos del huso mitótico.',
        'La citocinesis finaliza la división física del citoplasma mediante mecanismos distintos según la presencia o ausencia de pared celular.'
      ],
      glossary: [
        {
          term: 'Interfase (G1, S, G2)',
          definition: 'Etapa preparatoria que abarca el 90% del ciclo celular donde la célula crece, duplica su ADN (fase S) y verifica la integridad genómica.',
          importance: 'Fundamental para comprender dónde ocurre realmente la duplicación del material genético.'
        },
        {
          term: 'Huso Mitótico y Cinetocoro',
          definition: 'Estructura dinámica de microtúbulos que se ancla al centrómero de cada cromosoma (vía cinetocoro) para alinearlos y separar las cromátidas.',
          importance: 'Su fallo produce aneuploidías o reparto desigual de cromosomas.'
        },
        {
          term: 'Placa Ecuatorial (Metafase)',
          definition: 'Plano central de la célula donde se alinean todos los cromosomas antes de separarse hacia los polos.',
          importance: 'Punto crítico del control mitótico y etapa usada en laboratorio para el cariotipo.'
        },
        {
          term: 'Anillo Contráctil vs. Fragmoplasto',
          definition: 'En células animales la citocinesis ocurre por estrangulamiento de filamentos de actina y miosina; en vegetales se forma una placa celular guiada por el fragmoplasto.',
          importance: 'Pregunta frecuente de evaluación comparativa entre células animales y vegetales.'
        }
      ],
      detectedGaps: [
        'Quedó incompleta la diferenciación paso a paso entre citocinesis animal (anillo contráctil de actina/miosina) y citocinesis vegetal (formación de fragmoplasto y placa celular).',
        'Faltó detallar la dinámica molecular del acortamiento de microtúbulos cinetocóricos durante la Anafase.',
        'No se registraron los complejos Ciclina-CDK que regulan los puntos de control (G1/S, G2/M y Metafase/Anafase) para el quiz del martes.'
      ],
      tasks: [
        {
          id: 'task-bio-1',
          text: 'Elaborar un cuadro comparativo entre citocinesis animal (anillo contráctil) y vegetal (fragmoplasto y vesículas del aparato de Golgi).',
          tip: 'Enfócate en por qué la pared rígida de celulosa impide el estrangulamiento en plantas.',
          completed: false
        },
        {
          id: 'task-bio-2',
          text: 'Repasar los 3 puntos de control del ciclo celular (G1/S, G2/M y punto de control del huso en Metafase) y el papel de las Ciclinas + CDK.',
          tip: 'Tema marcado como prioritario en tus apuntes para el quiz del martes.',
          completed: false
        },
        {
          id: 'task-bio-3',
          text: 'Dibujar las 4 fases PMAT identificando el número de cromosomas y cromátidas hermanas en cada etapa.',
          tip: 'Verifica la diferencia entre cromosoma duplicado (Metafase) y cromosoma simple (Anafase).',
          completed: false
        },
        {
          id: 'task-bio-4',
          text: 'Resolver la duda sobre microtúbulos cinetocóricos vs. microtúbulos polares en el movimiento de Anafase A y Anafase B.',
          tip: 'Los cinetocóricos se acortan por despolimerización acercando las cromátidas a los polos.',
          completed: false
        }
      ],
      flashcards: [
        {
          id: 'fc-bio-1',
          category: 'Fases del Ciclo',
          question: '¿En qué etapa específica del ciclo celular se duplica el ADN y por qué es un error común pensar que ocurre en la Profase?',
          answer: 'El ADN se replica durante la Fase S (Síntesis) de la Interfase. En la Profase el ADN ya está duplicado y únicamente se condensa para hacerse visible en forma de cromosomas.'
        },
        {
          id: 'fc-bio-2',
          category: 'Mitosis (PMAT)',
          question: '¿Qué evento clave ocurre en la Metafase y por qué es indispensable antes de pasar a la Anafase?',
          answer: 'Todos los cromosomas se alinean en la placa ecuatorial unidos al huso mitótico. Esto activa el punto de control del huso que garantiza que cada célula hija reciba exactamente una copia de cada cromosoma.'
        },
        {
          id: 'fc-bio-3',
          category: 'Citocinesis Comparada',
          question: '¿Cuál es la diferencia estructural entre la citocinesis de una célula animal y una célula vegetal?',
          answer: 'La célula animal forma un anillo contráctil de actina y miosina que estrangula la membrana desde afuera; la célula vegetal construye un fragmoplasto con vesículas del Golgi desde el centro hacia afuera para formar nueva pared celular.'
        }
      ]
    }
  },
  {
    subject: 'Física Mecánica: Leyes de Newton y Fuerza de Fricción',
    rawNotes:
      'clase dinámica hoy: 1ra ley inercia (sumatoria fuerzas = 0 -> reposo o MRU). ' +
      '2da ley F_neta = m * a (vectorial, separar eje X y eje Y!). ' +
      '3ra ley acción y reacción: actúan en cuerpos DIFERENTES, por eso no se cancelan entre sí. ' +
      'Vimos plano inclinado con ángulo theta: peso se descompone en mg*sen(theta) paralelo al plano y mg*cos(theta) normal?? ' +
      'Fricción estática fs <= mu_s * N vs fricción cinética fk = mu_k * N. Ojo: me confundí cuando el bloque empieza a deslizar y cómo hallar la aceleración con polea y tensión T. Practicar diagrama de cuerpo libre (DCL) antes del taller.',
    curatedPlan: {
      learnedSummary: [
        'En la sesión de Física Mecánica se abordaron los principios de la dinámica clásica a través de las tres Leyes de Newton. Se analizó cómo la Primera Ley define el equilibrio traslacional (cuando la fuerza neta es nula, el cuerpo permanece en reposo o en movimiento rectilíneo uniforme), mientras que la Segunda Ley establece que la aceleración de un objeto es directamente proporcional a la fuerza neta resultante e inversamente proporcional a su masa (ΣF = m·a).',
        'Adicionalmente, se estudió la aplicación vectorial de la Segunda Ley en planos inclinados y sistemas con rozamiento, diferenciando el comportamiento de la fuerza de fricción estática máxima frente a la fricción cinética, así como la importancia de construir Diagramas de Cuerpo Libre (DCL) descomponiendo el peso en componentes rectangulares.'
      ],
      keyTakeaways: [
        'Las fuerzas de acción y reacción (3ra Ley) jamás se anulan entre sí porque están aplicadas sobre cuerpos distintos.',
        'En un plano inclinado de ángulo θ respecto a la horizontal, la componente del peso paralela al plano es m·g·sen(θ) y la perpendicular es m·g·cos(θ).',
        'La fuerza normal (N) no siempre es igual al peso (m·g); depende de la inclinación de la superficie y de otras fuerzas verticales.',
        'El coeficiente de fricción estática (μs) es mayor que el cinético (μk), por lo que cuesta más iniciar el movimiento que mantenerlo.'
      ],
      glossary: [
        {
          term: 'Diagrama de Cuerpo Libre (DCL)',
          definition: 'Representación gráfica aislada de un cuerpo donde se dibujan únicamente los vectores de fuerza que actúan directamente sobre él.',
          importance: 'Paso obligatorio antes de plantear las ecuaciones ΣFx y ΣFy.'
        },
        {
          term: 'Fricción Estática (fs ≤ μs·N)',
          definition: 'Fuerza de resistencia variable que impide el inicio del deslizamiento entre dos superficies en contacto hasta alcanzar su valor límite.',
          importance: 'Determina la condición crítica en la que un bloque está a punto de moverse.'
        },
        {
          term: 'Fricción Cinética (fk = μk·N)',
          definition: 'Fuerza de magnitud constante que se opone a la velocidad relativa una vez que el cuerpo ya se encuentra deslizando.',
          importance: 'Se utiliza en la ecuación ΣF = m·a para calcular la aceleración durante el movimiento.'
        },
        {
          term: 'Par Acción-Reacción',
          definition: 'Interacción mutua entre dos cuerpos A y B donde F_AB = -F_BA, con igual magnitud, igual dirección y sentidos opuestos en objetos distintos.',
          importance: 'Evita errores al aislar cuerpos conectados por cuerdas y tensiones.'
        }
      ],
      detectedGaps: [
        'Confusión al determinar el instante exacto en que se supera la fricción estática máxima y se pasa a usar fricción cinética.',
        'Duda en la resolución de sistemas acoplados con poleas ideales y cálculo de la tensión (T) junto con la aceleración común.',
        'Falta práctica en la descomposición trigonométrica del peso en planos inclinados.'
      ],
      tasks: [
        {
          id: 'task-fis-1',
          text: 'Trazar el Diagrama de Cuerpo Libre (DCL) completo de un bloque en un plano inclinado rotando los ejes X (paralelo) y Y (perpendicular).',
          tip: 'Verifica que el ángulo θ entre el vector peso y el eje -Y sea igual al ángulo de inclinación del plano.',
          completed: false
        },
        {
          id: 'task-fis-2',
          text: 'Resolver un ejercicio de dos bloques unidos por cuerda y polea en plano inclinado planteando ΣF = m·a para cada masa por separado.',
          tip: 'Suma ambas ecuaciones para eliminar la tensión interna T y despejar primero la aceleración.',
          completed: false
        },
        {
          id: 'task-fis-3',
          text: 'Comprobar numéricamente si un bloque se mueve comparando la fuerza motriz con la fricción estática máxima (fs_max = μs·N).',
          tip: 'Si F_motriz > fs_max, el bloque acelera y debes recalcular usando μk.',
          completed: false
        }
      ],
      flashcards: [
        {
          id: 'fc-fis-1',
          category: '3ra Ley de Newton',
          question: 'Si la fuerza de acción y la de reacción tienen igual magnitud y sentido opuesto, ¿por qué no se cancelan produciendo equilibrio siempre?',
          answer: 'Porque actúan sobre cuerpos diferentes. Para que dos fuerzas se cancelen en una sumatoria ΣF, deben estar aplicadas sobre el mismo cuerpo.'
        },
        {
          id: 'fc-fis-2',
          category: 'Plano Inclinado',
          question: 'En un plano inclinado un ángulo θ sin fuerzas verticales extra, ¿cuál es el valor de la Fuerza Normal (N) y de la componente del peso que hace deslizar al bloque?',
          answer: 'La Fuerza Normal es N = m·g·cos(θ) (equilibra el eje perpendicular), mientras que la componente paralela que impulsa el deslizamiento hacia abajo es Wx = m·g·sen(θ).'
        },
        {
          id: 'fc-fis-3',
          category: 'Fuerza de Rozamiento',
          question: '¿Cómo decides en un problema si debes usar el coeficiente de fricción estático (μs) o el cinético (μk)?',
          answer: 'Primero evalúas si la fuerza neta externa supera fs_max = μs·N. Si no la supera, el cuerpo sigue en reposo y fs iguala a la fuerza externa; si la supera, el cuerpo acelera y se usa fk = μk·N.'
        }
      ]
    }
  },
  {
    subject: 'Ingeniería de Software: Arquitectura REST, APIs y Aplicaciones PWA',
    rawNotes:
      'hoy vimos arquitectura cliente-servidor moderna y PWAs. API REST usa HTTP (GET leer, POST crear, PUT/PATCH actualizar, DELETE borrar) y devuelve JSON con códigos estado (200 OK, 201 Created, 400 Bad Request, 401/403 Auth, 500 Server Error). ' +
      'En frontend usamos fetch() asíncrono con async/await y bloques try/catch. ' +
      'Para convertir web en PWA instalable en Android: 1) manifest.json con display standalone e íconos, 2) Service Worker (sw.js) que intercepta evento fetch para caché offline, 3) HTTPS o localhost. ' +
      'Duda: cómo funciona exactamente estrategia Stale-While-Revalidate en el Service Worker y cómo capturar evento beforeinstallprompt?? repasar para entrega del proyecto.',
    curatedPlan: {
      learnedSummary: [
        'En la clase de Ingeniería de Software se estudió la integración entre servicios web bajo el estilo arquitectónico REST y el desarrollo de Aplicaciones Web Progresivas (PWA). Se revisó el protocolo HTTP como contrato de comunicación cliente-servidor, empleando verbos semánticos (GET, POST, PUT, PATCH, DELETE), intercambio de datos en formato JSON y códigos de estado estandarizados para manejar respuestas exitosas y errores.',
        'En la segunda parte de la sesión se analizó cómo transformar una aplicación web tradicional en una PWA instalable y resiliente a fallos de red. Esto se logra combinando tres pilares: un archivo de manifiesto (manifest.json) que define la apariencia nativa standalone, un Service Worker (sw.js) que actúa como proxy de red programable para gestionar caché offline, y el manejo asíncrono en el cliente mediante fetch y async/await.'
      ],
      keyTakeaways: [
        'Una API REST es sin estado (stateless): cada petición HTTP debe contener toda la información necesaria para ser procesada.',
        'El uso de async/await junto con bloques try/catch permite consumir APIs con fetch() sin bloquear el hilo principal de la interfaz.',
        'El Service Worker corre en un hilo independiente al DOM y permite que la aplicación cargue instantáneamente incluso sin conexión a internet.',
        'El evento beforeinstallprompt permite personalizar el flujo de instalación de la PWA en dispositivos móviles Android como la familia Moto G.'
      ],
      glossary: [
        {
          term: 'API RESTful',
          definition: 'Interfaz de programación que organiza recursos mediante URLs únicas y operaciones estándar del protocolo HTTP utilizando cargas útiles en JSON.',
          importance: 'Estándar de comunicación entre aplicaciones móviles/web e inteligencia artificial en la nube.'
        },
        {
          term: 'Service Worker (sw.js)',
          definition: 'Script en segundo plano que el navegador ejecuta de forma independiente a la página para interceptar peticiones de red y administrar el Cache Storage.',
          importance: 'Requisito indispensable para el funcionamiento offline y la instalabilidad de una PWA.'
        },
        {
          term: 'Web App Manifest (manifest.json)',
          definition: 'Archivo JSON con los metadatos de la aplicación (nombre, colores, orientación portrait, display standalone e íconos) para instalarla en el sistema operativo.',
          importance: 'Permite que Chrome en Android agregue la aplicación a la pantalla de inicio como app nativa.'
        },
        {
          term: 'beforeinstallprompt',
          definition: 'Evento disparado por navegadores Chromium cuando la web cumple todos los criterios de PWA, permitiendo activar el cuadro de instalación desde un botón propio.',
          importance: 'Mejora la conversión y experiencia de usuario móvil al instalar la app.'
        }
      ],
      detectedGaps: [
        'Faltó profundizar en la implementación en código de la estrategia de caché Stale-While-Revalidate dentro del evento fetch del Service Worker.',
        'Duda sobre cómo almacenar y disparar de forma diferida el evento beforeinstallprompt tras el clic del usuario.',
        'Pendiente practicar el manejo de errores de red (fallback local) cuando una petición fetch() falla por falta de internet.'
      ],
      tasks: [
        {
          id: 'task-sw-1',
          text: 'Implementar y probar el ciclo de vida del Service Worker (eventos install, activate y fetch) verificándolo en DevTools > Application.',
          tip: 'Usa self.skipWaiting() y self.clients.claim() para activar la versión más reciente de inmediato.',
          completed: false
        },
        {
          id: 'task-sw-2',
          text: 'Programar la captura del evento window.addEventListener("beforeinstallprompt") vinculándolo al botón "Instalar App".',
          tip: 'Recuerda llamar a event.preventDefault() y luego invocar deferredPrompt.prompt() al hacer clic.',
          completed: false
        },
        {
          id: 'task-sw-3',
          text: 'Escribir una función asíncrona con fetch(), async/await y try/catch que incluya un modo de respaldo local si la API responde con error.',
          tip: 'Garantiza que la aplicación siga siendo 100% funcional en modo offline o sin API Key.',
          completed: false
        }
      ],
      flashcards: [
        {
          id: 'fc-sw-1',
          category: 'Arquitectura PWA',
          question: '¿Cuáles son los 3 requisitos técnicos fundamentales para que Chrome en Android permita instalar una Progressive Web App?',
          answer: '1) Servirse bajo contexto seguro (HTTPS o localhost), 2) Contar con un manifest.json válido con display: "standalone" e íconos, y 3) Tener un Service Worker (sw.js) registrado con manejador del evento fetch.'
        },
        {
          id: 'fc-sw-2',
          category: 'Estrategias de Caché',
          question: '¿Cómo funciona la estrategia "Stale-While-Revalidate" en un Service Worker?',
          answer: 'Responde de inmediato con el archivo guardado en caché (carga instantánea) y, en paralelo, realiza una petición a la red en segundo plano para actualizar la caché con la versión más reciente.'
        },
        {
          id: 'fc-sw-3',
          category: 'Consumo de APIs',
          question: '¿Por qué es necesario verificar response.ok al usar fetch() si ya tenemos un bloque try/catch?',
          answer: 'Porque fetch() solo rechaza la promesa en errores de red o desconexión; los códigos HTTP de error como 400, 401 o 500 siguen resolviendo la promesa y deben validarse con if (!response.ok).'
        }
      ]
    }
  }
];

/**
 * Estado reactivo en memoria sincronizado con localStorage
 */
const state = {
  classes: [],
  activeClassId: null,
  apiKey: '',
  currentExampleIndex: 0,
  historyFilter: 'all',
  historySearchQuery: '',
  isRecordingVoice: false,
  recognitionInstance: null,
  deferredInstallPrompt: null
};

/* ==========================================================================
   1. PERSISTENCIA EN LOCALSTORAGE
   ========================================================================== */

function loadStateFromStorage() {
  try {
    const rawClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (rawClasses) {
      const parsed = JSON.parse(rawClasses);
      if (Array.isArray(parsed)) {
        state.classes = parsed;
      }
    }
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
    if (savedActiveId && state.classes.some((c) => c.id === savedActiveId)) {
      state.activeClassId = savedActiveId;
    } else if (state.classes.length > 0) {
      state.activeClassId = state.classes[0].id;
    }

    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedKey) {
      state.apiKey = savedKey.trim();
    }
  } catch (err) {
    console.warn('MemoClass AI: Aviso al leer localStorage:', err);
  }
}

function saveClassesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(state.classes));
    if (state.activeClassId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, state.activeClassId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
    }
  } catch (err) {
    console.warn('MemoClass AI: Aviso al guardar en localStorage:', err);
  }
}

function saveApiKeyToStorage(key) {
  state.apiKey = (key || '').trim();
  try {
    if (state.apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, state.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  } catch (err) {
    console.warn('MemoClass AI: Aviso al guardar API Key:', err);
  }
  updateAiModeIndicators();
}

/* ==========================================================================
   2. MOTOR DE INTELIGENCIA ARTIFICIAL (GEMINI 2.5 FLASH + SIMULACIÓN LOCAL)
   ========================================================================== */

/**
 * Construye el prompt estructurado para Google Gemini (gemini-2.5-flash)
 */
function buildGeminiPrompt(subject, rawNotes) {
  return `Eres MemoClass AI, un asistente pedagógico universitario experto en neuroeducación y síntesis de clases.
Un estudiante tomó los siguientes apuntes rápidos, fragmentados o a la ligera durante su clase de "${subject}":

"""
${rawNotes}
"""

Transforma estos apuntes en un Plan de Estudio Estructurado en español devolviendo ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta (sin bloques markdown):
{
  "learnedSummary": [
    "Párrafo 1 bien redactado y coherente que reconstruye qué se aprendió en la clase.",
    "Párrafo 2 que profundiza y conecta las ideas sueltas tomadas por el estudiante."
  ],
  "keyTakeaways": [
    "Idea clave 1 reconstruida de la sesión",
    "Idea clave 2 reconstruida de la sesión",
    "Idea clave 3 reconstruida de la sesión",
    "Idea clave 4 reconstruida de la sesión"
  ],
  "glossary": [
    {
      "term": "Nombre del concepto clave 1",
      "definition": "Explicación clara, rigurosa y fácil de recordar.",
      "importance": "Por qué es clave tenerlo en cuenta para la materia o examen."
    }
  ],
  "detectedGaps": [
    "Vacío o duda 1 detectada en los apuntes incompletos",
    "Vacío o tema mencionado superficialmente que requiere profundización"
  ],
  "tasks": [
    {
      "text": "Tarea concreta y accionable de estudio o refuerzo antes de la próxima clase",
      "tip": "Consejo práctico de repaso"
    }
  ],
  "flashcards": [
    {
      "category": "Categoría breve",
      "question": "Pregunta retadora de repaso activo",
      "answer": "Respuesta clara y bien explicada"
    }
  ]
}
Reglas obligatorias:
- "glossary" debe incluir exactamente 4 conceptos clave.
- "detectedGaps" debe incluir 3 vacíos detectados.
- "tasks" debe incluir 4 tareas concretas de estudio.
- "flashcards" debe incluir exactamente 3 tarjetas de memoria.`;
}

/**
 * Llama a la API de Google Gemini (gemini-2.5-flash) mediante fetch
 */
async function callGeminiApi(subject, rawNotes, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${APP_METADATA.geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: buildGeminiPrompt(subject, rawNotes) }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al conectar con Gemini API`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Respuesta de Gemini vacía o en formato inesperado');
  }

  const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleanedJson);

  return normalizePlanPayload(parsed, 'Google Gemini 2.5 Flash');
}

/**
 * Normaliza la estructura del plan para asegurar que los 4 bloques estén siempre completos
 */
function normalizePlanPayload(plan, engineLabel) {
  const timestamp = Date.now();
  const tasks = Array.isArray(plan.tasks) && plan.tasks.length > 0
    ? plan.tasks.map((t, idx) => ({
        id: t.id || `task-${timestamp}-${idx}`,
        text: String(t.text || 'Repasar concepto principal de la sesión'),
        tip: String(t.tip || 'Revisa tus apuntes y resuelve un ejercicio práctico.'),
        completed: Boolean(t.completed)
      }))
    : [];

  const flashcards = Array.isArray(plan.flashcards) && plan.flashcards.length > 0
    ? plan.flashcards.slice(0, 3).map((fc, idx) => ({
        id: fc.id || `fc-${timestamp}-${idx}`,
        category: String(fc.category || `Concepto #${idx + 1}`),
        question: String(fc.question || '¿Cuál es el concepto central estudiado en clase?'),
        answer: String(fc.answer || 'Revisa la síntesis del Bloque 1 para consolidar este tema.')
      }))
    : [];

  return {
    engine: engineLabel,
    learnedSummary: Array.isArray(plan.learnedSummary) && plan.learnedSummary.length > 0
      ? plan.learnedSummary.map(String)
      : [String(plan.learnedSummary || '')],
    keyTakeaways: Array.isArray(plan.keyTakeaways) ? plan.keyTakeaways.map(String) : [],
    glossary: Array.isArray(plan.glossary) ? plan.glossary : [],
    detectedGaps: Array.isArray(plan.detectedGaps) ? plan.detectedGaps.map(String) : [],
    tasks,
    flashcards
  };
}

/**
 * MODO SIMULACIÓN INTELIGENTE LOCAL (Fallback obligatorio 100% funcional):
 * Si el texto coincide con alguno de los ejemplos de prueba o si el estudiante
 * escribe/dicta cualquier apunte libre, analiza el texto localmente, expande
 * abreviaturas, extrae conceptos clave, detecta dudas/vacíos y genera los 4 bloques.
 */
function generateSmartLocalPlan(subject, rawNotes) {
  const normalizedSubject = subject.trim();
  const normalizedNotes = rawNotes.trim();

  // 1. Verificar si corresponde a alguno de los escenarios curados de demostración
  const matchedDemo = DEMO_EXAMPLES.find(
    (demo) =>
      normalizedSubject.toLowerCase().includes(demo.subject.split(':')[0].toLowerCase()) &&
      normalizedNotes.slice(0, 45).toLowerCase() === demo.rawNotes.slice(0, 45).toLowerCase()
  );

  if (matchedDemo) {
    const cloned = JSON.parse(JSON.stringify(matchedDemo.curatedPlan));
    return normalizePlanPayload(cloned, 'Simulación IA Inteligente');
  }

  // 2. Procesamiento heurístico y semántico local para cualquier apunte libre del estudiante
  const expandedText = expandStudentShorthand(normalizedNotes);
  const fragments = expandedText
    .split(/(?:[\.\n;]+|\b(?:además|también|luego|ojo|importante|duda)\b)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const extractedTerms = extractKeyConceptsFromText(normalizedSubject, expandedText);
  const questionFragments = normalizedNotes
    .split(/[\.\n;]+/)
    .map((s) => s.trim())
    .filter((s) => /\?|duda|ojo|no entend|repasar|pendiente|confund|quiz|examen|taller/i.test(s));

  // Construcción del Bloque 1: Lo que se aprendió
  const introParagraph =
    `Durante la sesión de "${normalizedSubject}", se abordaron los fundamentos teóricos y prácticos registrados en tus apuntes de clase. ` +
    (fragments.length > 0
      ? `A partir de las notas capturadas, se reconstruye que el eje central de la clase consistió en comprender cómo se relacionan ${extractedTerms
          .slice(0, 3)
          .map((t) => t.term)
          .join(', ')}, estableciendo una base conceptual clara para el desarrollo de la asignatura.`
      : `La sesión se enfocó en el análisis estructurado de ${normalizedSubject} y sus principios esenciales.`);

  const bodySentences = fragments.slice(0, 4).map((frag) => {
    const clean = frag.replace(/\?+/g, '').trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  });

  const secondParagraph =
    bodySentences.length > 0
      ? `De manera específica, durante la explicación se destacaron los siguientes desarrollos: ${bodySentences.join('. ')}. Estos elementos permiten conectar los apuntes rápidos con los objetivos de evaluación del curso.`
      : `Se recomienda integrar estas definiciones con los ejercicios prácticos propuestos en clase para consolidar la retención a largo plazo.`;

  // Ideas principales reconstruidas
  const keyTakeaways = (fragments.length >= 3 ? fragments.slice(0, 4) : [
    `Comprensión integral de los fundamentos de ${normalizedSubject}.`,
    ...fragments,
    `Relación directa entre los conceptos de ${extractedTerms[0]?.term || normalizedSubject} y su aplicación práctica.`,
    `Identificación temprana de los puntos clave que serán evaluados en la siguiente sesión.`
  ]).slice(0, 4).map((item) => {
    const cleaned = item.replace(/\?+/g, '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + (cleaned.endsWith('.') ? '' : '.');
  });

  // Construcción del Bloque 3: Vacíos detectados + Checklist interactivo
  const detectedGaps = [];
  if (questionFragments.length > 0) {
    questionFragments.slice(0, 3).forEach((q) => {
      detectedGaps.push(`Nota marcada para revisión en clase: "${q.replace(/\s+/g, ' ')}".`);
    });
  }
  while (detectedGaps.length < 3) {
    const gapIndex = detectedGaps.length;
    const conceptName = extractedTerms[gapIndex]?.term || normalizedSubject;
    if (gapIndex === 0) {
      detectedGaps.push(`Los apuntes registran menciones abreviadas sobre "${conceptName}" sin incluir todavía un ejemplo completo paso a paso.`);
    } else if (gapIndex === 1) {
      detectedGaps.push(`Falta precisar la conexión práctica entre "${extractedTerms[0]?.term || 'el tema inicial'}" y "${extractedTerms[1]?.term || 'las aplicaciones vistas al final de la sesión'}".`);
    } else {
      detectedGaps.push(`Conviene verificar las condiciones o casos especiales de "${conceptName}" antes de la próxima evaluación.`);
    }
  }

  const tasks = [
    {
      id: `task-${Date.now()}-1`,
      text: `Completar y pasar en limpio la definición y un ejemplo aplicado de "${extractedTerms[0]?.term || normalizedSubject}".`,
      tip: 'Usa el resumen del Bloque 1 para redactarlo con tus propias palabras en 3 líneas.',
      completed: false
    },
    {
      id: `task-${Date.now()}-2`,
      text: questionFragments.length > 0
        ? `Resolver la duda anotada en clase: "${questionFragments[0].slice(0, 90)}".`
        : `Elaborar un esquema o mapa conceptual conectando ${extractedTerms.slice(0, 3).map((t) => t.term).join(', ')}.`,
      tip: 'Prioriza los puntos donde pusiste signos de interrogación o abreviaturas rápidas.',
      completed: false
    },
    {
      id: `task-${Date.now()}-3`,
      text: `Practicar con las 3 Tarjetas de Memoria (Flashcards) de "${normalizedSubject}" hasta responderlas sin mirar el reverso.`,
      tip: 'La repetición activa inmediatamente después de clase duplica la retención en memoria.',
      completed: false
    },
    {
      id: `task-${Date.now()}-4`,
      text: `Preparar una pregunta puntual o ejercicio sobre "${extractedTerms[1]?.term || normalizedSubject}" para validar al inicio de la próxima clase.`,
      tip: 'Llegar con dudas concretas acelera tu aprendizaje en la siguiente sesión.',
      completed: false
    }
  ];

  // Construcción del Bloque 4: 3 Flashcards Interactivas
  const flashcards = [
    {
      id: `fc-${Date.now()}-1`,
      category: 'Síntesis Principal',
      question: `¿Cuál fue el propósito central aprendido hoy en la clase de "${normalizedSubject}"?`,
      answer: `${introParagraph.slice(0, 240)}${introParagraph.length > 240 ? '...' : ''}`
    },
    {
      id: `fc-${Date.now()}-2`,
      category: 'Concepto Clave',
      question: `¿Qué debes recordar sobre "${extractedTerms[0]?.term || normalizedSubject}" según lo visto en la sesión?`,
      answer: `${extractedTerms[0]?.definition || secondParagraph} Importancia: ${extractedTerms[0]?.importance || 'Concepto base para la siguiente sesión.'}`
    },
    {
      id: `fc-${Date.now()}-3`,
      category: 'Punto de Refuerzo',
      question: `¿Qué aspecto clave de "${extractedTerms[1]?.term || normalizedSubject}" debes repasar y dominar antes de la próxima clase?`,
      answer: `${extractedTerms[1]?.definition || keyTakeaways[0]} Se recomienda verificar los vacíos detectados en el Bloque 3.`
    }
  ];

  return normalizePlanPayload(
    {
      learnedSummary: [introParagraph, secondParagraph],
      keyTakeaways,
      glossary: extractedTerms.slice(0, 4),
      detectedGaps,
      tasks,
      flashcards
    },
    'Simulación IA Inteligente'
  );
}

/**
 * Expande abreviaturas frecuentes tomadas a la ligera por estudiantes
 */
function expandStudentShorthand(text) {
  return text
    .replace(/\bxq\b|\bpq\b/gi, 'porque')
    .replace(/\bimp\b/gi, 'importante')
    .replace(/\bdef\b/gi, 'definición')
    .replace(/\bej\b/gi, 'por ejemplo')
    .replace(/\bprof\b/gi, 'el profesor')
    .replace(/\btb\b|\btmb\b/gi, 'también')
    .replace(/\bvs\b/gi, 'en comparación con')
    .replace(/\bc\/u\b/gi, 'cada uno')
    .replace(/\bq\b/gi, 'que');
}

/**
 * Extrae y estructura 4 conceptos clave a partir del tema y apuntes del estudiante
 */
function extractKeyConceptsFromText(subject, expandedText) {
  const stopWords = new Set([
    'para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'porque', 'cuando',
    'donde', 'sobre', 'entre', 'hasta', 'desde', 'todo', 'toda', 'todos', 'clase',
    'profesor', 'explicó', 'vimos', 'importante', 'repasar', 'también', 'tiene',
    'hacer', 'puede', 'según', 'cada', 'mismo', 'otra', 'otro', 'fueron', 'hace'
  ]);

  const words = expandedText
    .replace(/[^\wáéíóúÁÉÍÓÚñÑ\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 5 && !stopWords.has(w.toLowerCase()));

  const uniqueKeywords = [];
  const seen = new Set();
  for (const word of words) {
    const lower = word.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueKeywords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
    if (uniqueKeywords.length >= 6) break;
  }

  const sentences = expandedText
    .split(/[\.\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const fallbackTerms = [
    subject.split(':')[0].trim() || 'Concepto Principal',
    'Estructura y Fundamento',
    'Aplicación Práctica',
    'Síntesis Pre-Evaluación'
  ];

  const concepts = [];
  for (let i = 0; i < 4; i++) {
    const term = uniqueKeywords[i] || fallbackTerms[i];
    const matchingSentence = sentences.find((s) => s.toLowerCase().includes(term.toLowerCase())) || sentences[i % Math.max(1, sentences.length)] || `Concepto estudiado dentro de la sesión de ${subject}.`;
    concepts.push({
      term,
      definition: matchingSentence.replace(/\?+/g, '').trim() + '.',
      importance: `Elemento clave mencionado en tus apuntes de ${subject} que conecta con la próxima sesión.`
    });
  }

  return concepts;
}

/* ==========================================================================
   3. RECONOCIMIENTO DE VOZ (WEB SPEECH API: SpeechRecognition)
   ========================================================================== */

function setupVoiceDictation() {
  const btnVoice = document.getElementById('btn-voice-dictation');
  const btnStopVoice = document.getElementById('btn-stop-voice');
  const voiceBanner = document.getElementById('voice-status-banner');
  const voiceBtnText = document.getElementById('voice-btn-text');
  const notesInput = document.getElementById('input-notes');

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

  function stopRecordingUI() {
    state.isRecordingVoice = false;
    btnVoice.classList.remove('voice-recording');
    voiceBtnText.textContent = 'Dictado por Voz';
    voiceBanner.classList.add('hidden');
  }

  if (SpeechRecognitionAPI) {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-CO';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      state.isRecordingVoice = true;
      btnVoice.classList.add('voice-recording');
      voiceBtnText.textContent = 'Detener Dictado';
      voiceBanner.classList.remove('hidden');
      showToast('🎙️ Micrófono activo: habla ahora para dictar tus apuntes.', '🎙️');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript.trim()) {
        const prefix = notesInput.value && !notesInput.value.endsWith(' ') ? ' ' : '';
        notesInput.value += prefix + finalTranscript.trim();
        updateNotesCounter();
      }
    };

    recognition.onerror = (event) => {
      stopRecordingUI();
      if (event.error === 'not-allowed') {
        showToast('Permiso de micrófono denegado. Habilita el micrófono en tu navegador.', '⚠️');
      } else {
        showToast('Dictado finalizado o sin señal de voz.', '🎙️');
      }
    };

    recognition.onend = () => {
      stopRecordingUI();
    };

    state.recognitionInstance = recognition;
  }

  btnVoice.addEventListener('click', () => {
    if (!state.recognitionInstance) {
      showToast('Tu navegador actual no soporta Web Speech API. Usa Chrome en Android o Escritorio.', 'ℹ️');
      return;
    }

    if (state.isRecordingVoice) {
      state.recognitionInstance.stop();
      stopRecordingUI();
    } else {
      try {
        state.recognitionInstance.start();
      } catch (_e) {
        state.recognitionInstance.stop();
      }
    }
  });

  btnStopVoice.addEventListener('click', () => {
    if (state.recognitionInstance && state.isRecordingVoice) {
      state.recognitionInstance.stop();
      stopRecordingUI();
    }
  });
}

/* ==========================================================================
   4. RENDERIZADO DE VISTAS Y COMPONENTES
   ========================================================================== */

/**
 * Cambia entre las 3 vistas principales ("Nueva Clase", "Plan de Estudio", "Mis Clases")
 */
function switchView(viewId) {
  const sections = document.querySelectorAll('.view-section');
  sections.forEach((sec) => {
    if (sec.id === viewId) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  const navButtons = document.querySelectorAll('.nav-item[data-target-view]');
  navButtons.forEach((btn) => {
    if (btn.getAttribute('data-target-view') === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (viewId === 'view-plan-estudio') {
    renderActiveStudyPlan();
  } else if (viewId === 'view-mis-clases') {
    renderClassesHistory();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Calcula el porcentaje de progreso de refuerzo de una clase según su checklist
 */
function calculateClassProgress(classItem) {
  if (!classItem || !Array.isArray(classItem.tasks) || classItem.tasks.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const total = classItem.tasks.length;
  const completed = classItem.tasks.filter((t) => Boolean(t.completed)).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

/**
 * Renderiza la Vista 2: "Plan de Estudio" con sus 4 bloques visuales claros
 */
function renderActiveStudyPlan() {
  const emptyState = document.getElementById('plan-empty-state');
  const activeContent = document.getElementById('plan-active-content');
  const navBadgePlan = document.getElementById('nav-badge-plan');

  const currentClass = state.classes.find((c) => c.id === state.activeClassId) || state.classes[0] || null;

  if (!currentClass) {
    emptyState.classList.remove('hidden');
    activeContent.classList.add('hidden');
    navBadgePlan.classList.add('hidden');
    return;
  }

  state.activeClassId = currentClass.id;
  emptyState.classList.add('hidden');
  activeContent.classList.remove('hidden');
  navBadgePlan.classList.remove('hidden');

  // Cabecera del Plan
  document.getElementById('heading-plan-estudio').textContent = currentClass.subject;
  document.getElementById('plan-engine-badge').textContent = currentClass.engine || 'Síntesis IA';
  document.getElementById('plan-date-badge').textContent = formatDateHuman(currentClass.createdAt);
  document.getElementById('plan-raw-notes').textContent = currentClass.rawNotes;

  // Barra de Progreso
  updatePlanProgressBarUI(currentClass);

  // BLOQUE 1: Lo que se aprendió
  const summaryContainer = document.getElementById('plan-learned-summary');
  summaryContainer.innerHTML = '';
  (currentClass.learnedSummary || []).forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    summaryContainer.appendChild(p);
  });

  const takeawaysList = document.getElementById('plan-key-takeaways');
  takeawaysList.innerHTML = '';
  (currentClass.keyTakeaways || []).forEach((point) => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-2.5';
    li.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span><span>${escapeHtml(point)}</span>`;
    takeawaysList.appendChild(li);
  });

  // BLOQUE 2: Conceptos clave a tener en cuenta
  const glossaryContainer = document.getElementById('plan-glossary-list');
  glossaryContainer.innerHTML = '';
  (currentClass.glossary || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between gap-2.5';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
            Concepto ${idx + 1}
          </span>
        </div>
        <h4 class="text-base sm:text-lg font-extrabold text-slate-900 mb-1">${escapeHtml(item.term)}</h4>
        <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(item.definition)}</p>
      </div>
      <div class="pt-2.5 border-t border-slate-200 text-xs text-slate-700">
        <span class="font-bold text-indigo-800">Por qué tenerlo en cuenta:</span> ${escapeHtml(item.importance || 'Esencial para comprender el tema.')}
      </div>
    `;
    glossaryContainer.appendChild(card);
  });

  // BLOQUE 3: Qué estudiar y reforzar para la próxima clase (Vacíos + Checklist)
  const gapsList = document.getElementById('plan-gaps-list');
  gapsList.innerHTML = '';
  (currentClass.detectedGaps || []).forEach((gap) => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-2';
    li.innerHTML = `<span class="text-amber-700 font-bold">•</span><span>${escapeHtml(gap)}</span>`;
    gapsList.appendChild(li);
  });

  const checklistContainer = document.getElementById('plan-checklist-container');
  checklistContainer.innerHTML = '';
  (currentClass.tasks || []).forEach((task) => {
    const label = document.createElement('label');
    label.className = `task-item-label flex items-start gap-3 p-4 rounded-xl cursor-pointer ${
      task.completed ? 'completed' : ''
    }`;
    label.innerHTML = `
      <input
        type="checkbox"
        class="custom-checkbox mt-0.5"
        data-task-id="${escapeHtml(task.id)}"
        ${task.completed ? 'checked' : ''}
      />
      <div class="flex-1 min-w-0">
        <div class="task-text text-sm sm:text-base font-bold text-slate-900 leading-snug">
          ${escapeHtml(task.text)}
        </div>
        <div class="text-xs text-slate-600 mt-1">
          <span class="font-bold text-slate-700">Consejo:</span> ${escapeHtml(task.tip || 'Marca esta casilla al terminar tu repaso.')}
        </div>
      </div>
    `;

    const checkbox = label.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      toggleTaskCompletion(currentClass.id, task.id, checkbox.checked, label);
    });

    checklistContainer.appendChild(label);
  });

  // BLOQUE 4: Tarjetas de Memoria (Flashcards 3D interactivas claras y legibles)
  const flashcardsGrid = document.getElementById('plan-flashcards-grid');
  flashcardsGrid.innerHTML = '';
  (currentClass.flashcards || []).slice(0, 3).forEach((fc, index) => {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'flashcard-container';
    cardWrapper.setAttribute('tabindex', '0');
    cardWrapper.setAttribute('role', 'button');
    cardWrapper.setAttribute('aria-label', `Tarjeta de memoria ${index + 1}: toca para girar`);

    cardWrapper.innerHTML = `
      <div class="flashcard-inner">
        <!-- Frente: Pregunta Clara -->
        <div class="flashcard-face flashcard-front">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-lg">
              Tarjeta ${index + 1} • ${escapeHtml(fc.category || 'Repaso')}
            </span>
            <span class="text-xs font-bold text-blue-600">Toca para girar ↻</span>
          </div>
          <div class="my-auto py-2">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pregunta de repaso:</p>
            <h4 class="text-base font-extrabold text-slate-900 leading-snug">
              ${escapeHtml(fc.question)}
            </h4>
          </div>
          <div class="text-xs text-slate-600 flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Piensa tu respuesta</span>
            <span class="text-blue-700 font-bold">Ver respuesta →</span>
          </div>
        </div>

        <!-- Reverso: Respuesta Explicada Clara (Fondo Verde Menta Claro + Texto Verde Oscuro) -->
        <div class="flashcard-face flashcard-back">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-lg">
              Respuesta Explicada
            </span>
            <span class="text-xs font-bold text-emerald-800">Volver ↺</span>
          </div>
          <div class="my-auto py-2">
            <p class="text-sm font-semibold text-emerald-950 leading-relaxed">
              ${escapeHtml(fc.answer)}
            </p>
          </div>
          <div class="text-xs text-emerald-800 flex items-center justify-between border-t border-emerald-300 pt-2">
            <span class="font-semibold">Concepto reforzado</span>
            <span class="font-extrabold">Toca para volver</span>
          </div>
        </div>
      </div>
    `;

    cardWrapper.addEventListener('click', () => {
      cardWrapper.classList.toggle('is-flipped');
    });

    cardWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cardWrapper.classList.toggle('is-flipped');
      }
    });

    flashcardsGrid.appendChild(cardWrapper);
  });
}

function updatePlanProgressBarUI(classItem) {
  const { completed, total, percentage } = calculateClassProgress(classItem);
  const progressBar = document.getElementById('plan-progress-bar');
  const progressLabel = document.getElementById('plan-progress-label');

  if (progressBar && progressLabel) {
    progressBar.style.width = `${percentage}%`;
    progressLabel.textContent = `${percentage}% completado (${completed}/${total} tareas)`;
  }
}

function toggleTaskCompletion(classId, taskId, isCompleted, labelElement) {
  const targetClass = state.classes.find((c) => c.id === classId);
  if (!targetClass) return;

  const targetTask = targetClass.tasks.find((t) => t.id === taskId);
  if (!targetTask) return;

  targetTask.completed = isCompleted;
  if (labelElement) {
    labelElement.classList.toggle('completed', isCompleted);
  }

  saveClassesToStorage();
  updatePlanProgressBarUI(targetClass);
  updateNavigationBadgesAndStats();

  const { percentage } = calculateClassProgress(targetClass);
  if (isCompleted && percentage === 100) {
    showToast('¡Excelente! Completaste el 100% del refuerzo de esta clase.');
  }
}

/**
 * Renderiza la Vista 3: "Mis Clases" (Historial, buscador, barra de progreso, abrir y eliminar)
 */
function renderClassesHistory() {
  updateNavigationBadgesAndStats();
  const container = document.getElementById('history-list-container');
  container.innerHTML = '';

  const query = state.historySearchQuery.trim().toLowerCase();
  const filteredClasses = state.classes.filter((cls) => {
    const progress = calculateClassProgress(cls);
    if (state.historyFilter === 'pending' && progress.percentage === 100) return false;
    if (state.historyFilter === 'completed' && progress.percentage < 100) return false;

    if (!query) return true;
    const inSubject = cls.subject.toLowerCase().includes(query);
    const inNotes = cls.rawNotes.toLowerCase().includes(query);
    const inGlossary = (cls.glossary || []).some((g) => g.term.toLowerCase().includes(query));
    return inSubject || inNotes || inGlossary;
  });

  if (filteredClasses.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'paper-card p-8 text-center space-y-2.5';
    emptyCard.innerHTML = `
      <h3 class="text-lg font-extrabold text-slate-900">
        ${state.classes.length === 0 ? 'Aún no tienes clases guardadas en tu historial' : 'No se encontraron clases con ese filtro'}
      </h3>
      <p class="text-sm text-slate-600 max-w-md mx-auto">
        ${
          state.classes.length === 0
            ? 'Cada vez que generes un Plan de Estudio desde "Nueva Clase", se guardará automáticamente aquí con tu progreso de repaso.'
            : 'Prueba con otras palabras o selecciona el filtro "Todas".'
        }
      </p>
    `;
    container.appendChild(emptyCard);
    return;
  }

  filteredClasses.forEach((cls) => {
    const { completed, total, percentage } = calculateClassProgress(cls);
    const card = document.createElement('article');
    card.className = 'paper-card p-5 hover:border-blue-300 transition';

    const firstSummary = (cls.learnedSummary && cls.learnedSummary[0]) || '';
    const termsPreview = (cls.glossary || []).slice(0, 3).map((g) => g.term);

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              ${escapeHtml(formatDateHuman(cls.createdAt))}
            </span>
            <span class="text-xs font-semibold text-slate-500">
              ${escapeHtml(cls.engine || 'Síntesis IA')}
            </span>
          </div>
          <h3 class="text-lg font-extrabold text-slate-900 truncate">
            ${escapeHtml(cls.subject)}
          </h3>
          <p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">
            ${escapeHtml(firstSummary.slice(0, 175))}${firstSummary.length > 175 ? '...' : ''}
          </p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${termsPreview
              .map(
                (t) =>
                  `<span class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">${escapeHtml(
                    t
                  )}</span>`
              )
              .join('')}
          </div>
        </div>

        <!-- Acciones Abrir y Eliminar -->
        <div class="flex sm:flex-col items-center sm:items-end justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          <button
            type="button"
            data-open-id="${escapeHtml(cls.id)}"
            class="flex-1 sm:flex-initial w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition"
          >
            Abrir Plan →
          </button>
          <button
            type="button"
            data-delete-id="${escapeHtml(cls.id)}"
            class="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition"
            title="Eliminar esta sesión"
          >
            Eliminar
          </button>
        </div>
      </div>

      <!-- Barra de progreso de refuerzo -->
      <div class="mt-4 pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
          <span class="text-slate-700">Progreso de refuerzo pre-clase</span>
          <span class="${percentage === 100 ? 'text-emerald-700' : 'text-blue-700'}">
            ${completed}/${total} tareas (${percentage}%)
          </span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            class="progress-bar-fill h-full rounded-full ${
              percentage === 100 ? 'bg-emerald-600' : 'bg-blue-600'
            }"
            style="width: ${percentage}%"
          ></div>
        </div>
      </div>
    `;

    card.querySelector('[data-open-id]').addEventListener('click', () => {
      state.activeClassId = cls.id;
      saveClassesToStorage();
      switchView('view-plan-estudio');
    });

    card.querySelector('[data-delete-id]').addEventListener('click', () => {
      deleteClassSession(cls.id);
    });

    container.appendChild(card);
  });
}

function deleteClassSession(classId) {
  const index = state.classes.findIndex((c) => c.id === classId);
  if (index === -1) return;

  const removed = state.classes.splice(index, 1)[0];
  if (state.activeClassId === classId) {
    state.activeClassId = state.classes[0]?.id || null;
  }

  saveClassesToStorage();
  renderClassesHistory();
  renderActiveStudyPlan();
  showToast(`Sesión "${removed.subject}" eliminada del historial.`, '🗑️');
}

function updateNavigationBadgesAndStats() {
  const navCountBadge = document.getElementById('nav-badge-count');
  const statTotalClasses = document.getElementById('stat-total-classes');
  const statCompletedTasks = document.getElementById('stat-completed-tasks');
  const statAvgProgress = document.getElementById('stat-avg-progress');

  const totalClasses = state.classes.length;
  let totalCompletedTasks = 0;
  let sumPercentages = 0;

  state.classes.forEach((cls) => {
    const { completed, percentage } = calculateClassProgress(cls);
    totalCompletedTasks += completed;
    sumPercentages += percentage;
  });

  const avgProgress = totalClasses > 0 ? Math.round(sumPercentages / totalClasses) : 0;

  if (navCountBadge) navCountBadge.textContent = String(totalClasses);
  if (statTotalClasses) statTotalClasses.textContent = String(totalClasses);
  if (statCompletedTasks) statCompletedTasks.textContent = String(totalCompletedTasks);
  if (statAvgProgress) statAvgProgress.textContent = `${avgProgress}%`;
}

function updateAiModeIndicators() {
  const modeText = document.getElementById('ai-mode-text');
  const apiStatusBox = document.getElementById('api-status-box');

  if (state.apiKey) {
    if (modeText) modeText.textContent = 'Gemini 2.5';
    if (apiStatusBox) {
      apiStatusBox.innerHTML =
        'Estado actual: <strong>Conectado a Google Gemini API (<code>gemini-2.5-flash</code>)</strong> con respaldo automático local.';
    }
  } else {
    if (modeText) modeText.textContent = 'IA Lista';
    if (apiStatusBox) {
      apiStatusBox.innerHTML =
        'Estado actual: <strong>Modo Simulación Inteligente Local Activo</strong> (100% funcional sin llave externa).';
    }
  }
}

/* ==========================================================================
   5. UTILIDADES DE INTERFAZ Y EVENTOS
   ========================================================================== */

function updateNotesCounter() {
  const notesInput = document.getElementById('input-notes');
  const counterEl = document.getElementById('notes-counter');
  if (!notesInput || !counterEl) return;

  const text = notesInput.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = notesInput.value.length;
  counterEl.textContent = `${words} palabras • ${chars} caracteres`;
}

function loadDemoExampleByIndex(index) {
  const example = DEMO_EXAMPLES[index % DEMO_EXAMPLES.length];
  const subjectInput = document.getElementById('input-subject');
  const notesInput = document.getElementById('input-notes');

  subjectInput.value = example.subject;
  notesInput.value = example.rawNotes;
  updateNotesCounter();

  showToast(`Ejemplo cargado: "${example.subject}"`);
}

let toastTimeoutId = null;
function showToast(message) {
  const container = document.getElementById('toast-container');
  const msgEl = document.getElementById('toast-message');
  if (!container || !msgEl) return;

  msgEl.textContent = String(message || '').replace(/^[^\wÁÉÍÓÚáéíóúÑñ¡¿"]+\s*/, '');
  container.classList.remove('opacity-0', '-translate-y-2');
  container.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    container.classList.remove('opacity-100', 'translate-y-0');
    container.classList.add('opacity-0', '-translate-y-2');
  }, 3200);
}

function formatDateHuman(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (_e) {
    return 'Reciente';
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   6. CONFIGURACIÓN PWA: SERVICE WORKER E INSTALACIÓN (beforeinstallprompt)
   ========================================================================== */

function registerServiceWorker() {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name !== 'memoclass-ai-v3.0.0') {
          caches.delete(name);
        }
      });
    });
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js?v=3.0', { scope: './' });
        await registration.update();
        console.info('MemoClass AI: Service Worker activo con alcance:', registration.scope);
      } catch (err) {
        console.warn('MemoClass AI: No se pudo registrar Service Worker:', err);
      }
    });
  }
}

function setupPwaInstallPrompt() {
  const btnInstall = document.getElementById('btn-install-pwa');
  const modalInstall = document.getElementById('modal-install');
  const btnCloseInstall = document.getElementById('btn-close-install-modal');
  const btnConfirmInstall = document.getElementById('btn-confirm-install-modal');

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    btnInstall.classList.add('border-blue-300', 'bg-blue-50/50');
  });

  window.addEventListener('appinstalled', () => {
    state.deferredInstallPrompt = null;
    showToast('🎉 ¡MemoClass AI fue instalada correctamente en tu dispositivo!', '📲');
  });

  btnInstall.addEventListener('click', async () => {
    if (state.deferredInstallPrompt) {
      state.deferredInstallPrompt.prompt();
      const { outcome } = await state.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Instalando MemoClass AI en tu pantalla principal...', '📲');
      }
      state.deferredInstallPrompt = null;
    } else {
      modalInstall.classList.remove('hidden');
    }
  });

  const closeInstallModal = () => modalInstall.classList.add('hidden');
  btnCloseInstall.addEventListener('click', closeInstallModal);
  btnConfirmInstall.addEventListener('click', closeInstallModal);
  modalInstall.addEventListener('click', (e) => {
    if (e.target === modalInstall) closeInstallModal();
  });
}

/* ==========================================================================
   7. INICIALIZACIÓN GENERAL Y MANEJADORES DE EVENTOS
   ========================================================================== */

function initApp() {
  console.info(
    `%c🎓 ${APP_METADATA.appName} v${APP_METADATA.version} — Autores: ${APP_METADATA.authors.join(' y ')}`,
    'color: #818CF8; font-weight: bold; font-size: 13px;'
  );

  loadStateFromStorage();
  updateAiModeIndicators();
  updateNavigationBadgesAndStats();
  renderActiveStudyPlan();
  renderClassesHistory();
  setupVoiceDictation();
  registerServiceWorker();
  setupPwaInstallPrompt();

  // Navegación inferior
  document.querySelectorAll('.nav-item[data-target-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchView(btn.getAttribute('data-target-view'));
    });
  });

  document.getElementById('btn-logo-home').addEventListener('click', () => {
    switchView('view-nueva-clase');
  });

  // Contador en vivo de apuntes
  const subjectInput = document.getElementById('input-subject');
  const notesInput = document.getElementById('input-notes');
  notesInput.addEventListener('input', updateNotesCounter);

  // Botón Cargar ejemplo de prueba (cicla entre los 3 escenarios)
  document.getElementById('btn-load-example').addEventListener('click', () => {
    loadDemoExampleByIndex(state.currentExampleIndex);
    state.currentExampleIndex = (state.currentExampleIndex + 1) % DEMO_EXAMPLES.length;
  });

  // Chips de ejemplos rápidos
  document.querySelectorAll('.example-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const idx = Number(chip.getAttribute('data-example-index')) || 0;
      state.currentExampleIndex = idx;
      loadDemoExampleByIndex(idx);
    });
  });

  // Limpiar formulario
  document.getElementById('btn-clear-form').addEventListener('click', () => {
    subjectInput.value = '';
    notesInput.value = '';
    updateNotesCounter();
    showToast('Campos limpiados.', '🧹');
  });

  // Envío del formulario principal: Generar Plan de Estudio con IA
  const formNuevaClase = document.getElementById('form-nueva-clase');
  const loadingCard = document.getElementById('ai-loading-card');
  const btnGenerate = document.getElementById('btn-generate-plan');
  const generateBtnLabel = document.getElementById('generate-btn-label');

  formNuevaClase.addEventListener('submit', async (event) => {
    event.preventDefault();

    const subject = subjectInput.value.trim();
    const rawNotes = notesInput.value.trim();

    if (!subject || !rawNotes) {
      showToast('Por favor ingresa la materia y tus apuntes rápidos (o toca "Cargar ejemplo de prueba").', '⚠️');
      if (!subject) subjectInput.focus();
      else notesInput.focus();
      return;
    }

    btnGenerate.disabled = true;
    generateBtnLabel.textContent = 'Generando Plan de Estudio...';
    loadingCard.classList.remove('hidden');

    let generatedPlan = null;
    try {
      if (state.apiKey) {
        generatedPlan = await callGeminiApi(subject, rawNotes, state.apiKey);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 450));
        generatedPlan = generateSmartLocalPlan(subject, rawNotes);
      }
    } catch (apiError) {
      console.warn('MemoClass AI: Activando Modo Simulación Inteligente Local tras fallo de API:', apiError);
      generatedPlan = generateSmartLocalPlan(subject, rawNotes);
    } finally {
      btnGenerate.disabled = false;
      generateBtnLabel.textContent = 'Generar Plan de Estudio con IA';
      loadingCard.classList.add('hidden');
    }

    const newClassRecord = {
      id: `class-${Date.now()}`,
      subject,
      rawNotes,
      createdAt: Date.now(),
      ...generatedPlan
    };

    state.classes.unshift(newClassRecord);
    state.activeClassId = newClassRecord.id;
    saveClassesToStorage();
    updateNavigationBadgesAndStats();

    showToast('✨ ¡Plan de Estudio generado y guardado exitosamente!', '🎓');
    switchView('view-plan-estudio');
  });

  // Botones de estado vacío en Vista 2
  document.getElementById('btn-empty-go-new').addEventListener('click', () => {
    switchView('view-nueva-clase');
  });

  document.getElementById('btn-empty-demo').addEventListener('click', () => {
    loadDemoExampleByIndex(0);
    switchView('view-nueva-clase');
    formNuevaClase.requestSubmit();
  });

  // Botones de utilidad dentro del Plan de Estudio
  document.getElementById('btn-new-from-plan').addEventListener('click', () => {
    switchView('view-nueva-clase');
  });

  document.getElementById('btn-reset-flashcards').addEventListener('click', () => {
    const cards = document.querySelectorAll('#plan-flashcards-grid .flashcard-container');
    const anyFlipped = Array.from(cards).some((c) => c.classList.contains('is-flipped'));
    cards.forEach((c) => c.classList.toggle('is-flipped', !anyFlipped));
  });

  document.getElementById('btn-copy-plan').addEventListener('click', async () => {
    const current = state.classes.find((c) => c.id === state.activeClassId);
    if (!current) return;

    const textReport = [
      `📚 PLAN DE ESTUDIO MEMOCLASS AI: ${current.subject}`,
      `Autores de la App: Iván Andrés Urbano Rivera y Lucy Adriana Muñoz Cabrera`,
      ``,
      `1. LO QUE SE APRENDIÓ:`,
      ...(current.learnedSummary || []),
      ``,
      `2. CONCEPTOS CLAVE:`,
      ...(current.glossary || []).map((g) => `- ${g.term}: ${g.definition}`),
      ``,
      `3. QUÉ ESTUDIAR Y REFORZAR:`,
      ...(current.tasks || []).map((t) => `[${t.completed ? 'x' : ' '}] ${t.text}`)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(textReport);
      showToast('📋 Plan de estudio copiado al portapapeles.', '✅');
    } catch (_e) {
      showToast('Resumen listo para compartir.', '📋');
    }
  });

  // Formulario para agregar tarea de refuerzo personalizada (Bloque 3)
  const formCustomTask = document.getElementById('form-add-custom-task');
  const inputCustomTask = document.getElementById('input-custom-task');
  formCustomTask.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputCustomTask.value.trim();
    if (!text) return;

    const current = state.classes.find((c) => c.id === state.activeClassId);
    if (!current) return;

    current.tasks.push({
      id: `task-custom-${Date.now()}`,
      text,
      tip: 'Tarea personalizada añadida por el estudiante.',
      completed: false
    });

    inputCustomTask.value = '';
    saveClassesToStorage();
    renderActiveStudyPlan();
    updateNavigationBadgesAndStats();
    showToast('Tarea de refuerzo añadida al checklist.', '✅');
  });

  // Vista 3: Historial y Buscador
  document.getElementById('btn-history-new-class').addEventListener('click', () => {
    switchView('view-nueva-clase');
  });

  document.getElementById('input-search-history').addEventListener('input', (e) => {
    state.historySearchQuery = e.target.value;
    renderClassesHistory();
  });

  document.querySelectorAll('.history-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.historyFilter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.history-filter-btn').forEach((b) => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-100', 'text-slate-700');
      btn.classList.add('bg-blue-600', 'text-white');
      renderClassesHistory();
    });
  });

  // Modal Acerca de / Créditos (Iván Andrés Urbano Rivera y Lucy Adriana Muñoz Cabrera)
  const modalCredits = document.getElementById('modal-credits');
  const openCreditsModal = () => modalCredits.classList.remove('hidden');
  const closeCreditsModal = () => modalCredits.classList.add('hidden');

  document.getElementById('btn-open-credits-modal').addEventListener('click', openCreditsModal);
  document.getElementById('btn-footer-credits').addEventListener('click', openCreditsModal);
  document.getElementById('btn-close-credits-modal').addEventListener('click', closeCreditsModal);
  document.getElementById('btn-close-credits-bottom').addEventListener('click', closeCreditsModal);
  modalCredits.addEventListener('click', (e) => {
    if (e.target === modalCredits) closeCreditsModal();
  });

  // Modal Configuración API Key de Google Gemini
  const modalApi = document.getElementById('modal-api');
  const inputApiKey = document.getElementById('input-api-key');
  const openApiModal = () => {
    inputApiKey.value = state.apiKey;
    modalApi.classList.remove('hidden');
  };
  const closeApiModal = () => modalApi.classList.add('hidden');

  document.getElementById('btn-open-api-modal').addEventListener('click', openApiModal);
  document.getElementById('btn-close-api-modal').addEventListener('click', closeApiModal);
  modalApi.addEventListener('click', (e) => {
    if (e.target === modalApi) closeApiModal();
  });

  document.getElementById('btn-save-api-key').addEventListener('click', () => {
    saveApiKeyToStorage(inputApiKey.value);
    closeApiModal();
    showToast(
      state.apiKey
        ? '🔑 Clave de Gemini API guardada correctamente.'
        : '✨ Modo Simulación Inteligente Local activado.',
      '⚙️'
    );
  });

  document.getElementById('btn-clear-api-key').addEventListener('click', () => {
    inputApiKey.value = '';
    saveApiKeyToStorage('');
    closeApiModal();
    showToast('Modo Simulación Inteligente Local activado.', '✨');
  });

  window.__MEMOCLASS_READY__ = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
