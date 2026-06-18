"""CLI: convert SDR JPEGs to Rec2020/PQ AVIF that glows on HDR displays."""
import os
import subprocess
import sys
import tempfile

from scripts.hdr.encode import encode_pq_png


def default_out_path(src_jpg):
    root, _ = os.path.splitext(src_jpg)
    return root + ".hdr.avif"


def to_avif(png_path, avif_path):
    cmd = [
        "avifenc", "--cicp", "9/16/9", "--range", "full",
        "--depth", "10", "-y", "444", png_path, avif_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"avifenc failed:\n{result.stderr}")
    return avif_path


def convert(src_jpg, out_avif=None):
    out_avif = out_avif or default_out_path(src_jpg)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        png_path = tmp.name
    try:
        encode_pq_png(src_jpg, png_path)
        to_avif(png_path, out_avif)
    finally:
        os.unlink(png_path)
    return out_avif


def main(argv):
    if not argv:
        print("usage: python3 -m scripts.hdr.cli <img.jpg> [<img.jpg> ...]")
        return 1
    for src in argv:
        out = convert(src)
        print(f"{src} -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
