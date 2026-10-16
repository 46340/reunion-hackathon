"""Image cache for the Brand Book PDF: every picture the boards use, capped at 2400 px on the long side.
Opaque images become JPEG q90, transparent ones stay PNG. render.mjs serves these copies instead of the 3x originals,
so the PDF keeps vector text and sharp pictures at a sane size. Run: python3 brand/book/optimize.py"""
import pathlib, sys
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / "brand/book/out/cache"
DIRS = ["print/out", "brand/book/out/druk/prev", "brand/book/shots", "assets/img", "assets/logos", "print"]
MAX = 2400
n = 0
for d in DIRS:
    for src in (ROOT / d).rglob("*"):
        if src.suffix.lower() not in (".png", ".jpg", ".jpeg") or "cache" in src.parts:
            continue
        if d == "print" and src.parent != ROOT / "print":
            continue
        dst = CACHE / src.relative_to(ROOT)
        if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(src)
        alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        if alpha:
            im = im.convert("RGBA")
            if im.getchannel("A").getextrema()[0] == 255:
                alpha = False
        if max(im.size) > MAX:
            k = MAX / max(im.size)
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        if alpha:
            im.save(dst, "PNG", optimize=True)
        else:
            im.convert("RGB").save(dst, "JPEG", quality=90, optimize=True, progressive=True)
        n += 1
print(f"cached {n} images -> {CACHE}")
