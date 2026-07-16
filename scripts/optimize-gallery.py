"""Build sharp, web-sized gallery derivatives from local photo masters.

The source folders stay ignored by Git. The generated marquee, display, and
full-size JPEGs are committed so the invitation can be deployed as a static
site without publishing the very large camera originals.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageOps


TIERS = {
    "thumb": {"long_edge": 1200, "quality": 84},
    "display": {"long_edge": 1600, "quality": 85},
    "full": {"long_edge": 2400, "quality": 88},
}

DEFAULT_FOLDERS = ("Cuoi1", "Cuoi2", "Cuoi3")


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
    parser.add_argument(
        "--folders",
        nargs="+",
        help="Only regenerate these source folders (for example: Cuoi3)",
    )
    parser.add_argument(
        "--marquee-root",
        type=Path,
        help="Thumbnail destination (defaults to <output_root>/../marquee)",
    )
    args = parser.parse_args()

    if not args.source_root.is_dir():
        raise SystemExit(f"Missing source root: {args.source_root}")

    available_folders = {
        path.name.lower(): path
        for path in args.source_root.iterdir()
        if path.is_dir()
    }
    requested_folders = args.folders or DEFAULT_FOLDERS

    sources: list[tuple[str, Path]] = []
    selected_folders: list[str] = []
    for folder in requested_folders:
        directory = available_folders.get(folder.lower())
        if directory is None:
            if args.folders:
                raise SystemExit(
                    f"Missing source directory: {args.source_root / folder}"
                )
            continue

        selected_folders.append(directory.name)
        sources.extend(
            (directory.name, path)
            for path in sorted(directory.iterdir())
            if path.suffix.lower() in {".jpg", ".jpeg"}
        )

    if not sources:
        raise SystemExit(
            f"No JPEG masters found for: {', '.join(requested_folders)}"
        )

    destinations = {
        "thumb": args.marquee_root or args.output_root.parent / "marquee",
        "display": args.output_root / "display",
        "full": args.output_root / "full",
    }

    # Regenerating one shoot must not remove the optimized assets belonging to
    # the other shoots. This makes adding a new Cuoi* folder safe and repeatable.
    for tier, destination in destinations.items():
        destination.mkdir(parents=True, exist_ok=True)
        for folder in selected_folders:
            for old_file in destination.glob(f"{folder.lower()}_*.jpg"):
                old_file.unlink()

    for folder, source in sources:
        filename = safe_stem(folder, source)
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            icc_profile = opened.info.get("icc_profile")

            for tier, settings in TIERS.items():
                output = destinations[tier] / filename
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

    print(
        f"Generated {len(sources)} photos in {len(TIERS)} quality tiers "
        f"from {', '.join(selected_folders)}"
    )


if __name__ == "__main__":
    main()
