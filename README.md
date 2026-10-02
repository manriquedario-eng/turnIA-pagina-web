# TurnIA — Web comercial (proyecto independiente)

Landing comercial de TurnIA, **separada de la aplicación**. No comparte código, repositorio, variables de entorno, Supabase ni integraciones con `manriquedario-eng/turnIA-web`.

Destino futuro: `www.turniahealth.com.ar` (la app quedará en `app.turniahealth.com.ar`). **Este proyecto no toca DNS, Cloudflare ni producción.**

## Stack
Sitio estático: HTML + CSS + JavaScript, sin dependencias ni build. Se puede servir desde cualquier hosting estático (Cloudflare Pages, Vercel, Netlify, S3) cuando se decida.

```
index.html              Home (11 secciones, replica del mockup aprobado)
assets/css/styles.css   Estilos (tokens en :root, responsive 1440 / 1024 / 760 / 420)
assets/js/config.js     Datos comerciales y links. PÚBLICO: nunca poner keys ni tokens
assets/js/main.js       Menú, FAQ, checkout preparado (sin cobro)
assets/fonts/           Poppins + Lora Italic (self-hosted, licencia OFL)
assets/logos/           Logos de terceros (WhatsApp, Google Calendar, Google Meet, OpenAI, Mercado Pago, Visa, Mastercard, Amex)
legales/                Términos y Privacidad (se generan desde legales/_src/ con tools/build.py)
tools/build.py          Genera las páginas legales y dist/ (versión de un solo archivo)
```

## Correr localmente
```bash
cd turnia-comercial
python3 -m http.server 4321
# abrir http://localhost:4321
```
(o `npx serve .`)

## Pendientes antes de publicar
0. **Logo TurnIA**: `assets/img/turnia-logo-original.png` es el original (1920px, fondo transparente). Las versiones usadas en la web son `turnia-isotipo.png` (512), `turnia-isotipo-192.png` y `favicon.png`.
1. **Logo de ARCA**: `assets/logos/arca.png` sale de una captura provista por TurnIA. Si se consigue el archivo oficial en vector, reemplazarlo con el mismo nombre.
2. **Prueba gratis (14 días, sin tarjeta)**: completar `trialSignupUrl` en `assets/js/config.js` con el endpoint del backend que da de alta la prueba y envía el email de acceso (recibe un POST JSON con los datos del formulario). Hoy el botón muestra un aviso de modo preview. El link de suscripción de Mercado Pago (`mercadoPagoCheckoutUrl`) se usará al terminar la prueba.
   Flujo previsto: datos → Mercado Pago → pago aprobado → email automático → activación TurnIA.
   Recomendación: crear la preferencia de pago del lado servidor (el access token de MP nunca va en el frontend) y pasar los datos del formulario como `external_reference`/metadata.
3. **Link "Ingresar"**: completar `appLoginUrl` en `config.js` cuando exista `app.turniahealth.com.ar`.
4. **Textos legales**: titular, domicilio, jurisdicción y plazos ya cargados en `legales/_src/`. Hacerlos revisar por un abogado antes de publicar (incluido botón de arrepentimiento y enlace a Defensa del Consumidor). Después de editar, correr `python3 tools/build.py`.
5. Redes sociales: no se agregaron porque no hay cuentas confirmadas.

## Datos y privacidad del checkout
El formulario valida en el navegador y solo mantiene los datos en memoria mientras el modal está abierto. No usa localStorage, cookies ni envía nada a ningún servidor.

## Reglas de contenido respetadas
- Sin la frase "No es una agenda", sin testimonios, sin "Próximamente" en firma digital.
- Sin funciones inventadas; sin reembolsos automáticos (la FAQ aclara que cancelaciones/ausencias no generan devolución automática).
- Precio: $29.900 / mes, impuestos incluidos. 6 meses: $149.500 (1 mes gratis). 12 meses: $269.100 (3 meses gratis). Valores en `config.js` (`billing`). 14 días de prueba gratis sin tarjeta. Sin mención de límites de WhatsApp. Certificado de Digilogix a cargo del profesional. Cancelación "según condiciones comerciales".
- Pantallas de notebook, tablet y celular son mockups de marketing con datos ficticios, no capturas reales.
