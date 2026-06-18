import shutil
import subprocess
import pytest
from PIL import Image
from scripts.hdr.cli import convert, default_out_path


def test_default_out_path():
    assert default_out_path("a/b/Headshot1.jpg") == "a/b/Headshot1.hdr.avif"
    assert default_out_path("x/Surf.JPG") == "x/Surf.hdr.avif"


@pytest.mark.skipif(shutil.which("avifenc") is None, reason="avifenc not installed")
def test_convert_produces_pq_avif(tmp_path):
    src = tmp_path / "white.jpg"
    Image.new("RGB", (8, 8), (255, 255, 255)).save(src)
    out = convert(str(src))
    assert out.endswith(".hdr.avif")
    # Confirm the CICP transfer is PQ (16) via avifdec --info.
    info = subprocess.run(
        ["avifdec", "--info", out], capture_output=True, text=True
    ).stdout
    # avifdec --info prints "Transfer Characteristics: 16" for PQ.
    assert "16" in info
