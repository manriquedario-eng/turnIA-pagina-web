(function () {
  "use strict";
  // Indica qué sección de la guía corresponde al dispositivo del visitante.
  var hint = document.querySelector("[data-device-hint]");
  if (!hint) return;
  var ua = navigator.userAgent || "";
  // iPadOS se presenta como Mac: se distingue por la pantalla táctil.
  var isIos = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAndroid = /android/i.test(ua);
  var target = isIos ? "#iphone" : isAndroid ? "#android" : null;
  if (!target) return;
  hint.textContent = "";
  hint.appendChild(document.createTextNode("Parece que estás en " + (isIos ? "iPhone o iPad" : "Android") + ". "));
  var link = document.createElement("a");
  link.href = target;
  link.textContent = "Ir a los pasos para tu teléfono";
  hint.appendChild(link);
  hint.hidden = false;
})();
