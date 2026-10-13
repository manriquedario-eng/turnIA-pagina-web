/*
 * Píxel de Meta (medición de anuncios) con consentimiento.
 *
 * - El píxel se carga SOLO si el visitante acepta las cookies de medición.
 * - El ID del píxel es público (no es un secreto). El token de la API de
 *   conversiones NUNCA va acá: vive solo en el servidor de la app.
 * - Eventos: PageView (todas las páginas), Contact (clic en WhatsApp),
 *   Lead (formulario de ventas) y CompleteRegistration (alta de la prueba).
 *   Lead y CompleteRegistration llevan el mismo event_id que manda el
 *   servidor, para que Meta no los cuente dos veces.
 */
(function () {
  var PIXEL_ID = "1078448068354528"; // Identificador del píxel (Administrador de eventos de Meta).
  var KEY = "turnia_cookie_consent"; // "granted" | "denied"
  var loaded = false;

  function readConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ }
  }

  function loadPixel() {
    if (loaded || !PIXEL_ID) return;
    loaded = true;
    /* Código base oficial de Meta, sin script inline (la web lo bloquea por seguridad). */
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  /** ¿El visitante aceptó la medición? Lo usa el alta para avisarle al servidor. */
  window.turniaMetaConsent = function () { return readConsent() === "granted"; };

  /** Registra un evento estándar si el píxel está activo. */
  window.turniaTrack = function (eventName, params, eventId) {
    if (!loaded || typeof window.fbq !== "function") return;
    window.fbq("track", eventName, params || {}, eventId ? { eventID: eventId } : undefined);
  };

  function privacyHref() {
    var inLegal = /\/legales\//.test(window.location.pathname);
    return (inLegal ? "" : "legales/") + "privacidad.html#p10";
  }

  function showBanner() {
    if (document.getElementById("cookie-banner")) return;
    var bar = document.createElement("div");
    bar.id = "cookie-banner";
    bar.className = "cookie-banner";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Preferencias de cookies");
    bar.innerHTML =
      '<p>Usamos cookies de medición de Meta para saber qué anuncios funcionan. Podés aceptarlas o rechazarlas; la web funciona igual. ' +
      '<a href="' + privacyHref() + '">Más información</a></p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-outline" data-cookie="denied">Rechazar</button>' +
      '<button type="button" class="btn btn-primary" data-cookie="granted">Aceptar</button>' +
      "</div>";
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cookie]");
      if (!btn) return;
      saveConsent(btn.getAttribute("data-cookie"));
      bar.remove();
      if (btn.getAttribute("data-cookie") === "granted") loadPixel();
    });
    document.body.appendChild(bar);
  }

  function init() {
    // Sin ID del píxel no se mide nada ni se muestra el aviso.
    if (!PIXEL_ID) return;
    var consent = readConsent();
    if (consent === "granted") loadPixel();
    else if (consent !== "denied") showBanner();

    // "Configurar cookies" (por ejemplo, en la política de privacidad).
    document.querySelectorAll("[data-cookie-settings]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        try { localStorage.removeItem(KEY); } catch (err) { /* nada */ }
        showBanner();
      });
    });

    // Clic en cualquier enlace de WhatsApp = contacto.
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href*="wa.me/"], a[data-whatsapp]');
      if (a) window.turniaTrack("Contact", { content_name: "WhatsApp" });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
