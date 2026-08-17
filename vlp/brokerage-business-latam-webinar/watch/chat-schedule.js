(() => {
  "use strict";

  const firstNames = [
    "Alejandro", "Andrea", "Andrés", "Camila", "Carlos", "Carolina",
    "Catalina", "Daniel", "Daniela", "David", "Diego", "Eduardo", "Elena",
    "Felipe", "Fernanda", "Gabriel", "Isabella", "Javier", "Jorge", "José",
    "Juan", "Laura", "Lucía", "Luis", "Manuel", "Mariana", "Martín",
    "Mateo", "Natalia", "Nicolás", "Pablo", "Paola", "Rafael", "Ricardo",
    "Santiago", "Sofía", "Valentina", "Verónica", "Ximena", "Álvaro",
  ];
  const surnameInitials = [
    "A.", "B.", "C.", "D.", "F.", "G.", "H.", "L.", "M.", "P.",
    "R.", "S.", "T.", "V.", "Z.",
  ];
  const countries = [
    "México", "Colombia", "Argentina", "Chile", "Perú", "Ecuador",
    "Uruguay", "Paraguay", "Bolivia", "Costa Rica", "Panamá", "España",
    "Rep. Dominicana", "Guatemala", "Venezuela",
  ];
  const messages = [];
  let sequence = 0;

  const participant = (index, location) => ({
    name: `${firstNames[(index * 17 + 11) % firstNames.length]} ${surnameInitials[(index * 11 + 5) % surnameInitials.length]}`,
    location: location || countries[(index * 7 + 3) % countries.length],
  });

  const add = (at, text, index = sequence, location = "") => {
    const author = participant(index, location);
    sequence += 1;
    messages.push({
      id: `audience-${String(sequence).padStart(3, "0")}`,
      at: Number(at.toFixed(1)),
      name: author.name,
      location: author.location,
      text,
    });
  };

  const addCluster = (start, end, count, texts, seed = 0) => {
    const span = Math.max(0, end - start);
    let randomState = (seed + 1) * 7919;
    const random = () => {
      randomState = (randomState * 48271) % 2147483647;
      return randomState / 2147483647;
    };
    const positions = Array.from({ length: count }, () => random()).sort(
      (first, second) => first - second,
    );

    positions.forEach((position, index) => {
      add(
        start + span * position,
        texts[index % texts.length],
        index + seed * 13,
      );
    });
  };

  addCluster(5, 20, 16, [
    "¡Hola a todos! 👋", "Buenas, ya estoy dentro", "Hola, qué gusto estar aquí",
    "Listo para empezar 🙌", "Saludos desde Colombia", "Hola equipo",
    "Gracias por organizarlo", "Llegué justo a tiempo 😅", "Buenas tardes desde Lima",
    "Todo listo por acá", "Hola! primera vez en un webinar de Quadcode",
    "Conectada 👋", "Qué tal a todos", "Ya con café y libreta", "Saludos, equipo",
    "Hola desde México",
  ], 1);

  const locations = [
    ["Ciudad de México", "México"], ["Bogotá", "Colombia"],
    ["Buenos Aires", "Argentina"], ["Lima", "Perú"], ["Santiago", "Chile"],
    ["Medellín", "Colombia"], ["Monterrey", "México"], ["Quito", "Ecuador"],
    ["Madrid", "España"], ["Guadalajara", "México"], ["Cali", "Colombia"],
    ["Montevideo", "Uruguay"], ["Córdoba", "Argentina"], ["Panamá", "Panamá"],
    ["San José", "Costa Rica"], ["Puebla", "México"], ["Arequipa", "Perú"],
    ["Barranquilla", "Colombia"], ["Málaga", "España"], ["Rosario", "Argentina"],
    ["Guayaquil", "Ecuador"], ["Asunción", "Paraguay"], ["La Paz", "Bolivia"],
    ["Valencia", "España"], ["Mérida", "México"], ["Cartagena", "Colombia"],
    ["Santo Domingo", "Rep. Dominicana"], ["Tijuana", "México"],
    ["Mar del Plata", "Argentina"], ["Antofagasta", "Chile"], ["Cusco", "Perú"],
    ["Caracas", "Venezuela"], ["Sevilla", "España"], ["León", "México"],
    ["Manizales", "Colombia"], ["Santa Cruz", "Bolivia"], ["Guatemala", "Guatemala"],
    ["Cancún", "México"], ["Valparaíso", "Chile"], ["Mendoza", "Argentina"],
    ["Trujillo", "Perú"], ["Bucaramanga", "Colombia"], ["Alicante", "España"],
    ["Querétaro", "México"], ["Punta del Este", "Uruguay"],
    ["San Salvador", "El Salvador"], ["Tegucigalpa", "Honduras"],
    ["Managua", "Nicaragua"], ["San Juan", "Puerto Rico"], ["Maracaibo", "Venezuela"],
  ];

  locations.forEach(([city, country], index) => {
    const at = 29 + (36 * index) / (locations.length - 1) + ((index * 7) % 5) / 10;
    const place = city === country ? city : `${city}, ${country}`;
    const variants = [
      `${place} 👋`, `Conectado desde ${city}`, `${city} por aquí 🙌`,
      `Saludos desde ${place}`, `${city} presente`, `Les veo desde ${city}`,
      `Acá conectados en ${city}`, `Otro desde ${city}`, `Hoy desde ${city}`,
      `Buen día desde ${city}`,
    ];
    add(at, variants[index % variants.length], index + 30, country);
  });

  addCluster(80, 97, 36, [
    "+", "+ por acá", "Se escucha perfecto", "Todo bien desde Bogotá", "+1 🙌",
    "Audio perfecto", "Listos ✅", "Sí, todo claro", "Fuerte y claro",
    "Se ve y se oye bien", "Todo ok en México", "Clarísimo", "Audio bien",
    "Sin problemas por aquí", "Perfecto desde Lima", "Sí 👍", "Se escucha súper",
    "Imagen y sonido ok", "Todo bien", "Acá se oye perfecto", "Confirmo audio",
    "Bien desde Chile", "Ok por este lado", "Nítido", "Sí, continuemos",
    "Cero cortes por ahora", "Muy bien el sonido", "Recibido desde Panamá",
    "Va perfecto", "Audio 10/10", "Los escuchamos bien", "Sin delay",
    "Todo correcto", "Estamos listos", "Bien acá", "Dale, seguimos",
  ], 4);

  addCluster(108, 225, 15, [
    "No había calculado el ingreso por usuario de esa forma",
    "Justo quería entender mejor el retorno",
    "¿Ese margen cambia mucho según el país?",
    "La parte de retención pesa más de lo que pensaba",
    "Entonces marketing es una parte grande del presupuesto",
    "anotando esas métricas",
    "¿El ejemplo asume tráfico de afiliados o paid media?",
    "Esto sirve para aterrizar el business plan",
    "Me gustaría ver el cálculo con menos depósitos iniciales",
    "El costo de adquisición suele variar muchísimo",
    "¿Tienen un benchmark de LTV para LATAM?",
    "Buen punto lo de no mirar solo el primer depósito",
    "En nuestro caso la retención es el mayor reto",
    "La cifra parece optimista, pero entiendo el escenario",
    "¿La calculadora que entregan deja editar estas variables?",
  ], 5);

  addCluster(245, 392, 14, [
    "20 días me parece bastante rápido",
    "¿Ustedes acompañan también la publicación de las apps?",
    "Bien verlo separado por etapas",
    "La analítica desde el día uno sí o sí",
    "¿El branding completo entra dentro de esos 20 días?",
    "Tener un calendario cerrado ayuda a venderlo internamente",
    "Pensé que la parte técnica llevaba varios meses",
    "¿La documentación del sitio viene incluida?",
    "En nuestra empresa legal suele ser el cuello de botella",
    "¿Los 20 días cuentan desde que entregamos el KYC corporativo?",
    "Eso depende bastante de pagos, ¿no?",
    "Me interesa saber qué necesita preparar el cliente antes",
    "Buen roadmap, se entiende fácil",
    "¿Hay una persona de proyecto durante todo el setup?",
  ], 6);

  addCluster(404, 556, 16, [
    "Nosotros estamos mirando Colombia primero",
    "Brasil es enorme, pero el idioma cambia toda la operación",
    "¿Tienen ese análisis separado por país?",
    "Tiene sentido empezar donde la ejecución sea más simple",
    "La estrategia por olas me gusta más que salir a todo LATAM",
    "¿La localización contempla pagos y documentos locales?",
    "Entre México y Colombia todavía no nos decidimos",
    "Este mapa de GEO nos vendría muy bien",
    "¿Es viable lanzar en dos países a la vez con un equipo pequeño?",
    "En Perú vemos menos competencia, aunque el mercado es menor",
    "Argentina tiene usuarios, pero los pagos son complejos",
    "¿Incluyen Centroamérica en el research?",
    "Panamá podría servir como primera operación regional",
    "Nuestro tráfico hoy viene sobre todo de Chile",
    "¿Qué indicador usan para medir la facilidad de ejecución?",
    "Yo priorizaría métodos de pago antes que tamaño de mercado",
  ], 7);

  addCluster(570, 668, 13, [
    "100 pasarelas es bastante, ¿cuáles funcionan mejor en LATAM?",
    "¿El módulo de afiliados soporta CPA y revenue share juntos?",
    "Que el CRM ya esté integrado nos ahorra trabajo",
    "Fraude en pagos es una preocupación real para nosotros",
    "¿Las apps son nativas o webview?",
    "Coordinar menos proveedores sería un alivio",
    "Quisiera ver más del módulo de risk management",
    "Cripto más métodos locales cubre casi todos nuestros casos",
    "¿Se puede traer un PSP que ustedes todavía no tengan?",
    "Necesitamos conciliación por cada país",
    "¿El back office muestra intentos de depósito fallidos?",
    "La parte de afiliados es clave para este público",
    "Qué tan rápido integran un método de pago nuevo?",
  ], 8);

  addCluster(704, 798, 12, [
    "Para nosotros es importante que no parezca una plantilla",
    "¿También se personalizan los emails transaccionales?",
    "Las herramientas de trading se ven completas",
    "Gracias por separar tecnología de asesoría regulatoria",
    "Ese punto cambia totalmente de un país a otro",
    "¿Pueden recomendar firmas legales por jurisdicción?",
    "Ahora entiendo mejor qué queda bajo nuestra marca",
    "¿El dominio y las cuentas de las stores quedan a nombre del cliente?",
    "Necesitamos dos marcas sobre la misma infraestructura, ¿se puede?",
    "Me interesa saber qué cosas no son personalizables",
    "Bien que sean claros con el alcance legal",
    "¿El front se puede adaptar después del lanzamiento?",
  ], 9);

  addCluster(812, 1018, 18, [
    "Ok, entonces MT5 no viene dentro de esta propuesta",
    "Prefiero una mensualidad clara a veinte cargos pequeños",
    "¿El soporte técnico está incluido en la cuota?",
    "Hay que comparar el costo total, no solo el setup",
    "¿Pueden compartir una tabla de precios después?",
    "¿Liquidez y dealing vienen desde el paquete base?",
    "Cobrar por usuario verificado complica mucho el forecast",
    "El soporte interno también tiene un costo que a veces olvidamos",
    "Ahora veo mejor la diferencia con otros white labels",
    "MT5 sigue siendo un requisito para algunos de nuestros partners",
    "¿Existe un mínimo de usuarios o volumen mensual?",
    "Qué costos quedan fuera del fee mensual?",
    "Me interesa el costo del segundo año, no solo el lanzamiento",
    "¿Las actualizaciones de producto se cobran aparte?",
    "En nuestro caso necesitaríamos un SLA específico",
    "Esto parece más fácil de presupuestar",
    "¿El precio cambia por cantidad de países?",
    "Sería útil recibir un ejemplo de P&L completo",
  ], 10);

  addCluster(1025, 1140, 13, [
    "Nuestro onboarding actual pierde mucha gente en el KYC",
    "Interesante escuchar feedback real de traders",
    "¿En la calculadora se puede modificar el ARPU?",
    "La guía de marketing me interesa especialmente",
    "Ese checklist nos puede ahorrar varias reuniones",
    "¿Los materiales llegan por email al terminar?",
    "El template de plan de negocio sería muy útil",
    "Retención es donde más necesitamos ayuda",
    "¿El KYC cambia automáticamente según el país?",
    "Me gustaría medir abandono por cada pantalla",
    "Bien que incluyan algo práctico y no solo slides",
    "¿La calculadora contempla bonos y promociones?",
    "Guardando varias preguntas para la consulta 😄",
  ], 11);

  addCluster(1142, 1272, 18, [
    "Nosotros ya usamos HubSpot, por eso preguntaba por el CRM",
    "No conocía la diferencia de las operaciones Blitz",
    "Empezar básico y ampliar después suena razonable",
    "¿El upgrade requiere una ventana de mantenimiento?",
    "Que el costo acompañe el volumen tiene más sentido",
    "Gracias, esa era justo mi duda",
    "Ahora sí me queda claro",
    "Buena sesión, muy concreta 👏",
    "¿La migración de CRM la puede hacer nuestro equipo?",
    "Blitz podría funcionar bien para campañas cortas",
    "Necesitaríamos revisar la API antes de decidir",
    "Se agradecen respuestas sin tanta vuelta",
    "¿Hay sandbox para probar las integraciones?",
    "Me llevo varias tareas para revisar con el equipo",
    "La opción de crecer por módulos reduce el riesgo",
    "Gracias por contestar también las preguntas difíciles",
    "¿Comparten la grabación luego?",
    "Muy útil el bloque de preguntas",
  ], 12);

  addCluster(1280, 1332, 18, [
    "Gracias por la presentación", "Buen webinar, directo al punto 👏",
    "Ya guardé el contacto", "Les voy a escribir con nuestro caso",
    "Me sirvió para ordenar varias ideas", "Gracias desde Monterrey",
    "Éxitos a todos con sus proyectos", "Nos vemos, equipo 🙌",
    "Gracias por tomarse el tiempo", "Gran sesión, Barbara",
    "Quedo pendiente de los materiales", "Muy útil para quienes estamos empezando",
    "Nos llevamos varias preguntas internas", "Saludos desde Bogotá",
    "Voy a revisar la calculadora", "Gracias, que tengan buen día",
    "Hablamos pronto", "Excelente cierre",
  ], 13);

  [
    [134, "Carlos R.", "México", "¿Cuánto puedo ganar durante el primer mes?"],
    [255, "Mariana P.", "Colombia", "Si empezamos hoy, ¿cuánto tarda la plataforma en estar operativa?"],
    [405, "Diego A.", "Argentina", "¿En qué país conviene lanzar primero un nuevo broker?"],
    [671, "Lucía M.", "Perú", "¿Puedo conectar mis propios proveedores de liquidez?"],
    [759, "Andrés C.", "Chile", "¿Necesito una licencia regulatoria para empezar?"],
    [802, "Sofía G.", "España", "¿Se puede usar MetaTrader 5 y cuál es el costo mínimo?"],
    [1146, "Javier R.", "México", "¿Puedo conectar un CRM externo que ya utiliza mi equipo?"],
    [1175, "Valentina C.", "Colombia", "¿Cuál es la diferencia entre las operaciones normales y Blitz?"],
    [1207, "Martín F.", "Uruguay", "¿Puedo empezar con el paquete base y ampliarlo más adelante?"],
    [1246, "Paula S.", "Argentina", "¿Cómo funcionan las tarifas mensuales a largo plazo?"],
  ].forEach(([at, name, location, text], index) => {
    messages.push({
      id: `question-${String(index + 1).padStart(2, "0")}`,
      at,
      name,
      location,
      text,
    });
  });

  globalThis.QUADCODE_WEBINAR_CHAT = messages.sort(
    (first, second) => first.at - second.at,
  );
})();
