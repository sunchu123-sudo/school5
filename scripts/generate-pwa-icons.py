"""一次性腳本：產生 PWA 圖示 PNG。執行：python scripts/generate-pwa-icons.py"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "icons"
FONT_CANDIDATES = [
    Path("C:/Windows/Fonts/msjhbd.ttc"),
    Path("C:/Windows/Fonts/msjh.ttc"),
    Path("C:/Windows/Fonts/NotoSansTC-Bold.otf"),
]

BG = "#E8F2EA"
GREEN = "#4F7D5A"
GREEN_DARK = "#3D6248"
MOUNTAIN = "#7BA888"
MOUNTAIN_BACK = "#A8C9B0"


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    pad = size * 0.08
    w, h = size, size

    # 背景圓角方塊（maskable 安全區）
    draw.rounded_rectangle(
        (pad, pad, w - pad, h - pad),
        radius=size * 0.18,
        fill=BG,
        outline=GREEN,
        width=max(2, size // 64),
    )

    # 遠山
    back_peak = [
        (w * 0.12, h * 0.62),
        (w * 0.38, h * 0.34),
        (w * 0.58, h * 0.5),
        (w * 0.88, h * 0.62),
    ]
    draw.polygon(back_peak, fill=MOUNTAIN_BACK)

    # 近山
    front_peak = [
        (w * 0.08, h * 0.68),
        (w * 0.32, h * 0.42),
        (w * 0.52, h * 0.56),
        (w * 0.92, h * 0.68),
    ]
    draw.polygon(front_peak, fill=MOUNTAIN)

    # 葉子
    leaf_cx, leaf_cy = w * 0.78, h * 0.28
    leaf_r = size * 0.09
    draw.ellipse(
        (leaf_cx - leaf_r, leaf_cy - leaf_r * 0.6, leaf_cx + leaf_r, leaf_cy + leaf_r * 0.6),
        fill=GREEN,
    )
    draw.line(
        (leaf_cx - leaf_r * 0.2, leaf_cy, leaf_cx + leaf_r * 0.7, leaf_cy),
        fill=GREEN_DARK,
        width=max(2, size // 96),
    )

    # 文字「三棧」
    font_size = int(size * 0.28)
    font = load_font(font_size)
    text = "三棧"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (w - tw) / 2
    ty = h * 0.52 - th / 2
    draw.text((tx, ty), text, fill=GREEN_DARK, font=font)

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for size, name in ((192, "icon-192.png"), (512, "icon-512.png")):
        draw_icon(size).save(OUT_DIR / name, "PNG")
        print(f"Wrote {OUT_DIR / name}")


if __name__ == "__main__":
    main()
