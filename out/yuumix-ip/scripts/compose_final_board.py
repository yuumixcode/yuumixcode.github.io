"""Compose the final 4x3 delivery board: 1:1 formal avatar (left) + 3x3 expression board (right) with Chinese captions."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

FINAL_DIR = Path("/Users/yuumix/Projects/zensical/yuumixcode.github.io/out/yuumix-ip/final")
EXPR_DIR = FINAL_DIR / "expressions"
OUT_PATH = FINAL_DIR / "final-4x3-board.png"

# 9 expressions in reading order
EXPRESSIONS = [
    ("1-happy.png",     "开心"),
    ("2-laugh.png",     "大笑"),
    ("3-angry.png",     "生气"),
    ("4-wronged.png",   "委屈"),
    ("5-surprised.png", "惊讶"),
    ("6-confused.png",  "困惑"),
    ("7-proud.png",     "得意"),
    ("8-tired.png",     "疲惫"),
    ("9-love.png",      "喜爱"),
]

# Avatar on left
AVATAR_PATH = FINAL_DIR / "avatar.png"
AVATAR_CAPTION = "正式头像"

# Style
PAD = 28  # cell padding
CAPTION_H = 130  # caption strip height per cell
CELL_W = 1000
CELL_H = 1000
TOTAL_CELL_H = CELL_H + CAPTION_H

BG = (252, 245, 230)  # warm cream
TEXT_COLOR = (110, 70, 40, 255)  # deep brown
STROKE = (180, 140, 100, 255)  # lighter brown

# Find font
font = None
for fc in [
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
]:
    try:
        font = ImageFont.truetype(fc, 78)
        break
    except OSError:
        continue
if font is None:
    font = ImageFont.load_default()

# ----- 3x3 expression board (used inside the 4x3) -----
expr_imgs = [Image.open(EXPR_DIR / fn).convert("RGBA") for fn, _ in EXPRESSIONS]
# Normalize to CELL_W x CELL_H
expr_imgs = [img.resize((CELL_W, CELL_H), Image.LANCZOS) for img in expr_imgs]

expr_board_w = CELL_W * 3 + PAD * 4
expr_board_h = TOTAL_CELL_H * 3 + PAD * 4
expr_board = Image.new("RGBA", (expr_board_w, expr_board_h), BG)

draw_expr = ImageDraw.Draw(expr_board)
for i, (img, (_, cap)) in enumerate(zip(expr_imgs, EXPRESSIONS)):
    row, col = divmod(i, 3)
    x = PAD + col * (CELL_W + PAD)
    y = PAD + row * (TOTAL_CELL_H + PAD)
    expr_board.paste(img, (x, y), img)
    # Caption centered below the image
    bbox = draw_expr.textbbox((0, 0), cap, font=font)
    tw = bbox[2] - bbox[0]
    tx = x + (CELL_W - tw) // 2 - bbox[0]
    ty = y + CELL_H + (CAPTION_H - (bbox[3] - bbox[1])) // 2 - bbox[1]
    draw_expr.text((tx, ty), cap, fill=TEXT_COLOR, font=font)

expr_board_rgb = expr_board.convert("RGB")

# Save 3x3 separately too (optional)
expr_board_rgb.save(FINAL_DIR / "expression-board-3x3.png", "PNG", optimize=True)
print(f"Saved 3x3 expression board: {(expr_board_w, expr_board_h)}")

# ----- 4x3 final board: avatar (left) + 3x3 expression board (right) -----
# Avatar cell matches the height of the 3x3 expression board
avatar_img = Image.open(AVATAR_PATH).convert("RGBA")
# Avatar cell: width CELL_W, height = expr_board_h (same as the right side)
avatar_cell = Image.new("RGBA", (CELL_W, expr_board_h), BG)
avatar_resized = avatar_img.resize((CELL_W, CELL_W), Image.LANCZOS)
avatar_cell.paste(avatar_resized, (0, 0), avatar_resized)

draw_a = ImageDraw.Draw(avatar_cell)
# Caption under avatar
bbox = draw_a.textbbox((0, 0), AVATAR_CAPTION, font=font)
tw = bbox[2] - bbox[0]
tx = (CELL_W - tw) // 2 - bbox[0]
ty = CELL_W + (expr_board_h - CELL_W - (bbox[3] - bbox[1])) // 2 - bbox[1]
draw_a.text((tx, ty), AVATAR_CAPTION, fill=TEXT_COLOR, font=font)
avatar_cell_rgb = avatar_cell.convert("RGB")

# Final 4x3 board
final_w = CELL_W + expr_board_w
final_h = expr_board_h
final = Image.new("RGB", (final_w, final_h), BG)
final.paste(avatar_cell_rgb, (0, 0))
final.paste(expr_board_rgb, (CELL_W, 0))

final.save(OUT_PATH, "PNG", optimize=True)
print(f"Saved 4x3 final board: {final.size}, {OUT_PATH.stat().st_size // 1024} KB")
