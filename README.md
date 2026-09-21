# Vilas & Bugallo Asesores — plantilla «Casillas»

> **Sitio de demostración.** Vilas & Bugallo Asesores es un negocio ficticio;
> los datos, fotografías y opiniones son de muestra. Esta plantilla forma
> parte de la biblioteca de WEBS NEGOCIOS y no corresponde a ningún despacho
> real. Búsqueda previa hecha: existen despachos reales llamados «Ferreiro C.
> Asesoría Integral» y un bufete «Ferreiro Marzoa y Fernández Souto» con sede
> en Ordes, así que se descartó el nombre de partida («Ferreiro & Costas») y
> se eligió «Vilas & Bugallo», sin coincidencias encontradas.

Web estática (HTML + CSS + un `main.js`, sin build ni dependencias) para un
despacho ficticio de asesoría fiscal, laboral, contable y de constitución de
sociedades en Ordes (A Coruña). Cuarta plantilla ficticia del sector, dentro
de la excepción abierta el 2026-09-18 en `SECTORES.md` (junto a las de
concepto «Sello», «Cinta sumadora» y «Expediente», construidas por otros
agentes en paralelo).

## El concepto: «Casillas»

La rejilla de un formulario tributario, llevada a sistema de diseño completo:
recuadros de borde fino, casillas numeradas que se marcan al entrar en
pantalla, cifras en monoespaciada tabular, marcas de registro en las esquinas
(como las cruces de alineación de un impreso escaneado). No es un libro que
cuadra (Balance), ni una cuenta atrás (Cuenta atrás/Rivand), ni un sello
(Sello): es la estructura estática y gráfica de un formulario — el material
de trabajo diario de una gestoría — convertida en interfaz.

Deliberadamente **no** reproduce con precisión legal ningún modelo real de
Hacienda: los números de modelo (303, 130, 111, 200, 202...) son reales como
referencia de sector, pero el «impreso» de la portada es una casilla
inventada de muestra, con su propio membrete («Impreso 100/2026 · muestra»),
para no fingir ser un documento oficial.

## Mapa de secciones (orden deliberadamente distinto al de Dourado &
Fernández, Rivand y Cervantes, y al resto del lote)

1. **Portada** — el impreso de muestra marca sus casillas solo al abrirse la
   cortina; titular con char-reveal.
2. **Servicios** (01–04) — rejilla de casillas numeradas (Fiscal, Laboral,
   Contable, Sociedades) que se rellenan al entrar en viewport.
3. **Confianza** — la valoración y los testimonios en su propia casilla
   grande, **antes** del calendario a propósito (en Cervantes iba después).
4. **Calendario fiscal** — tabla de casillas (Mes · Trámite · Modelos · Plazo
   · Días); la fila «Próxima» y la columna «Días» se calculan en el navegador
   con `new Date()`, no están escritas a mano.
5. **Equipo + por qué elegirnos**, fusionadas en una sola sección (sin
   sección de equipo aparte, tal y como pide la especificación).
6. **Contacto + pie** — ficha de despacho, mapa bajo demanda, WhatsApp
   flotante, sello de demo y aviso de cookies.

## Movimiento (six recursos del §2 del pliego)

1. **Lenis** como único motor de scroll (se detiene mientras dura la
   cortina y arranca al retirarse).
2. **Char-reveal** letra a letra en los titulares (`data-char`), con
   `IntersectionObserver` — no `ScrollTrigger` con `once:true`, que no
   dispara si el bloque ya está en pantalla al crearse.
3. **Barra de progreso lateral** que imita el margen impreso de un
   formulario («NO ESCRIBIR EN ESTE MARGEN»), con relleno atado al scroll.
4. **Botones magnéticos** en el CTA principal y en el WhatsApp flotante.
5. **Contadores tabulares** (`font-variant-numeric: tabular-nums`) en las
   cifras de la portada, la valoración y el número de respuestas de la
   encuesta.
6. **Cortina de entrada** con gesto propio (obligatoria, no cuenta para el
   mínimo): una rejilla de 32 casillas se marca en oleada y el bloque entero
   se retira con un barrido — como quien completa un impreso y lo aparta.

Las casillas de servicios y el impreso de la portada se rellenan con
`IntersectionObserver` + una transición CSS corta, **no** con GSAP: así
siguen funcionando aunque el CDN de GSAP esté caído.

## Paleta y tipografía

- **Paleta**: gris papel `#E7E5DF` (base), grafito `#2B2E33` (estructura y
  texto), petróleo `#3E6E6B` (único acento). Sin rojo ni ámbar, a propósito:
  ni la estética de la Agencia Tributaria real, ni el ámbar ya usado en la
  plantilla del taller mecánico del lote general.
- **Tipografía**: [Manrope](https://fonts.google.com/specimen/Manrope)
  (titulares y cuerpo) + [JetBrains
  Mono](https://fonts.google.com/specimen/JetBrains+Mono) (cifras y
  casillas, siempre con `tabular-nums`). Revisados a mano `€`, `ñ` y tildes
  en ambas antes de cerrar la elección — ver `scripts/verify.js`, prueba de
  cobertura de glifos con `document.fonts.check`.
- **Contraste**: ningún color se decidió a ojo. `scripts/contrast.js` calcula
  la razón de contraste (fórmula WCAG) de cada combinación de la paleta y de
  ahí salen los tokens `--texto-apagado` (4,65:1 sobre papel) y
  `--texto-apagado-sobre-grafito` (4,95:1 sobre grafito) — nunca con
  `opacity`, que no se puede auditar.

## Qué hay que tocar para reskinearla a un cliente real

- **Datos del despacho**: `index.html` (nombre, dirección, teléfonos, correo,
  horario, texto del `schema.org`), `js/main.js` (número de WhatsApp y
  dirección del mapa en `mapaBajoDemanda`), `manifest.json`.
- **Paleta**: los tokens `--papel`, `--grafito`, `--petroleo` en
  `css/style.css` (recalcular contraste con `scripts/contrast.js` tras
  cambiarlos).
- **Logo**: `assets/img/logo.svg` y `assets/img/favicon.svg`; el `og-image`
  se regenera con `node scripts/render-assets.js` tras editar
  `scripts/og-template.html`.
- **Equipo**: sustituir `assets/img/equipo-*.svg` por fotos reales o nuevas
  ilustraciones, y los textos de `#equipo` en `index.html`.
- **Calendario fiscal**: la tabla `[data-calendario]` en `index.html` — cada
  fila lleva `data-mes` y `data-dia` (día del plazo); la columna «Días» y la
  fila «Próxima» se recalculan solas.
- **Servicios**: las cuatro casillas `01–04` de `#servicios`.
- **Reseñas**: los cuatro `<li class="testimonio">` de `#confianza` — recordar
  la línea roja del pliego: nunca atribuirlas a Google/TripAdvisor ni meterlas
  en el `schema.org` como `aggregateRating`/`review`.

## El control de paleta (demostración, quitar antes de dar la web por oficial)

Mando flotante abajo a la izquierda (`Paleta · Teja / Original / Añil /
Siena`) para enseñar la misma web con cuatro colores de marca distintos
delante del cliente, sin tener que retocar CSS en directo durante la
reunión. Nació el 2026-09-21, tras una reunión real con otro cliente del
sector (Dourado & Fernández) que rechazó el verde de su plantilla; ahora es
requisito estándar del pliego (§5, «Control de paleta») para todas las
plantillas de la carpeta.

**Actualización del mismo día:** Dourado & Fernández ya tiene su propia web
en su rojo real (`dourado-fernandez-asesores-carballo-web`), y esa misma
plantilla —junto con las otras 6 de asesoría/gestoría de la carpeta,
incluida esta— se va a enviar por email al cliente para que compare
ESTRUCTURA, no color. Por eso el rojo de Dourado & Fernández ("Teja" en el
mando) pasa a ser el valor por defecto en frío (sin nada en `localStorage`):
las 7 plantillas llegan ya en "su" color, y el color deja de ser una
variable en la comparación. El petróleo nativo de esta plantilla no
desaparece: se convierte en la opción "Original".

**Segunda actualización del mismo día:** la web real de Dourado & Fernández
también tiene el papel/fondo en blanco puro (`#FFFFFF`), no en el gris frío
de esta plantilla. Como el objetivo de "Teja" es enseñarle al cliente una
vista fiel de "tu web con tus colores exactos", no solo el acento sobre un
papel que no es el suyo, `--papel`/`--papel-panel` en el `:root` bare (Teja,
el estado en frío) pasan también a blanco. Original, Añil y Siena no son
Dourado, así que las tres devuelven el papel gris nativo de la plantilla:
la demostración de papel blanco es exclusiva de Teja.

- **Teja** `#9C2A2E` / `#7A1418`, papel `#FFFFFF` / panel `#F2F0EA` — el rojo
  y el papel reales de Dourado & Fernández; **por defecto, sin clase, en
  frío**.
- **Original** `#3E6E6B` / `#2F5350`, papel `#E7E5DF` / panel `#DEDCD5` — el
  petróleo y el papel nativos de esta plantilla, ahora accesibles con la
  clase `html.paleta-original`.
- **Añil** `#2C4A76` / `#1F3554`, papel nativo `#E7E5DF` / `#DEDCD5` — tinta
  añil, la que se usaba para sellos y matasellos oficiales.
- **Siena** `#8A4A28` / `#6B3A1F`, papel nativo `#E7E5DF` / `#DEDCD5` — tierra
  de sombra tostada, tono de archivo y de tinta envejecida.

Cambian `--petroleo` y `--petroleo-oscuro` (y, con ellos, `--texto-acento`,
que deriva del segundo por `var()`) en las cuatro; `--papel`/`--papel-panel`
cambian solo en Teja (blanco de Dourado) frente a las otras tres (gris
nativo) — el grafito y el texto sí son idénticos en las cuatro. Cada
variante mantiene el mismo contraste mínimo comprobado con
`scripts/contrast.js` para su propio hexadecimal (nunca asumido por
parecido): el color de relleno frente a `--blanco` ≥5,76:1, y la variante
oscura como texto sobre `--papel` ≥6,74:1 — Teja da 7,54:1 y 8,59:1 con el
petróleo, y el texto (grafito) pasa de 10,82:1 a 13,62:1 sobre el papel
blanco (el texto apagado de 4,65:1 a 5,85:1), así que el cambio de papel
mejora el contraste en vez de arriesgarlo. La elección se recuerda en
`localStorage` (`casillas-paleta`) y se aplica en el `<head>`, antes de
pintar, para que no haya parpadeo al recargar. El mando nunca tapa el aviso
de cookies: `js/main.js` mide el alto real del aviso mientras está abierto y
lo guarda en la variable `--cookie-h`, que el mando usa para subir por
encima de él.

Esquema de clases: **Teja** es el estado "bare" de `:root` (sin clase, es
el que se ve en frío sin `localStorage`); **Original**, **Añil** y **Siena**
son las tres clases explícitas (`html.paleta-original` /
`html.paleta-anil` / `html.paleta-siena`).

Para quitarlo al entregar la web ya como oficial (y devolver `--petroleo` /
`--petroleo-oscuro` de `:root` al petróleo nativo `#3E6E6B` / `#2F5350` si
el cliente final es esta plantilla y no Dourado & Fernández):

1. En `index.html`: el bloque `<script>` del `<head>` que resuelve
   `casillas-paleta` (justo antes de `</head>`) y el bloque
   `<div class="paleta" id="paleta" hidden>...</div>` (antes del botón de
   WhatsApp flotante).
2. En `css/style.css`: los valores de `--petroleo` / `--petroleo-oscuro` y
   `--papel` / `--papel-panel` en `:root` (volver a `#3E6E6B` / `#2F5350` y
   `#E7E5DF` / `#DEDCD5` si el cliente final es esta plantilla y no Dourado &
   Fernández), el bloque `html.paleta-original` / `html.paleta-anil` /
   `html.paleta-siena` justo después de `:root`, y el bloque «Control de
   paleta» junto a las reglas de `.whatsapp-flotante`. La variable
   `--cookie-h` de `:root` puede quedarse (no hace nada por sí sola) o
   borrarse también.
3. En `js/main.js`: la función `initPaleta()` completa, y el añadido de
   `--cookie-h` dentro de `avisoCookies()` (puede simplificarse de vuelta a
   solo `banner.hidden = true/false` si se retira el mando).
4. En `scripts/verify.js`: los bloques 10 y 11 («Control de paleta...»), si
   se quiere que la suite de verificación deje de esperar el mando.

## Créditos

No se ha usado ninguna fotografía de archivo: todo el material gráfico
(logo, favicon, iconos de servicios, retratos del equipo, marco del
`og-image`) es SVG/HTML propio de este repositorio. No aplica `CREDITOS.md`.

## Verificación (§7 del pliego)

Ver el informe final del agente para el resultado íntegro. Resumen: la
plantilla se abrió con Playwright en 1440×900 y 390×844, con capturas de
cada sección en `screenshots/`, pasada con el CDN de GSAP bloqueado, pasada
con `prefers-reduced-motion: reduce`, y comprobación de los botones de
cookies, menú móvil y mapa. `scripts/verify.js` automatiza la mayoría de
estas pruebas; `scripts/contrast.js` calcula el contraste de la paleta.

```
NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js
```

(necesita un servidor estático en la raíz del repo, por ejemplo
`python -m http.server 8000`).

## Decisiones tomadas

- El nombre inicial de la especificación («Ferreiro & Costas») colisionaba
  con despachos reales en la zona (ver aviso al principio de este README);
  se cambió a «Vilas & Bugallo» tras comprobar que no hay coincidencias.
- Se mantiene el orden servicios → confianza → calendario → equipo →
  contacto, distinto al de las otras plantillas del sector, tal y como pide
  la especificación.
- Los números de modelo tributario (303, 130, 111, 200, 202...) se usan como
  referencia de sector porque son de dominio público y no identifican a
  ningún contribuyente; el «impreso» de la portada, en cambio, es
  explícitamente una muestra y no reproduce ningún modelo oficial completo.
- Demo: **pendiente de publicar** (no autorizado aún). El repo se ha creado
  y versionado en local; no se ha creado repositorio remoto ni GitHub Pages.
