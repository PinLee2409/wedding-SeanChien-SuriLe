"""Build sharp, web-sized gallery derivatives from local photo masters.

The source folders stay ignored by Git. The generated display and full-size
JPEGs are committed so the invitation can be deployed as a static site.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageOps


TIERS = {
    "display": {"long_edge": 1600, "quality": 85},
    "full": {"long_edge": 2400, "quality": 88},
}


def safe_stem(folder: str, source: Path) -> str:
    stem = re.sub(r"[^a-z0-9-]+", "_", source.stem.lower()).strip("_")
    return f"{folder.lower()}_{stem}.jpg"


def resized(image: Image.Image, long_edge: int) -> Image.Image:
    scale = min(1.0, long_edge / max(image.size))
    size = tuple(max(1, round(value * scale)) for value in image.size)
    if size == image.size:
        return image.copy()
    return image.resize(size, Image.Resampling.LANCZOS, reducing_gap=3.0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_root", type=Path)
    parser.add_argument("output_root", type=Path)
    args = parser.parse_args()

    sources: list[tuple[str, Path]] = []
    for folder in ("Cuoi1", "Cuoi2"):
        directory = args.source_root / folder
        if not directory.is_dir():
            raise SystemExit(f"Missing source directory: {directory}")
        sources.extend(
            (folder, path)
            for path in sorted(directory.iterdir())
            if path.suffix.lower() in {".jpg", ".jpeg"}
        )

    for tier in TIERS:
        destination = args.output_root / tier
        destination.mkdir(parents=True, exist_ok=True)
        for old_file in destination.glob("*.jpg"):
            old_file.unlink()

    for folder, source in sources:
        filename = safe_stem(folder, source)
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            icc_profile = opened.info.get("icc_profile")

            for tier, settings in TIERS.items():
                output = args.output_root / tier / filename
                derivative = resized(image, settings["long_edge"])
                derivative.save(
                    output,
                    "JPEG",
                    quality=settings["quality"],
                    optimize=True,
                    progressive=True,
                    subsampling="4:2:0",
                    icc_profile=icc_profile,
                )
                derivative.close()

    print(f"Generated {len(sources)} photos in {len(TIERS)} quality tiers")


if __name__ == "__main__":
    main()
