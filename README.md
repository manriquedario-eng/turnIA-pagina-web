# TurnIA — Web comercial

Landing comercial de TurnIA, separada de la aplicación principal.

- Web comercial: https://www.turniahealth.com.ar
- Aplicación: https://app.turniahealth.com.ar
- Repositorio de la app: `manriquedario-eng/turnIA-web`

## Estado actual

Sitio estático HTML + CSS + JavaScript, desplegado en Vercel.

El lanzamiento comercial inicial usa:

- plan único TurnIA Profesional;
- ARS 29.900 por mes, impuestos incluidos;
- 14 días de prueba gratis sin tarjeta;
- alta comercial conectada a `/api/public/trial-signup`;
- confirmación de email antes de activar la prueba;
- suscripción mensual posterior mediante Mercado Pago;
- email de acceso a TurnIA separado del email pagador de Mercado Pago;
- contacto comercial por WhatsApp, email y formulario de ventas;
- gestiones públicas de arrepentimiento y baja con número de solicitud.

## Estructura

```
index.html                         Landing comercial
ventas.html                        Formulario para equipos/instituciones
legales/terminos.html              Términos y condiciones
legales/privacidad.html            Política de privacidad
legales/gestiones.html             Arrepentimiento y baja del servicio
assets/css/styles.css              Estilos
assets/js/config.js                Configuración pública sin secretos
assets/js/main.js                  Interacciones y alta de prueba
assets/js/commercial-requests.js   Ventas y gestiones comerciales
assets/img/turnia-logo-original.png Logo oficial TurnIA
sw.js                              Compatibilidad transitoria con PWA antigua
vercel.json                        Redirects heredados + headers de seguridad
robots.txt / sitemap.xml           SEO técnico básico
```

## Seguridad

`assets/js/config.js` es público. Nunca colocar allí access tokens, API keys, secretos, credenciales de Mercado Pago, Supabase service role ni ninguna otra credencial.

El alta y las gestiones comerciales se procesan server-side en la aplicación TurnIA. La web comercial no contiene secretos ni accede directamente a Supabase o Mercado Pago.

## Reglas comerciales vigentes

- Un único plan mensual.
- Precio final: $29.900/mes, impuestos incluidos.
- 14 días de prueba gratis sin tarjeta.
- Mercado Pago SaaS es un circuito separado de los cobros que cada profesional hace a sus pacientes.
- MisRx figura como integración disponible.
- Digilogix figura como integración disponible; el certificado digital es personal y se gestiona/abona directamente con Digilogix.
- Sin testimonios inventados.
- Las pantallas de la landing son mockups comerciales con datos ficticios.

## Pendientes no bloqueantes

- incorporar video real de demostración;
- reemplazar/optimizar activos gráficos pesados cuando corresponda;
- agregar analítica sólo cuando se defina la política de medición/consentimiento;
- revisar periódicamente textos legales y comerciales.
