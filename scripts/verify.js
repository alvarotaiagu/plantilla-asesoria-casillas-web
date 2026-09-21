/* Verificación de Vilas & Bugallo Asesores («Casillas») con Playwright.
   Necesita un servidor local en la raíz del proyecto:
       python -m http.server 8973
   Uso:  NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js
   Escribe screenshots/ y scripts/verify-report.json. Sale con código 1 si algo falla. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.CASILLAS_URL || 'http://127.0.0.1:8973/';
const RAIZ = path.join(__dirname, '..');
const CAPS = path.join(RAIZ, 'screenshots');
fs.mkdirSync(CAPS, { recursive: true });

const res = [];
const ok = (nombre, valor, detalle) => {
  res.push({ prueba: nombre, ok: !!valor, detalle: detalle === undefined ? null : detalle });
  console.log((valor ? 'OK   ' : 'FALLA') + ' ' + nombre +
    (detalle !== undefined ? '  ' + JSON.stringify(detalle) : ''));
};

const UA_CTX = { viewport: { width: 1440, height: 900 } };

async function pagina(browser, opciones = {}) {
  const ctx = await browser.newContext(Object.assign({}, UA_CTX, opciones));
  const p = await ctx.newPage();
  p.__errores = [];
  p.on('pageerror', e => p.__errores.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p.__errores.push('console: ' + m.text()); });
  p.on('requestfailed', r => p.__errores.push('requestfailed: ' + r.url()));
  return p;
}

/* Con Lenis, window.scrollTo no dispara los ScrollTrigger/observers del
   final: se recorre con la rueda, como haría una persona. */
async function recorrer(p, paso = 500, espera = 130) {
  await p.mouse.move(700, 450);
  let anterior = -1;
  for (let i = 0; i < 140; i++) {
    await p.mouse.wheel(0, paso);
    await p.waitForTimeout(espera);
    const y = await p.evaluate(() => Math.round(window.scrollY));
    if (y === anterior) break;
    anterior = y;
  }
  await p.waitForTimeout(2600);
  const alto = await p.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < 140; i++) {
    await p.mouse.wheel(0, -paso * 3);
    await p.waitForTimeout(20);
    if (await p.evaluate(() => window.scrollY) <= 0) break;
  }
  await p.waitForTimeout(300);
  return alto;
}

(async () => {
  const b = await chromium.launch();

  /* ==================================================================
     1 · Carga normal, escritorio, cortina y cookies
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });

    ok('cortina: arranca cubriendo la pantalla',
      await p.evaluate(() => document.documentElement.classList.contains('cortina-puesta')));

    await p.waitForFunction(() => {
      const c = document.querySelector('[data-cortina]');
      return !c || c.hidden === true;
    }, null, { timeout: 8000 });
    ok('cortina: se retira sola (queda hidden=true)', true);
    ok('cortina: la clase cortina-puesta se quita al retirarse',
      await p.evaluate(() => !document.documentElement.classList.contains('cortina-puesta')));

    await p.waitForTimeout(600);
    const impreso = await p.evaluate(() =>
      [...document.querySelectorAll('[data-impreso]')].map(e => e.classList.contains('esta-rellena')));
    ok('portada: las casillas del impreso se marcan solas al abrirse la cortina',
      impreso.length === 7 && impreso.every(Boolean), impreso);

    await p.click('.cookie-ack');
    const cerrado = await p.evaluate(() => {
      const el = document.querySelector('.cookie-banner');
      return { hidden: el.hidden, display: getComputedStyle(el).display };
    });
    ok('cookies: el botón cierra de verdad (display:none, no solo [hidden])',
      cerrado.hidden === true && cerrado.display === 'none', cerrado);

    const titularHero = await p.evaluate(() => {
      const chars = [...document.querySelectorAll('#portada .split-char')];
      return { n: chars.length, visibles: chars.filter(c => +getComputedStyle(c).opacity > 0.9).length };
    });
    ok('portada: el titular con char-reveal ha terminado de entrar',
      titularHero.n > 10 && titularHero.visibles === titularHero.n, titularHero);

    await p.screenshot({ path: path.join(CAPS, 'd-01-portada.png') });

    await recorrer(p);

    const servicios = await p.evaluate(() =>
      [...document.querySelectorAll('#servicios .casilla-marcable')].map(e => e.classList.contains('esta-rellena')));
    ok('servicios: las cuatro casillas numeradas se han marcado', servicios.length === 4 && servicios.every(Boolean), servicios);

    const titulares = await p.evaluate(() =>
      [...document.querySelectorAll('[data-char]')].map(h => {
        const chars = [...h.querySelectorAll('.split-char')];
        return chars.length > 0 && chars.every(c => +getComputedStyle(c).opacity > 0.9);
      }));
    ok('titulares: todos los data-char han revelado sus letras', titulares.every(Boolean), titulares);

    const calendario = await p.evaluate(() => {
      const filas = [...document.querySelectorAll('[data-calendario] tbody tr')];
      const dias = filas.map(f => f.querySelector('[data-dias]').textContent.trim());
      const proximas = filas.filter(f => f.classList.contains('fila-proxima')).length;
      return { n: filas.length, dias, proximas, todasNumericas: dias.every(d => /^\d+$/.test(d)) };
    });
    ok('calendario: las ocho filas tienen un número de días calculado', calendario.n === 8 && calendario.todasNumericas, calendario);
    ok('calendario: exactamente una fila marcada como "próxima"', calendario.proximas === 1, calendario);

    const contadores = await p.evaluate(() => ({
      anios: document.querySelector('[data-contador="17"]').textContent.trim(),
      nota: document.querySelector('[data-contador-dec]').textContent.trim(),
      respuestas: document.querySelector('[data-contador="36"]').textContent.trim()
    }));
    ok('contadores: han llegado a su valor final',
      contadores.anios === '17' && contadores.nota === '4,8' && contadores.respuestas === '36', contadores);

    const margen = await p.evaluate(() => {
      const el = document.querySelector('[data-progreso]');
      return el ? el.style.height : null;
    });
    ok('margen lateral: el relleno de progreso se ha movido con el scroll',
      margen !== null && margen !== '0.00%', margen);

    await p.screenshot({ path: path.join(CAPS, 'd-02-servicios.png') });

    ok('sin errores de consola ni peticiones fallidas', p.__errores.length === 0, p.__errores);
    await p.context().close();
  }

  /* ==================================================================
     2 · Capturas de cada sección (escritorio)
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3200);
    await p.click('.cookie-ack');
    const secciones = ['portada', 'servicios', 'confianza', 'calendario', 'equipo', 'contacto'];
    for (const id of secciones) {
      await p.locator('#' + id).scrollIntoViewIfNeeded();
      /* deja asentar el scroll con inercia de Lenis y terminar cualquier
         transición de entrada antes de capturar */
      await p.waitForTimeout(1800);
      await p.screenshot({ path: path.join(CAPS, 'sec-' + id + '.png') });
    }
    await p.context().close();
  }

  /* ==================================================================
     3 · Mapa bajo demanda
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    await p.click('.cookie-ack');
    const antes = await p.evaluate(() => document.querySelectorAll('.mapa-caja iframe').length);
    ok('mapa: no se carga ningún iframe hasta el clic', antes === 0, antes);
    await p.locator('.map-consent').scrollIntoViewIfNeeded();
    await p.click('.map-consent');
    await p.waitForTimeout(500);
    const despues = await p.evaluate(() => {
      const f = document.querySelector('.mapa-caja iframe');
      return f ? f.getAttribute('src') : null;
    });
    ok('mapa: tras el clic aparece el embed de Google sin API key',
      !!despues && despues.includes('output=embed') && despues.includes('Bugallo'), despues);
    await p.screenshot({ path: path.join(CAPS, 'v-mapa.png') });
    await p.context().close();
  }

  /* ==================================================================
     4 · Menú móvil
     ================================================================== */
  {
    const p = await pagina(b, { viewport: { width: 390, height: 844 } });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3200);
    await p.click('.cookie-ack');
    const antes = await p.evaluate(() => ({
      expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'),
      hidden: document.querySelector('.nav-movil').hidden
    }));
    ok('menú móvil: cerrado al empezar', antes.expanded === 'false' && antes.hidden === true, antes);
    await p.click('.nav-toggle');
    const abierto = await p.evaluate(() => ({
      expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'),
      hidden: document.querySelector('.nav-movil').hidden
    }));
    ok('menú móvil: se abre y marca aria-expanded', abierto.expanded === 'true' && abierto.hidden === false, abierto);
    await p.screenshot({ path: path.join(CAPS, 'v-menu-movil.png') });
    await p.click('.nav-toggle');
    const cerrado = await p.evaluate(() => document.querySelector('.nav-movil').hidden);
    ok('menú móvil: se cierra de nuevo', cerrado === true);
    await p.context().close();
  }

  /* ==================================================================
     5 · Menos movimiento
     ================================================================== */
  {
    const p = await pagina(b, { reducedMotion: 'reduce' });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    await recorrer(p, 700, 90);
    const r = await p.evaluate(() => {
      const filas = [...document.querySelectorAll('[data-calendario] tbody tr')];
      return {
        hasMotion: document.documentElement.classList.contains('has-motion'),
        cortinaTapando: document.querySelector('[data-cortina]').hidden === false,
        titular: document.querySelector('.portada-titulo').textContent.trim().length > 5,
        impreso: [...document.querySelectorAll('[data-impreso]')].every(e => e.classList.contains('esta-rellena')),
        contador: document.querySelector('[data-contador="17"]').textContent.trim(),
        dias: filas.map(f => f.querySelector('[data-dias]').textContent.trim()),
        margenVisible: getComputedStyle(document.querySelector('.margen-progreso')).display
      };
    });
    ok('reduced-motion: no se activa la coreografía (has-motion apagado)', r.hasMotion === false, r.hasMotion);
    ok('reduced-motion: la cortina no se queda tapando la página', r.cortinaTapando === false, r.cortinaTapando);
    ok('reduced-motion: el titular se lee igualmente (sin split de letras)', r.titular, r.titular);
    ok('reduced-motion: el impreso de la portada se ve ya relleno (es contenido, no movimiento)', r.impreso, r.impreso);
    ok('reduced-motion: los contadores muestran su valor final', r.contador === '17', r.contador);
    ok('reduced-motion: el calendario sigue calculando los días (contenido, no movimiento)',
      r.dias.every(d => /^\d+$/.test(d)), r.dias);
    await p.screenshot({ path: path.join(CAPS, 'v-reduced-motion.png') });
    await p.context().close();
  }

  /* ==================================================================
     6 · Sin CDN (GSAP bloqueado)
     ================================================================== */
  {
    const p = await pagina(b);
    await p.route('**cdnjs.cloudflare.com/**', route => route.abort());
    await p.route('**cdn.jsdelivr.net/**', route => route.abort());
    await p.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1800);
    const r = await p.evaluate(() => ({
      hasMotion: document.documentElement.classList.contains('has-motion'),
      cortinaTapando: document.querySelector('[data-cortina]').hidden === false,
      impreso: [...document.querySelectorAll('[data-impreso]')].every(e => e.classList.contains('esta-rellena')),
      contador: document.querySelector('[data-contador="17"]').textContent.trim(),
      titularLegible: document.querySelector('.portada-titulo').innerText.trim().length > 5,
      cuerpoVisible: document.body.getBoundingClientRect().height > 1000
    }));
    ok('sin CDN: no se activa has-motion y la cortina no tapa nada', !r.hasMotion && !r.cortinaTapando, r);
    ok('sin CDN: la página se lee entera (impreso relleno, titular legible, cuerpo con contenido)',
      r.impreso && r.titularLegible && r.cuerpoVisible, r);
    ok('sin CDN: los contadores muestran ya su valor final', r.contador === '17', r.contador);
    await p.screenshot({ path: path.join(CAPS, 'v-sin-cdn.png'), fullPage: true });
    await p.context().close();
  }

  /* ==================================================================
     7 · Responsive, incluido 400 px
     ================================================================== */
  for (const [nombre, w, h] of [['movil-400', 400, 900], ['movil-390', 390, 844], ['tablet-820', 820, 1180]]) {
    const p = await pagina(b, { viewport: { width: w, height: h } });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3400);
    await p.click('.cookie-ack');
    const r = await p.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth
    }));
    ok('responsive ' + nombre + ': sin scroll horizontal', r.scrollW <= r.clientW + 1, r);
    await recorrer(p, 600, 90);
    const tabla = await p.evaluate(() => {
      const env = document.querySelector('[data-tabla-desborda]');
      const desborda = env.scrollWidth > env.clientWidth + 1;
      return { desborda, tabindex: env.getAttribute('tabindex'), role: env.getAttribute('role') };
    });
    ok('responsive ' + nombre + ': la tabla del calendario desborda y es accesible con teclado',
      !tabla.desborda || (tabla.tabindex === '0' && tabla.role === 'group'), tabla);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(CAPS, 'v-' + nombre + '.png') });
    await p.context().close();
  }

  /* ==================================================================
     8 · Datos, línea roja del pliego y cobertura de glifos
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const txt = await p.locator('body').innerText();
    const html = await p.content();
    const debe = [
      'Vilas', 'Bugallo', 'Ordes', 'Rúa Progreso', '15680',
      '981 00 00 84', 'info@vilasybugallo.com',
      'Fiscal', 'Laboral', 'Contable', 'Sociedades',
      '303', '130', '111', '200', '202'
    ];
    const plano = txt.toLowerCase();
    const faltan = debe.filter(d => !plano.includes(d.toLowerCase()));
    ok('datos de muestra presentes en la página', faltan.length === 0, faltan);

    const marcadores = txt.match(/\[PENDIENTE\]|\bTODO\b|lorem ipsum/g) || [];
    ok('sin marcadores sin sustituir ([PENDIENTE], TODO en mayúsculas, lorem ipsum)',
      marcadores.length === 0, marcadores);

    ok('sello de demo en el footer', txt.includes('Sitio de demostración') && txt.includes('negocio ficticio'));
    ok('sello de demo como comentario HTML en index.html', html.includes('Sitio de demostración'));
    ok('meta robots noindex,nofollow', html.includes('name="robots" content="noindex, nofollow"'));

    ok('schema.org sin aggregateRating ni review (línea roja del pliego)',
      !html.includes('aggregateRating') && !/"@type"\s*:\s*"Review"/.test(html));
    ok('teléfono de muestra con el patrón 981 00 00 XX', /981\s?00\s?00\s?84/.test(txt));

    const resenas = await p.evaluate(() => [...document.querySelectorAll('.testimonio cite')].map(c => c.textContent));
    ok('reseñas: solo nombre de pila + inicial, nunca atribuidas a una plataforma',
      resenas.length === 4 && resenas.every(r => /^[A-ZÑ][a-zñáéíóú]+\s[A-ZÑ]\./.test(r.trim())), resenas);

    /* cobertura de glifos: € ñ á é í ó ú en las dos tipografías de marca */
    const glifos = await p.evaluate(() => {
      function cubre(familia) {
        try {
          return {
            euro: document.fonts.check('16px "' + familia + '"', '€'),
            ene: document.fonts.check('16px "' + familia + '"', 'ñ'),
            tildes: document.fonts.check('16px "' + familia + '"', 'áéíóú')
          };
        } catch (e) { return { error: String(e) }; }
      }
      return { manrope: cubre('Manrope'), mono: cubre('JetBrains Mono') };
    });
    ok('Manrope cubre €, ñ y tildes', glifos.manrope.euro && glifos.manrope.ene && glifos.manrope.tildes, glifos.manrope);
    ok('JetBrains Mono cubre €, ñ y tildes', glifos.mono.euro && glifos.mono.ene && glifos.mono.tildes, glifos.mono);

    await p.context().close();
  }

  /* ==================================================================
     9 · Páginas auxiliares (404, legales)
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE + '404.html', { waitUntil: 'networkidle' });
    const t404 = await p.locator('body').innerText();
    ok('404: página propia con el mismo lenguaje visual', t404.includes('404'));
    await p.screenshot({ path: path.join(CAPS, 'v-404.png') });

    await p.goto(BASE + 'aviso-legal.html', { waitUntil: 'networkidle' });
    ok('aviso legal: existe y lleva el sello de demo', (await p.locator('body').innerText()).includes('demostración'));

    await p.goto(BASE + 'privacidad.html', { waitUntil: 'networkidle' });
    ok('privacidad: existe y explica cookies y mapa', (await p.locator('body').innerText()).toLowerCase().includes('cookie'));
    await p.context().close();
  }

  /* ==================================================================
     10 · Control de paleta (demostración, ver README "El control de
     paleta"; se borra entero al entregar la web ya como oficial)
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);

    const inicial = await p.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return {
        visible: document.getElementById('paleta').hidden === false,
        pressed: document.getElementById('paleta-petroleo').getAttribute('aria-pressed'),
        petroleo: cs.getPropertyValue('--petroleo').trim()
      };
    });
    ok('paleta: el mando aparece con JS y arranca en Petróleo',
      inicial.visible && inicial.pressed === 'true' && inicial.petroleo.toLowerCase() === '#3e6e6b', inicial);

    await p.click('#paleta-anil');
    const anil = await p.evaluate(() => ({
      clase: document.documentElement.classList.contains('paleta-anil'),
      pressed: {
        petroleo: document.getElementById('paleta-petroleo').getAttribute('aria-pressed'),
        anil: document.getElementById('paleta-anil').getAttribute('aria-pressed')
      },
      petroleoVar: getComputedStyle(document.documentElement).getPropertyValue('--petroleo').trim(),
      guardado: (() => { try { return localStorage.getItem('casillas-paleta'); } catch (e) { return null; } })()
    }));
    ok('paleta: Añil cambia la variable --petroleo en vivo y marca aria-pressed',
      anil.clase && anil.pressed.anil === 'true' && anil.pressed.petroleo === 'false' &&
      anil.petroleoVar.toLowerCase() === '#2c4a76' && anil.guardado === 'anil', anil);

    await p.click('#paleta-siena');
    const siena = await p.evaluate(() => ({
      clase: document.documentElement.classList.contains('paleta-siena'),
      claseAnilFuera: !document.documentElement.classList.contains('paleta-anil'),
      petroleoVar: getComputedStyle(document.documentElement).getPropertyValue('--petroleo').trim(),
      guardado: (() => { try { return localStorage.getItem('casillas-paleta'); } catch (e) { return null; } })()
    }));
    ok('paleta: Siena releva a Añil (una sola clase de paleta a la vez) y guarda en localStorage',
      siena.clase && siena.claseAnilFuera && siena.petroleoVar.toLowerCase() === '#8a4a28' && siena.guardado === 'siena', siena);

    /* deja terminar la transición de 0.2s del botón antes de capturar, o
       la imagen pilla el fotograma a medio camino entre colores */
    await p.waitForTimeout(300);
    const pulsados = await p.evaluate(() => ({
      petroleo: document.getElementById('paleta-petroleo').getAttribute('aria-pressed'),
      anil: document.getElementById('paleta-anil').getAttribute('aria-pressed'),
      siena: document.getElementById('paleta-siena').getAttribute('aria-pressed')
    }));
    ok('paleta: solo el botón activo (Siena) queda marcado como pulsado',
      pulsados.petroleo === 'false' && pulsados.anil === 'false' && pulsados.siena === 'true', pulsados);
    await p.screenshot({ path: path.join(CAPS, 'v-paleta-siena.png') });

    /* recarga: la paleta guardada se aplica sin parpadeo, antes de que
       corra main.js (el bloqueante del <head> ya la ha puesto) */
    await p.goto(BASE, { waitUntil: 'commit' });
    const sinFlash = await p.evaluate(() => document.documentElement.classList.contains('paleta-siena'));
    ok('paleta: tras recargar, la clase ya está puesta al vuelo (sin esperar a main.js)', sinFlash === true, sinFlash);
    await p.waitForLoadState('networkidle');
    const trasCarga = await p.evaluate(() => ({
      clase: document.documentElement.classList.contains('paleta-siena'),
      pressed: document.getElementById('paleta-siena').getAttribute('aria-pressed')
    }));
    ok('paleta: la paleta guardada persiste tras la carga completa y el botón queda marcado',
      trasCarga.clase && trasCarga.pressed === 'true', trasCarga);

    ok('sin errores de consola tras usar el control de paleta', p.__errores.length === 0, p.__errores);
    await p.context().close();
  }

  /* ==================================================================
     11 · Paleta: el mando no tapa el aviso de cookies, ni al revés
     ================================================================== */
  {
    const p = await pagina(b, { viewport: { width: 390, height: 844 } });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const solape = await p.evaluate(() => {
      const paleta = document.getElementById('paleta').getBoundingClientRect();
      const cookie = document.querySelector('.cookie-banner').getBoundingClientRect();
      const solapaVertical = paleta.top < cookie.bottom && cookie.top < paleta.bottom;
      const solapaHorizontal = paleta.left < cookie.right && cookie.left < paleta.right;
      return { cookieH: getComputedStyle(document.documentElement).getPropertyValue('--cookie-h').trim(), paleta, cookie, solapa: solapaVertical && solapaHorizontal };
    });
    ok('paleta: con el aviso de cookies abierto (móvil), el mando no se solapa con él', solape.solapa === false, solape);
    await p.screenshot({ path: path.join(CAPS, 'v-paleta-vs-cookies.png') });
    await p.context().close();
  }

  await b.close();

  const fallos = res.filter(r => !r.ok);
  fs.writeFileSync(path.join(__dirname, 'verify-report.json'),
    JSON.stringify({ fecha: new Date().toISOString(), base: BASE, total: res.length, fallos: fallos.length, pruebas: res }, null, 1));
  console.log('\n' + (res.length - fallos.length) + '/' + res.length + ' pruebas correctas');
  if (fallos.length) {
    console.log('FALLAN:\n' + fallos.map(f => ' - ' + f.prueba + '  ' + JSON.stringify(f.detalle)).join('\n'));
    process.exit(1);
  }
})();
