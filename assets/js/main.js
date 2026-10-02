(function () {
  "use strict";
  var C = window.TURNIA_CONFIG || {};

  /* ---------- Links comerciales ---------- */
  var waBase = "https://wa.me/" + (C.whatsappNumber || "");
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    a.href = waBase + "?text=" + encodeURIComponent("Hola, quiero información sobre TurnIA.");
    a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll("[data-sales]").forEach(function (a) {
    a.href = "mailto:" + C.salesEmail + "?subject=" + encodeURIComponent("TurnIA para equipos / instituciones");
  });
  document.querySelectorAll("[data-sales-mail]").forEach(function (a) { a.href = "mailto:" + C.salesEmail; });
  document.querySelectorAll("[data-sales-email]").forEach(function (el) { el.textContent = C.salesEmail; });
  document.querySelectorAll("[data-wa-display]").forEach(function (el) { el.textContent = C.whatsappDisplay; });
  document.querySelectorAll("[data-login]").forEach(function (a) {
    if (C.appLoginUrl) { a.href = C.appLoginUrl; }
    else { a.addEventListener("click", function (e) { e.preventDefault(); }); a.title = "Link de ingreso a configurar"; }
  });
  var y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Header ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var mnav = document.querySelector(".mobile-nav");
  toggle.addEventListener("click", function () {
    var open = mnav.hasAttribute("hidden");
    if (open) mnav.removeAttribute("hidden"); else mnav.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", String(open));
  });
  mnav.addEventListener("click", function (e) { if (e.target.closest("a")) { mnav.setAttribute("hidden", ""); toggle.setAttribute("aria-expanded", "false"); } });

  // Menú activo según sección visible
  var links = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var targets = links.map(function (l) { return document.querySelector(l.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = targets.indexOf(en.target);
        links.forEach(function (l, j) { l.classList.toggle("is-active", j === i); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { if (t) io.observe(t); });
  }

  /* ---------- FAQ: una abierta por columna ---------- */
  document.querySelectorAll(".faq details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      d.parentElement.querySelectorAll("details").forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Forma de pago: mensual / 6 meses / 12 meses ---------- */
  var PLANS = C.billing || {};
  var billing = "mensual";
  var signupRequestId = null;
  function newRequestId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 3 | 8);
      return v.toString(16);
    });
  }
  function money(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }
  function renderBilling() {
    var p = PLANS[billing]; if (!p) return;
    document.querySelectorAll("[data-billing]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.billing === billing)); });
    document.querySelector("[data-price-amount]").textContent = money(p.total);
    document.querySelector("[data-price-per]").textContent = p.per;
    document.querySelector("[data-price-tax]").textContent = p.months > 1
      ? "Equivale a " + money(p.total / p.months) + " por mes · Ahorrás " + money(C.monthlyPrice * p.months - p.total) + " · Impuestos incluidos"
      : "Impuestos incluidos";
    document.querySelector("[data-sum-after]").textContent = "Después " + money(p.total) + " " + p.per + ", impuestos incluidos";
  }
  document.querySelectorAll("[data-billing]").forEach(function (b) {
    b.addEventListener("click", function () { billing = b.dataset.billing; renderBilling(); });
  });
  renderBilling();

  /* ---------- Alta de prueba gratis (14 días, sin tarjeta) ----------
     Los datos solo viven en memoria mientras el modal está abierto.
     No se guardan en localStorage ni cookies. Solo se envían si se configura
     trialSignupUrl en config.js (endpoint propio del backend, nunca con keys en el frontend). */
  var modal = document.getElementById("checkout");
  var form = document.getElementById("co-form");
  var summary = document.getElementById("co-summary");
  var errBox = form.querySelector(".co-error");
  var stepTabs = modal.querySelectorAll(".co-steps span");
  var lastFocus = null;

  function showStep(n) {
    form.hidden = n !== 1; summary.hidden = n !== 2;
    stepTabs[0].classList.toggle("on", n === 1); stepTabs[1].classList.toggle("on", n === 2);
    document.getElementById("co-preview").hidden = true;
    document.getElementById("co-done").hidden = true; document.getElementById("co-pay").hidden = false;
  }
  function openModal() {
    lastFocus = document.activeElement;
    signupRequestId = newRequestId();
    modal.hidden = false; document.body.style.overflow = "hidden"; showStep(1);
    setTimeout(function () { form.querySelector("input").focus(); }, 30);
  }
  function closeModal() {
    modal.hidden = true; document.body.style.overflow = "";
    form.reset(); errBox.hidden = true; // descartar datos
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-checkout]").forEach(function (b) { b.addEventListener("click", openModal); });
  modal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  function validCuit(v) {
    var d = v.replace(/\D/g, "");
    if (d.length !== 11) return false;
    var w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], s = 0;
    for (var i = 0; i < 10; i++) s += +d[i] * w[i];
    var r = 11 - (s % 11); r = r === 11 ? 0 : r === 10 ? 9 : r;
    return r === +d[10];
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements, errors = [];
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    function bad(el, msg) { el.classList.add("invalid"); errors.push(msg); }
    if (!f.nombre.value.trim()) bad(f.nombre, "Ingresá tu nombre.");
    if (!f.apellido.value.trim()) bad(f.apellido, "Ingresá tu apellido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) bad(f.email, "Ingresá un email válido.");
    if (f.password.value.length < 10 || f.password.value.length > 128) bad(f.password, "La contraseña debe tener entre 10 y 128 caracteres.");
    if (f.whatsapp.value.replace(/\D/g, "").length < 8) bad(f.whatsapp, "Ingresá un número de WhatsApp válido.");
    if (!f.profesion.value) bad(f.profesion, "Seleccioná tu profesión.");
    if (f.cuit.value.trim() && !validCuit(f.cuit.value)) bad(f.cuit, "Revisá el CUIT/CUIL (11 dígitos).");
    if (!f.terminos.checked) errors.push("Necesitás aceptar los términos y condiciones.");
    if (errors.length) { errBox.textContent = errors[0]; errBox.hidden = false; return; }
    errBox.hidden = true;
    var who = document.getElementById("co-who");
    who.textContent = f.nombre.value.trim() + " " + f.apellido.value.trim() + " · " + f.email.value.trim() + " · " + f.profesion.value;
    showStep(2);
  });

  document.getElementById("co-back").addEventListener("click", function () { showStep(1); });
  function getTrialSignupUrl() {
    var testMode = new URLSearchParams(window.location.search).get("turnia_test");
    if (testMode === "beta") return "https://beta.turniahealth.com.ar/api/public/trial-signup";
    return C.trialSignupUrl || "";
  }

  document.getElementById("co-pay").addEventListener("click", function () {
    var btn = this, f = form.elements;
    var trialSignupUrl = getTrialSignupUrl();
    if (!trialSignupUrl) { document.getElementById("co-preview").hidden = false; return; }
    btn.disabled = true;
    fetch(trialSignupUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: signupRequestId || newRequestId(),
        nombre: f.nombre.value.trim(), apellido: f.apellido.value.trim(), email: f.email.value.trim(),
        password: f.password.value,
        whatsapp: f.whatsapp.value.trim(), profesion: f.profesion.value, cuit: f.cuit.value.trim(),
        website: f.website ? f.website.value.trim() : "",
        aceptaTerminos: f.terminos.checked,
        facturacion: "mensual",
        termsVersion: C.termsVersion,
        privacyVersion: C.privacyVersion,
        source: "commercial_web",
        utmSource: new URLSearchParams(window.location.search).get("utm_source") || "",
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || "",
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
        referrer: document.referrer || ""
      })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      document.getElementById("co-done").hidden = false; btn.hidden = true;
    }).catch(function () {
      errBox.textContent = "No pudimos crear tu prueba. Probá de nuevo o escribinos por WhatsApp.";
      showStep(1); errBox.hidden = false;
    }).finally(function () { btn.disabled = false; });
  });
})();
