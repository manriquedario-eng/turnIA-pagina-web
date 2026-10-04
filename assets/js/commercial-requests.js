(function () {
  "use strict";

  var C = window.TURNIA_CONFIG || {};

  function newRequestId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) {
      var r = Math.random() * 16 | 0;
      var v = ch === "x" ? r : (r & 3 | 8);
      return v.toString(16);
    });
  }

  function endpoint() {
    return C.commercialRequestUrl || "";
  }

  function showResult(form, ok, text) {
    var box = form.querySelector("[data-request-result]");
    if (!box) return;
    box.hidden = false;
    box.classList.toggle("request-result-ok", ok);
    box.classList.toggle("request-result-error", !ok);
    box.textContent = text;
  }

  function payloadFor(form) {
    var data = new FormData(form);
    return {
      requestId: newRequestId(),
      type: form.dataset.requestType,
      email: String(data.get("email") || "").trim(),
      fullName: String(data.get("fullName") || "").trim(),
      cuit: String(data.get("cuit") || "").trim(),
      whatsapp: String(data.get("whatsapp") || "").trim(),
      organization: String(data.get("organization") || "").trim(),
      professionalCount: data.get("professionalCount") ? Number(data.get("professionalCount")) : null,
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || "").trim(),
      source: "commercial_web"
    };
  }

  document.querySelectorAll("[data-request-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = endpoint();
      if (!url) {
        showResult(form, false, "La gestión no está disponible en este momento. Escribinos a ventas@turniahealth.com.ar.");
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      showResult(form, true, "Enviando solicitud…");

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFor(form))
      }).then(function (response) {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      }).then(function (body) {
        var code = body && body.requestCode ? body.requestCode : "";
        var notification = body && body.notification ? body.notification : null;
        var emailWarning = notification && (notification.userEmail === false || notification.internalEmail === false);

        if (emailWarning) {
          showResult(
            form,
            true,
            code
              ? "Solicitud registrada. Tu número de gestión es " + code + ". Hubo un problema con alguna notificación por email; conservá este número y, si necesitás respuesta inmediata, escribinos a ventas@turniahealth.com.ar."
              : "Solicitud registrada. Hubo un problema con alguna notificación por email; si necesitás respuesta inmediata, escribinos a ventas@turniahealth.com.ar."
          );
        } else {
          showResult(
            form,
            true,
            code
              ? "Solicitud registrada. Tu número de gestión es " + code + ". También te enviamos la constancia por email."
              : "Solicitud registrada correctamente."
          );
        }
        form.reset();
      }).catch(function () {
        showResult(form, false, "No pudimos registrar la solicitud. Probá nuevamente o escribinos a ventas@turniahealth.com.ar.");
      }).finally(function () {
        if (button) button.disabled = false;
      });
    });
  });

  var legalForm = document.querySelector('[data-request-form="legal"]');
  if (legalForm) {
    var params = new URLSearchParams(window.location.search);
    var requested = params.get("tipo") === "baja" ? "cancellation" : "withdrawal";
    legalForm.dataset.requestType = requested;
    var title = document.querySelector("[data-legal-title]");
    var intro = document.querySelector("[data-legal-intro]");
    if (requested === "cancellation") {
      if (title) title.textContent = "Solicitar baja del servicio";
      if (intro) intro.textContent = "Podés iniciar la baja de TurnIA sin ingresar a tu cuenta. Registramos la solicitud y te enviamos un número de gestión por email.";
    } else {
      if (title) title.textContent = "Ejercer derecho de arrepentimiento";
      if (intro) intro.textContent = "Podés iniciar tu solicitud de arrepentimiento desde acá. Registramos la solicitud y te enviamos un número de gestión por email.";
    }
  }
})();
