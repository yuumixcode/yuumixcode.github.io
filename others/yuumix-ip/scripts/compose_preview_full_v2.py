"""Composite 6 full-body variants into a 3x2 grid with host-rendered numeric badges.
Cells are 2:3 portrait orientation, so the final grid ends up roughly square."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

PREVIEW_DIR = Path("/Users/yuumix/Projects/zensical/yuumixcode.github.io/out/yuumix-ip/preview-full-v2")
OUT_PATH = Path("/Users/yuumix/Projects/zensical/yuumixcode.github.io/out/yuumix-ip/preview-full-v2-3x2.png")

# Cell order: top row v1 v2 v3, bottom row v4 v5 v6
ORDER = ["v1", "v2", "v3", "v4", "v5", "v6"]
NUMBER_POSITIONS = {
    "v1": "top-left",      # 1
    "v2": "top-center",    # 2
    "v3": "top-right",     # 3
    "v4": "bottom-left",   # 4
    "v5": "bottom-center", # 5
    "v6": "bottom-right",  # 6
}

# Load cells, find the common cell size (resize if needed)
cells = []
for vid in ORDER:
    img = Image.open(PREVIEW_DIR / f"{vid}.png").convert("RGBA")
    cells.append(img)

# Normalize: resize all to the same cell size (use the smallest)
cell_w = min(c.width for c in cells)
cell_h = min(c.height for c in cells)
cells = [c.resize((cell_w, cell_h), Image.LANCZOS) for c in cells]

# Padding between cells
pad = 32
bg_color = (252, 245, 230)  # warm cream

# Final canvas
grid_w = cell_w * 3 + pad * 4
grid_h = cell_h * 2 + pad * 3

canvas = Image.new("RGBA", (grid_w, grid_h), bg_color)

# Paste cells
for i, c in enumerate(cells):
    row = i // 3
    col = i % 3
    x = pad + col * (cell_w + pad)
    y = pad + row * (cell_h + pad)
    canvas.paste(c, (x, y), c)

# Draw numeric badges
draw = ImageDraw.Draw(canvas)

# Find a nice font
font = None
font_candidates = [
    "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]
for fc in font_candidates:
    try:
        font = ImageFont.truetype(fc, 110)
        break
    except OSError:
        continue
if font is None:
    font = ImageFont.load_default()

badge_radius = 72
badge_fill = (245, 235, 215, 235)  # warm cream
badge_stroke = (110, 70, 40, 255)  # deep brown
text_color = (110, 70, 40, 255)  # deep brown

for i, vid in enumerate(ORDER):
    row = i // 3
    col = i % 3
    cx = pad + col * (cell_w + pad)
    cy = pad + row * (cell_h + pad)
    pos = NUMBER_POSITIONS[vid]
    n = i + 1

    margin = 40
    if pos == "top-left":
        bx, by = cx + margin + badge_radius, cy + margin + badge_radius
    elif pos == "top-center":
        bx, by = cx + cell_w // 2, cy + margin + badge_radius
    elif pos == "top-right":
        bx, by = cx + cell_w - margin - badge_radius, cy + margin + badge_radius
    elif pos == "bottom-left":
        bx, by = cx + margin + badge_radius, cy + cell_h - margin - badge_radius
    elif pos == "bottom-center":
        bx, by = cx + cell_w // 2, cy + cell_h - margin - badge_radius
    elif pos == "bottom-right":
        bx, by = cx + cell_w - margin - badge_radius, cy + cell_h - margin - badge_radius

    draw.ellipse(
        [bx - badge_radius, by - badge_radius, bx + badge_radius, by + badge_radius],
        fill=badge_fill,
        outline=badge_stroke,
        width=6,
    )

    text = str(n)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = bx - tw // 2 - bbox[0]
    ty = by - th // 2 - bbox[1]
    draw.text((tx, ty), text, fill=text_color, font=font)

final = canvas.convert("RGB")
final.save(OUT_PATH, "PNG", optimize=True)
print(f"Saved: {OUT_PATH}")
print(f"Size: {final.size}, {OUT_PATH.stat().st_size // 1024} KB")
