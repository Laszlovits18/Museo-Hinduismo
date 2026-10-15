"""Regenera los archivos que permiten abrir el museo con doble clic en Chrome."""

from base64 import b64encode
from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parent
JS = ROOT / "js"

content = {
    path.name: json.loads(path.read_text(encoding="utf-8"))
    for path in sorted((ROOT / "content").glob("*.json"))
}
images = {}
for path in sorted((ROOT / "assets" / "img").glob("*")):
    if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".svg", ".webp"}:
        continue
    mime = "image/svg+xml" if path.suffix.lower() == ".svg" else "image/jpeg"
    if path.suffix.lower() == ".png":
        mime = "image/png"
    if path.suffix.lower() == ".webp":
        mime = "image/webp"
    images[f"assets/img/{path.name}"] = f"data:{mime};base64,{b64encode(path.read_bytes()).decode('ascii')}"

payload = json.dumps({"content": content, "images": images}, ensure_ascii=False, separators=(",", ":"))
(JS / "offline-data.js").write_text(f"window.MUSEO_OFFLINE={payload};\n", encoding="utf-8")

module = (JS / "vendor" / "three.module.js").read_text(encoding="utf-8")
match = re.search(r"export\s*\{([^}]*)\};?\s*$", module)
if not match:
    raise SystemExit("No se encontró la lista de exportaciones de Three.js")
exports = []
for entry in match.group(1).split(","):
    parts = entry.strip().split(" as ")
    if len(parts) == 1:
        exports.append(parts[0])
    elif len(parts) == 2:
        exports.append(f"{parts[1]}:{parts[0]}")
    else:
        raise SystemExit(f"Exportación inesperada: {entry}")
global_script = "(function(){\n" + module[: match.start()] + "\nwindow.THREE={" + ",".join(exports) + "};\n})();\n"
(JS / "vendor" / "three.global.js").write_text(global_script, encoding="utf-8")

print(f"Listo: {len(content)} archivos de contenido y {len(images)} imágenes disponibles sin servidor.")
