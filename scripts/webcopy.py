"""Make a web copy of an image: EXIF-rotated, <=1600px long edge, JPEG q80, no metadata."""
import sys
from PIL import Image, ImageOps
src, dst = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
im.thumbnail((1600, 1600))
im.save(dst, 'JPEG', quality=80, optimize=True, progressive=True)
print(dst, im.size)
