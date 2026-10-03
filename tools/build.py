"""Genera las páginas legales y la versión de un solo archivo (dist/).

Uso:  python3 tools/build.py
- legales/terminos.html y legales/privacidad.html se arman desde legales/_src/.
- dist/ queda con index.html autocontenido + terminos.html + privacidad.html,
  listos para abrir con doble clic (deben quedar juntos en la misma carpeta).
"""
import base64, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = {"terminos": "Términos y condiciones", "privacidad": "Política de privacidad"}

def page(slug, title, body, css_href, asset_prefix, home_href):
    return f'''<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>{title} — TurnIA</title>
<link rel="icon" href="{asset_prefix}assets/img/favicon.png" type="image/png">
{css_href}
</head>
<body>
<header class="legal-header"><div class="container">
  <a href="{home_href}" class="brand brand-official"><img src="{asset_prefix}assets/img/turnia-logo-original.png" alt="TurnIA" class="brand-logo-full"></a>
  <a href="{home_href}" class="legal-back">← Volver al inicio</a>
</div></header>
<main class="container"><article class="legal">
{body}
</article></main>
<footer class="legal-footer"><div class="container">
  <span>© 2026 TurnIA. Todos los derechos reservados.</span>
  <span><a href="terminos.html">Términos y condiciones</a> · <a href="privacidad.html">Política de privacidad</a> · <a href="gestiones.html?tipo=arrepentimiento">Arrepentimiento</a> · <a href="gestiones.html?tipo=baja">Baja del servicio</a></span>
</div></footer>
</body>
</html>
'''

def uri(rel):
    p = ROOT / rel
    mt = {".svg": "image/svg+xml", ".png": "image/png", ".woff": "font/woff"}[p.suffix]
    return f"data:{mt};base64," + base64.b64encode(p.read_bytes()).decode()

def inline_css():
    css = (ROOT / "assets/css/styles.css").read_text()
    return re.sub(r'url\("\.\./(fonts/[^"]+)"\)', lambda m: f'url("{uri("assets/" + m.group(1))}")', css)

def inline_assets(html):
    return re.sub(r'(src|href)="(?:\.\./)?(assets/(?:img|logos)/[^"]+)"', lambda m: f'{m.group(1)}="{uri(m.group(2))}"', html)

# 1) páginas legales del proyecto
for slug, title in PAGES.items():
    body = (ROOT / f"legales/_src/{slug}.html").read_text()
    html = page(slug, title, body, '<link rel="stylesheet" href="../assets/css/styles.css">', "../", "../index.html")
    (ROOT / f"legales/{slug}.html").write_text(html)

# 2) versión de un solo archivo
dist = ROOT / "dist"; dist.mkdir(exist_ok=True)
css = inline_css()
s = (ROOT / "index.html").read_text()
s = re.sub(r'<link rel="preload"[^>]*>\n', "", s)
s = s.replace('<link rel="stylesheet" href="assets/css/styles.css">', f"<style>\n{css}\n</style>")
for js in ("config", "main"):
    s = s.replace(f'<script src="assets/js/{js}.js"></script>', "<script>\n" + (ROOT / f"assets/js/{js}.js").read_text() + "\n</script>")
s = inline_assets(s).replace('href="legales/', 'href="')
assert "assets/" not in s
(dist / "index.html").write_text(s)
for slug, title in PAGES.items():
    body = (ROOT / f"legales/_src/{slug}.html").read_text()
    html = page(slug, title, body, f"<style>\n{css}\n</style>", "", "index.html")
    html = inline_assets(html)
    assert "assets/" not in html
    (dist / f"{slug}.html").write_text(html)
print("OK:", ", ".join(sorted(p.name for p in dist.iterdir())))
