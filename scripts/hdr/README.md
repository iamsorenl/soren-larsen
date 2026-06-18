# HDR image encoder

Build-time tool. Converts SDR JPEGs into Rec2020/PQ AVIF whose bright,
low-saturation highlights glow on HDR displays. Not part of the app bundle.

## Usage
    python3 -m scripts.hdr.cli src/images/Headshot1.jpg

Outputs `src/images/Headshot1.hdr.avif`.

## Requirements
    pip3 install -r scripts/hdr/requirements.txt
    brew install libavif   # provides avifenc

## How it works
1. Decode + linearize sRGB.
2. Convert Rec709 primaries -> Rec2020.
3. Boost bright low-saturation pixels toward ~1000 nits; keep colored
   pixels pinned at the 203-nit SDR reference.
4. PQ-encode (SMPTE ST 2084) to a 16-bit PNG.
5. `avifenc --cicp 9/16/9 --range full --depth 10` tags it as Rec2020/PQ.
