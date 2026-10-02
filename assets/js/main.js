(() => {
  const cfg = window.TURNIA_COMMERCIAL_CONFIG || {};

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  document.querySelectorAll("[data-app-login]").forEach((el) => {
    el.href = cfg.appLoginUrl || "#";
  });

  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.href = cfg.whatsappUrl || "#";
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  const form = document.querySelector("#trial-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";

    const data = new FormData(form);
    const payload = {
      requestId: crypto.randomUUID(),
      firstName: String(data.get("firstName") || "").trim(),
      lastName: String(data.get("lastName") || "").trim(),
      email: String(data.get("email") || "").trim().toLowerCase(),
      whatsapp: String(data.get("whatsapp") || "").trim(),
      profession: String(data.get("profession") || "").trim(),
      cuit: String(data.get("cuit") || "").replace(/\D/g, "") || null,
      billingInterval: "monthly",
      acceptedTerms: data.get("terms") === "on",
      termsVersion: cfg.legal?.termsVersion || "draft",
      privacyVersion: cfg.legal?.privacyVersion || "draft",
      source: "commercial_web"
    };

    if (!payload.acceptedTerms) {
      status.textContent = "Necesitás aceptar los términos para continuar.";
      return;
    }

    if (!cfg.trialSignupUrl) {
      status.textContent = "Preview listo: el alta comercial real todavía está desactivada.";
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Creando prueba…";

    try {
      const response = await fetch(cfg.trialSignupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "No pudimos iniciar la prueba.");

      form.reset();
      status.textContent = body.message || "Revisá tu email para confirmar la cuenta.";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "No pudimos iniciar la prueba.";
    } finally {
      button.disabled = false;
      button.textContent = "Empezar mi prueba gratis";
    }
  });
})();
