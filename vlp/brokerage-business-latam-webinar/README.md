# Webinar: Negocio de Brokerage en LATAM

Dos páginas estáticas conectadas y localizadas en español para Latinoamérica:

- `index.html` — landing de registro.
- `watch/index.html` — webinar room con reproductor y chat.

La implementación usa HTML, CSS y JavaScript sin dependencias. El diseño y la
estructura siguen la versión existente de Philippines, con contenido, agenda,
países telefónicos y claves de almacenamiento específicos para LATAM.

## Ejecutar localmente

Desde la raíz del repositorio:

```bash
python3 -m http.server 4173
```

Abrir:

- `http://127.0.0.1:4173/vlp/brokerage-business-latam-webinar/`
- `http://127.0.0.1:4173/vlp/brokerage-business-latam-webinar/watch/`

Los previews en `localhost` no envían formularios al CRM.

## Mobile

Ambas páginas están planteadas mobile-first y verificadas en 320, 360, 390,
430 y 768 px. Los controles interactivos principales tienen un área mínima de
44 × 44 px, los campos mantienen 16 px en móvil para evitar el zoom automático
de iOS y no hay scroll horizontal. La landing muestra los cinco recursos sin
un carrusel oculto; el player simplifica su status en pantallas menores de
360 px y respeta el safe area inferior. Los controles del video se ocultan
automáticamente después de 2,6 segundos y vuelven a aparecer con un toque,
movimiento del puntero o navegación por teclado.

## Registro y Bitrix

En producción, `webinar-crm.js` envía el formulario al proxy existente:

`https://group.quadcode.com/api/notPopup`

La integración no cambia la etapa comercial del lead. Marca la inscripción en
`Registered Webinar` (`UF_CRM_1758615537942`) y guarda el inicio de la sesión
concreta en `Webinar Date / Time` (`UF_CRM_1760090758537`). También usa el
identificador independiente `source_form=quadcode_latam_webinar`. Las respuestas
abiertas, Telegram, país telefónico, URL personal del webinar y parámetros UTM
se incluyen en el payload.

La página confirma el registro después de que el endpoint responde. Los avisos
externos se programan desde el registro persistido, no desde una etapa de CRM,
y usan una URL personal con el `registration_id`:

`https://quadcode.com/vlp/brokerage-business-latam-webinar/watch/`

## Mensajes del webinar

El VPS crea tres entregas idempotentes por registro: confirmación inmediata,
recordatorio una hora antes y aviso al comenzar. El worker usa la línea
ChatApp Quadcode (`47962`) y nunca depende de la etapa del lead. Las entregas
caducadas se omiten para evitar envíos tardíos.

Los tres templates WABA deben aprobarse en español antes de activar el worker:

- `qc_latam_webinar_registration_es`: `Hola, {{1}}. Tu registro para el webinar
  Negocio de Brokerage en LATAM está confirmado para {{2}}. Tu enlace personal:
  {{3}}. Te enviaremos otro recordatorio una hora antes.`
- `qc_latam_webinar_reminder_1h_es`: `Hola, {{1}}. El webinar comienza en una
  hora, a las {{2}}. Únete aquí con tu enlace personal: {{3}}.`
- `qc_latam_webinar_live_es`: `Hola, {{1}}. El webinar ya comenzó. Entra ahora
  con tu enlace personal: {{2}}.`

Los IDs aprobados se guardan únicamente en el `.env` del VPS como
`WEBINAR_CHATAPP_TEMPLATE_CONFIRMATION`,
`WEBINAR_CHATAPP_TEMPLATE_REMINDER_1H` y `WEBINAR_CHATAPP_TEMPLATE_LIVE`.
`WEBINAR_MESSAGES_ENABLED=true` se establece solo después de una prueba real
en un número interno. Mientras tanto, la cola se llena sin enviar mensajes.

## Horario

La sesión usa las `18:00 UTC`: 12:00 en Ciudad de México, 13:00 en Colombia y
Perú, 14:00 en Venezuela y 15:00 en Argentina y São Paulo. La landing muestra
la hora local del navegador para evitar conversiones manuales, sin comunicar
que la sesión se repite diariamente. Este valor también se envía al CRM y
aparece en la confirmación. Actualiza
`SESSION_HOUR_UTC` y `SESSION_TIME_LABEL` si cambia el horario definitivo.

El selector telefónico prioriza países de Latinoamérica y empieza en México
(`+52`).

## Asistencia y no-show

`webinar-tracking.js` registra la sesión elegida y genera un ID anónimo que se
añade a la URL de acceso. La sala envía `joined` y heartbeats acumulativos solo
cuando el video está reproduciéndose, la pestaña está visible y la sesión está
en directo. Una apertura de página no cuenta como asistencia: el umbral es de
60 segundos reales de reproducción.

Los eventos se guardan primero en Postgres en el VPS. El sincronizador actualiza
los campos de registro en Bitrix y añade una evidencia de asistencia al timeline
del lead. Después de que termine la sesión y transcurra el periodo de gracia, un
no-show puede pasar a `Doesn't attend webinar` (`UC_HKG926`) únicamente si el
lead sigue en `New`, `To reach` o en la antigua etapa `Registered Webinar`. Si
Sales ya lo movió a `Contacted`, `Good lead` u otra etapa, el sistema conserva
la etapa y añade solo la nota de no-show.

## Video, transcripción y chat sincronizado

La grabación está incluida como `assets/webinar-latam.mp4`: H.264/AAC, 720p,
22:23 y aproximadamente 87 MB. Se optimizó para reproducción web y tiene el
índice MP4 al inicio del archivo para comenzar a reproducirse antes de terminar
la descarga.

La transcripción en español está disponible en dos formatos:

- `assets/webinar-latam.vtt` — subtítulos sincronizados usados por el player.
- `assets/webinar-latam-transcript.txt` — transcripción completa en texto.

El botón `CC` permite activar o desactivar los subtítulos y guarda la
preferencia en el navegador.

La sala funciona como una sesión en directo programada: comienza cada día a
las 18:00 UTC, dura 22:23 y termina al mismo tiempo relativo cada día. Antes
del inicio, el player muestra un countdown y, cuando llega a cero, comienza
automáticamente sin sonido para cumplir las restricciones de autoplay del
navegador. El usuario puede activar el audio desde el control del player. El
usuario que entra tarde se incorpora al segundo que corresponde al reloj de la
sesión, no al principio de la grabación. El reproductor no muestra controles de
pausa o desplazamiento y corrige cualquier intento de cambiar el tiempo o la
velocidad. Para que los saltos funcionen en producción, el servidor o CDN debe
servir el MP4 con solicitudes HTTP Range (`206 Partial Content`).

`watch/index.html` configura el video, la hora UTC y el endpoint opcional. El
timeline del chat se genera en `watch/chat-schedule.js`: contiene 249 mensajes,
incluidas más de 100 intervenciones en los primeros 100 segundos, respuestas
de ciudades y países, reacciones y diez preguntas vinculadas a los momentos
en los que la presentadora comienza a responderlas:

```js
window.QUADCODE_WEBINAR = {
  videoSrc: "../assets/webinar-latam.mp4",
  durationSeconds: 1343.4,
  sessionHourUtc: 18,
  sessionTimeLabel: "18:00 UTC",
  chatEndpoint: "",
  timedChat: window.QUADCODE_WEBINAR_CHAT,
};
```

Los mensajes sincronizados aparecen cuando el reloj de la sesión alcanza su
segundo `at`. Al entrar tarde, el chat se rellena hasta ese mismo momento sin
animar cientos de mensajes a la vez; después continúa en tiempo real y sin
duplicados. Los mensajes escritos por el usuario siguen guardándose por
separado en el navegador. Sin `chatEndpoint`, la interfaz indica que no se
puede confirmar la entrega al equipo. La página watch incluye
`noindex, nofollow`.

Para QA local, `?liveAt=600` simula una entrada diez minutos después del inicio;
`?liveAt=-300` simula cinco minutos antes y `?liveAt=1500`, una sesión ya
terminada. El parámetro solo se activa en `localhost` o `127.0.0.1` y no cambia
el reloj de producción.

## Ruta de producción

`/vlp/brokerage-business-latam-webinar/`
