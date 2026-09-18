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
