"""Shrinks the Brand Book PDF without touching its vector text.
Chrome stores every element with a CSS drop-shadow as a lossless RGB bitmap plus an alpha mask; this re-encodes
those RGB bitmaps as JPEG q88; the gray alpha masks stay lossless but get PNG row prediction (much smaller), so edges stay clean.
Run: python3 brand/book/compress.py in.pdf out.pdf"""
import io, struct, sys
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject, NumberObject, StreamObject

QUALITY, MIN_PIXELS = 88, 40_000


def is_rgb(cs) -> bool:
    cs = cs.get_object() if hasattr(cs, "get_object") else cs
    if cs == "/DeviceRGB":
        return True
    return isinstance(cs, list) and cs[0] == "/ICCBased" and cs[1].get_object().get("/N") == 3


def to_jpeg(obj: StreamObject) -> bool:
    if obj.get("/Subtype") != "/Image" or obj.get("/Filter") != "/FlateDecode" or obj.get("/BitsPerComponent") != 8:
        return False
    w, h = int(obj["/Width"]), int(obj["/Height"])
    if w * h < MIN_PIXELS or not is_rgb(obj.get("/ColorSpace")) or "/DecodeParms" in obj and obj["/DecodeParms"]:
        return False
    raw = obj.get_data()
    if len(raw) != w * h * 3:
        return False
    buf = io.BytesIO()
    Image.frombytes("RGB", (w, h), raw).save(buf, "JPEG", quality=QUALITY, optimize=True)
    if buf.tell() >= len(obj._data):
        return False
    obj._data = buf.getvalue()
    obj[NameObject("/Filter")] = NameObject("/DCTDecode")
    obj[NameObject("/ColorSpace")] = NameObject("/DeviceRGB")
    obj[NameObject("/Length")] = NumberObject(len(obj._data))
    return True


def png_idat(im: Image.Image) -> bytes:
    """zlib stream of PNG-filtered rows: exactly what /FlateDecode with /Predictor 15 expects."""
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True); b = buf.getvalue(); i, out = 8, b""
    while i < len(b):
        n, kind = struct.unpack(">I4s", b[i:i + 8])
        if kind == b"IDAT":
            out += b[i + 8:i + 8 + n]
        i += 12 + n
    return out


def predict_gray(obj: StreamObject) -> bool:
    if obj.get("/Subtype") != "/Image" or obj.get("/Filter") != "/FlateDecode" or obj.get("/ColorSpace") != "/DeviceGray":
        return False
    w, h = int(obj["/Width"]), int(obj["/Height"])
    if w * h < MIN_PIXELS or obj.get("/BitsPerComponent") != 8 or "/DecodeParms" in obj:
        return False
    raw = obj.get_data()
    if len(raw) != w * h:
        return False
    data = png_idat(Image.frombytes("L", (w, h), raw))
    if len(data) >= len(obj._data):
        return False
    obj._data = data
    obj[NameObject("/DecodeParms")] = DictionaryObject({NameObject("/Predictor"): NumberObject(15), NameObject("/Colors"): NumberObject(1),
                                                       NameObject("/BitsPerComponent"): NumberObject(8), NameObject("/Columns"): NumberObject(w)})
    obj[NameObject("/Length")] = NumberObject(len(data))
    return True


def main(src: str, dst: str) -> None:
    w = PdfWriter(clone_from=PdfReader(src))
    streams = [o for o in w._objects if isinstance(o, StreamObject)]
    n = sum(1 for o in streams if to_jpeg(o)) + sum(1 for o in streams if predict_gray(o))
    with open(dst, "wb") as f:
        w.write(f)


if __name__ == "__main__":
    main(*sys.argv[1:3])
