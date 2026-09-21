/* ==========================================================================
   Vilas & Bugallo Asesores · «Casillas» — movimiento y utilidades
   --------------------------------------------------------------------------
   Si GSAP/ScrollTrigger/Lenis no cargan (CDN caído, bloqueador, navegador
   viejo) nada de esto puede tapar la página: los estados "vacíos" del CSS
   viven bajo html.has-motion, que solo se enciende más abajo tras comprobar
   que GSAP y ScrollTrigger existen de verdad. La cortina, en particular,
   arranca oculta (display:none) por CSS y solo se enseña si hay movimiento.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsapListo = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var motion = gsapListo && !reduce;
  var html = document.documentElement;
  if (gsapListo) gsap.registerPlugin(ScrollTrigger);
  if (motion) html.classList.add("has-motion");

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ======================================================================
     0 · Cosas que deben funcionar SIEMPRE, con o sin GSAP, con o sin motion
     ====================================================================== */

  /* --- año del pie -------------------------------------------------------- */
  $$("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* --- aviso de cookies ---------------------------------------------------- */
  (function avisoCookies() {
    var banner = $(".cookie-banner");
    var ok = $(".cookie-ack");
    if (!banner || !ok) return;
    var CLAVE = "vilasybugallo-cookie-ack";
    var visto = false;
    try { visto = localStorage.getItem(CLAVE) === "1"; } catch (e) {}

    /* alto real del aviso en --cookie-h: para que el mando de paleta (si
       está activo) no quede tapado por el aviso mientras está abierto.
       No es solo offsetHeight: se mide la distancia real desde el borde
       inferior de la ventana hasta el borde superior del aviso (que ya
       incluye su propio "bottom: 1rem"), o el mando quedaría un par de
       píxeles corto y rozaría el aviso. Un ResizeObserver, no solo el
       evento resize: el texto del aviso cambia de alto cuando la
       tipografía de Google Fonts termina de cargar, sin que la ventana
       cambie de tamaño, y una sola medida al arrancar se queda corta. */
    function actualizarAltoAviso() {
      if (banner.hidden) { html.style.setProperty("--cookie-h", "0px"); return; }
      var reservado = window.innerHeight - banner.getBoundingClientRect().top;
      html.style.setProperty("--cookie-h", Math.ceil(reservado) + "px");
    }

    if (!visto) banner.hidden = false;
    actualizarAltoAviso();
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(actualizarAltoAviso).observe(banner);
    } else {
      window.addEventListener("resize", actualizarAltoAviso);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(actualizarAltoAviso);
    }

    ok.addEventListener("click", function () {
      banner.hidden = true;
      actualizarAltoAviso();
      try { localStorage.setItem(CLAVE, "1"); } catch (e) {}
    });
  })();

  /* ---------------- El control de paleta ----------------
     NO ES PARTE DEL SITIO. Es un mando para enseñar la misma web en tres
     paletas de color delante del cliente mientras decide. Al entregar la
     web ya como oficial se borra esta función, el bloque .paleta del CSS,
     el <div id="paleta"> y la bandera del <head>. */
  (function initPaleta() {
    var caja = document.getElementById("paleta");
    var botones = {
      petroleo: document.getElementById("paleta-petroleo"),
      anil: document.getElementById("paleta-anil"),
      siena: document.getElementById("paleta-siena")
    };
    if (!caja || !botones.petroleo || !botones.anil || !botones.siena) return;
    var CLAVE_PALETA = "casillas-paleta";

    caja.hidden = false; // sin JS no se enseña: no haría nada

    function pintar(nombre, guardar) {
      html.classList.remove("paleta-anil", "paleta-siena");
      if (nombre !== "petroleo") html.classList.add("paleta-" + nombre);
      Object.keys(botones).forEach(function (k) {
        botones[k].setAttribute("aria-pressed", String(k === nombre));
      });
      if (guardar) { try { localStorage.setItem(CLAVE_PALETA, nombre); } catch (e) {} }
    }

    var actual = html.classList.contains("paleta-anil") ? "anil" : html.classList.contains("paleta-siena") ? "siena" : "petroleo";
    pintar(actual, false);
    botones.petroleo.addEventListener("click", function () { pintar("petroleo", true); });
    botones.anil.addEventListener("click", function () { pintar("anil", true); });
    botones.siena.addEventListener("click", function () { pintar("siena", true); });
  })();

  /* --- menú móvil ----------------------------------------------------------- */
  var toggle = $(".nav-toggle");
  var navMovil = $(".nav-movil");
  function cerrarMenu() {
    if (!toggle || !navMovil) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    navMovil.hidden = true;
  }
  if (toggle && navMovil) {
    toggle.addEventListener("click", function () {
      var abierto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", abierto ? "false" : "true");
      toggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      navMovil.hidden = abierto;
    });
    $$("a", navMovil).forEach(function (a) { a.addEventListener("click", cerrarMenu); });
  }

  /* --- mapa solo al pedirlo (sin cookies de terceros hasta el clic) -------- */
  (function mapaBajoDemanda() {
    var btn = $(".map-consent");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var q = encodeURIComponent("Vilas y Bugallo Asesores, Rúa Progreso 22, 15680 Ordes, A Coruña");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + q + "&output=embed";
      iframe.title = "Mapa: Vilas & Bugallo Asesores, Rúa Progreso 22, Ordes";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      btn.parentElement.replaceWith(iframe);
    });
  })();

  /* --- sombra de la cabecera al hacer scroll -------------------------------- */
  var cabecera = $(".cabecera");
  function alHacerScroll() {
    if (cabecera) cabecera.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  alHacerScroll();

  /* --- estrellas de la valoración ------------------------------------------- */
  (function estrellas() {
    var D = "M12 2.4l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.5 6.1 20.6l1.2-6.6L2.4 9.4l6.7-.9z";
    $$("[data-estrellas]").forEach(function (caja) {
      var nota = parseFloat(caja.dataset.estrellas) || 0;
      var out = "";
      for (var i = 0; i < 5; i++) {
        var p = Math.max(0, Math.min(1, nota - i));
        out += '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path class="fondo" d="' + D + '"/>' +
          (p > 0 ? '<path class="relleno" d="' + D + '" style="clip-path:inset(0 ' +
            ((1 - p) * 100).toFixed(0) + '% 0 0)"/>' : "") + "</svg>";
      }
      caja.innerHTML = out;
    });
  })();

  /* --- calendario fiscal: "próxima" y "días" con la fecha real del sistema -
     Esto es CONTENIDO, no movimiento: tiene que calcularse siempre, también
     sin GSAP y con motion reducido. */
  (function calendarioFiscal() {
    var filas = $$("[data-calendario] tbody tr");
    if (!filas.length) return;
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    var datos = filas.map(function (tr) {
      var mes = parseInt(tr.dataset.mes, 10) - 1; // Date usa 0-11
      var dia = parseInt(tr.dataset.dia, 10);
      var candidata = new Date(hoy.getFullYear(), mes, dia);
      if (candidata < hoy) candidata = new Date(hoy.getFullYear() + 1, mes, dia);
      var dias = Math.round((candidata - hoy) / 86400000);
      return { tr: tr, dias: dias };
    });

    var minDias = Math.min.apply(null, datos.map(function (d) { return d.dias; }));

    datos.forEach(function (d) {
      var celda = $("[data-dias]", d.tr);
      if (celda) celda.textContent = d.dias;
      if (d.dias === minDias) {
        d.tr.classList.add("fila-proxima");
        var mesCelda = $(".calendario-mes", d.tr);
        if (mesCelda && !$(".chip-proxima", mesCelda)) {
          var chip = document.createElement("span");
          chip.className = "chip-proxima";
          chip.textContent = "Próxima";
          mesCelda.appendChild(chip);
        }
      }
    });
  })();

  /* --- casillas que se marcan al entrar en pantalla: CSS + IntersectionObserver,
     funciona sin GSAP y sin motion (es una transición CSS corta, no una
     coreografía; si el usuario pide menos movimiento, la transición ya la
     recorta la media query del final del CSS). -------------------------- */
  (function casillasQueSeMarcan() {
    var nodos = $$("[data-reveal-casilla]");
    if (!nodos.length) return;
    if (!("IntersectionObserver" in window)) {
      nodos.forEach(function (n) { n.classList.add("esta-rellena"); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada, i) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        var demora = el.hasAttribute("data-reveal-casilla-demora")
          ? parseInt(el.dataset.revealCasillaDemora, 10) : (i % 4) * 90;
        setTimeout(function () { el.classList.add("esta-rellena"); }, demora);
        obs.unobserve(el);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    nodos.forEach(function (n) { obs.observe(n); });
  })();

  /* --- el impreso de la portada: casillas que se marcan solas ------------- */
  var impresoListo = false;
  function rellenarImpreso(animado) {
    if (impresoListo) return;
    impresoListo = true;
    var casillas = $$("[data-impreso]");
    casillas.forEach(function (c, i) {
      var pintar = function () { c.classList.add("esta-rellena"); };
      if (animado) setTimeout(pintar, 260 + i * 160);
      else pintar();
    });
  }

  /* ======================================================================
     Cortina de entrada
     ----------------------------------------------------------------------
     Gesto propio de «Casillas»: una rejilla de casillas vacías se marca de
     golpe, en oleada, y en cuanto termina el bloque entero se retira con un
     barrido — como quien completa un impreso y lo aparta de la mesa.
     Arranca oculta por CSS ([data-cortina]{display:none}); solo si hay
     movimiento real se le añade html.cortina-puesta para enseñarla, y esa
     misma función es la que garantiza su retirada.
     ====================================================================== */
  var lenis = null;
  var cortina = (function initCortina() {
    var el = $("[data-cortina]");
    var espera = [];
    var abierta = false;
    var fuera = false;

    function abrir() {
      if (abierta) return;
      abierta = true;
      espera.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} });
    }
    function retirar() {
      abrir();
      if (fuera) return;
      fuera = true;
      if (el) { el.hidden = true; }
      html.classList.remove("cortina-puesta");
      if (lenis) lenis.start();
      if (gsapListo) ScrollTrigger.refresh();
    }

    var api = { alAbrirse: function (fn) { return abierta ? fn() : espera.push(fn); } };
    if (!el || !motion) { retirar(); return api; }

    el.hidden = false;
    html.classList.add("cortina-puesta");
    if (lenis) lenis.stop();

    /* rejilla de casillas: se genera aquí, no en el HTML, para no duplicar
       36 nodos idénticos a mano */
    var rejilla = $(".cortina-rejilla", el);
    var N = 32;
    var casillasHTML = "";
    for (var i = 0; i < N; i++) {
      casillasHTML += '<div class="cortina-casilla"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5L20 6"/></svg></div>';
    }
    rejilla.innerHTML = casillasHTML;
    var casillas = $$(".cortina-casilla path", rejilla);
    var nombre = $(".cortina-marca-nombre", el);
    var sub = $(".cortina-marca-sub", el);
    var barrido = $(".cortina-barrido", el);

    var tl = gsap.timeline({ onComplete: retirar });
    /* oleada de casillas marcándose, en diagonal por filas de 8 */
    tl.to(casillas, {
      strokeDashoffset: 0,
      duration: 0.45,
      ease: "power2.out",
      stagger: { each: 0.022, from: "start" }
    }, 0.1);
    tl.to([nombre, sub], { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08 }, 0.55);
    tl.add(abrir, 1.55);
    tl.to(barrido, { scaleX: 1, duration: 0.6, ease: "expo.inOut", transformOrigin: "left" }, 1.55);
    tl.set(barrido, { transformOrigin: "right" });
    tl.to(barrido, { scaleX: 0, duration: 0.55, ease: "expo.inOut" }, 1.98);

    setTimeout(retirar, 5200);
    return api;
  })();

  /* ======================================================================
     Si no hay movimiento: valores finales y contenido visible, se acabó
     ====================================================================== */
  if (!motion) {
    rellenarImpreso(false);
    $$("[data-contador]").forEach(function (el) { el.textContent = el.dataset.contador; });
    $$("[data-contador-dec]").forEach(function (el) {
      el.textContent = String(el.dataset.contadorDec).replace(".", ",");
    });
    return;
  }

  /* ======================================================================
     A partir de aquí, solo si hay GSAP + ScrollTrigger y no hay
     prefers-reduced-motion
     ====================================================================== */

  /* --- Lenis: motor único de scroll ---------------------------------------- */
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // se arranca al retirar la cortina
  }

  /* --- anclas: desplazamiento suave y cierre del menú --------------------- */
  var navH = function () { return parseFloat(getComputedStyle(html).getPropertyValue("--nav-h")) * 16 || 72; };
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      var off = -navH();
      if (lenis) lenis.scrollTo(destino, { offset: off, duration: 1.3 });
      else window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY + off, behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* --- rellenar el impreso de la portada, en cuanto se abre la cortina ---- */
  cortina.alAbrirse(function () { rellenarImpreso(true); });

  /* --- char-reveal: titulares letra a letra -------------------------------- */
  function partirCaracteres(el) {
    var texto = el.textContent.trim();
    el.setAttribute("aria-label", texto);
    el.innerHTML = "";
    var palabras = texto.split(/\s+/);
    var chars = [];
    palabras.forEach(function (palabra, i) {
      var w = document.createElement("span");
      w.className = "split-word";
      w.setAttribute("aria-hidden", "true");
      Array.from(palabra).forEach(function (ch) {
        var c = document.createElement("span");
        c.className = "split-char";
        c.textContent = ch;
        w.appendChild(c);
        chars.push(c);
      });
      el.appendChild(w);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return chars;
  }

  $$("[data-char]").forEach(function (h, idx) {
    var chars = partirCaracteres(h);
    var tl = gsap.timeline({ paused: true });
    /* el estado "vacío" viene del CSS en translate3d(0,115%,0): hay que fijar
       y:0 explícito además de yPercent, o GSAP lee ese traslado como px y las
       letras se quedan clavadas abajo */
    tl.to(chars, {
      y: 0, yPercent: 0, opacity: 1, duration: 0.85, ease: "power3.out",
      stagger: { each: 0.018, from: "start" }
    });
    gsap.set(chars, { opacity: 0 });

    if (idx === 0 && h.closest("#portada")) {
      /* el titular del hero espera a que la cortina se retire */
      cortina.alAbrirse(function () { tl.play(); });
    } else {
      /* el resto revela una sola vez al entrar en pantalla: con
         ScrollTrigger + once:true, si el bloque ya está a la vista cuando se
         crea, nunca dispara — aquí se usa IntersectionObserver, que sí
         evalúa el estado inicial */
      var jugada = false;
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting && !jugada) { jugada = true; tl.play(); obs.disconnect(); }
        });
      }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });
      obs.observe(h);
    }
  });

  /* --- entradas genéricas [data-reveal] ------------------------------------ */
  $$("[data-reveal]").forEach(function (el) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { el.classList.add("revelado"); obs.unobserve(el); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    obs.observe(el);
  });

  /* --- contadores tabulares -------------------------------------------------- */
  $$("[data-contador]").forEach(function (el) {
    var fin = parseInt(el.dataset.contador, 10) || 0;
    var obj = { v: 0 };
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        gsap.to(obj, {
          v: fin, duration: 1.5, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(obj.v); }
        });
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });
  $$("[data-contador-dec]").forEach(function (el) {
    var fin = parseFloat(el.dataset.contadorDec) || 0;
    var obj = { v: 0 };
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        gsap.to(obj, {
          v: fin, duration: 1.7, ease: "power2.out",
          onUpdate: function () { el.textContent = obj.v.toFixed(1).replace(".", ","); }
        });
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* --- botones magnéticos (solo con ratón preciso) -------------------------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$("[data-magnetic]").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.55, ease: "power3" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.55, ease: "power3" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* --- barra de progreso lateral: el margen del formulario ------------------ */
  (function margenProgreso() {
    var relleno = $("[data-progreso]");
    if (!relleno) return;
    function actualizar() {
      var doc = document.documentElement;
      var total = doc.scrollHeight - doc.clientHeight;
      var pct = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      relleno.style.height = (pct * 100).toFixed(2) + "%";
    }
    if (lenis) lenis.on("scroll", actualizar);
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    actualizar();
  })();

  /* --- enlace activo en la navegación ---------------------------------------- */
  $$(".nav a").forEach(function (a) {
    var destino = document.querySelector(a.getAttribute("href"));
    if (!destino) return;
    ScrollTrigger.create({
      trigger: destino, start: "top 50%", end: "bottom 50%",
      onToggle: function (self) { a.classList.toggle("is-active", self.isActive); }
    });
  });

  /* las fuentes y las imágenes cambian alturas: recalcular */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
