/*
 * Configuración pública de la web comercial de TurnIA.
 *
 * IMPORTANTE:
 * - Este archivo es PÚBLICO (se sirve al navegador). No poner aquí keys, tokens,
 *   access tokens de Mercado Pago, secretos ni credenciales de ningún tipo.
 * - El checkout real debe resolverse con un link de pago / preferencia creada
 *   del lado servidor. Acá solo va la URL pública final a la que se redirige.
 */
window.TURNIA_CONFIG = {
  // Datos comerciales
  whatsappNumber: "5492622699534",           // +54 9 2622 699534 (formato wa.me)
  whatsappDisplay: "+54 9 2622 699534",
  salesEmail: "ventas@turniahealth.com.ar",

  // Plan
  planName: "TurnIA Profesional",
  planPrice: "$39.900",
  planPriceSuffix: "/ mes, impuestos incluidos",
  trialDays: 14,
  monthlyPrice: 39900,
  // Formas de pago (impuestos incluidos). 6 meses: se pagan 5. 12 meses: se pagan 9.
  billing: {
    mensual: { months: 1, total: 39900, per: "/ mes" }
  },
  termsVersion: "2026-10-02",
  privacyVersion: "2026-09-26",

  // Link de ingreso a la aplicación. Se completa cuando se defina
  // app.turniahealth.com.ar (NO se cambia DNS desde este proyecto).
  appLoginUrl: "https://app.turniahealth.com.ar/login",

  // Alta de la prueba gratis (sin tarjeta). Endpoint del backend que recibe los datos
  // del formulario (POST JSON) y envía el email de acceso. Vacío = modo preview.
  // Flujo: datos → alta de prueba → email con acceso → a los 14 días, suscripción con Mercado Pago.
  trialSignupUrl: "https://app.turniahealth.com.ar/api/public/trial-signup",
  commercialRequestUrl: "/api/commercial-request",

  // La suscripción posterior a la prueba se gestiona desde la aplicación.
  mercadoPagoCheckoutUrl: ""
};
