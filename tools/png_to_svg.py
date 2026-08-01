#!/usr/bin/env python3
"""像素艺术 PNG → SVG 转换器(2D 矩形合并版)。

策略:
1. 读 PNG,提取所有调色板颜色(短 hex)
2. 对每种颜色做贪心 2D 矩形合并:对每行水平 run,尽量向上扩展成最大矩形
3. 输出 <rect> 元素,按颜色分组,加 shape-rendering="crispEdges"
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def to_hex(rgb: tuple[int, int, int]) -> str:
    r, g, b = rgb
    if r >> 4 == r & 0xF and g >> 4 == g & 0xF and b >> 4 == b & 0xF:
        return f"#{r:x}{g:x}{b:x}"
    return f"#{r:02x}{g:02x}{b:02x}"


def png_to_svg(png_path: Path, svg_path: Path) -> tuple[int, int, int, int]:
    im = Image.open(png_path).convert("RGB")
    w, h = im.size

    # 颜色 -> 调色板索引
    palette: list[tuple[int, int, int]] = []
    idx_of: dict[tuple[int, int, int], int] = {}
    grid: list[list[int]] = [[0] * w for _ in range(h)]

    for y in range(h):
        for x in range(w):
            rgb = im.getpixel((x, y))
            if rgb not in idx_of:
                idx_of[rgb] = len(palette)
                palette.append(rgb)
            grid[y][x] = idx_of[rgb]

    # visited[y][x] = 是否已被某矩形覆盖
    visited = [[False] * w for _ in range(h)]

    rects_by_color: list[list[tuple[int, int, int, int]]] = [[] for _ in palette]
    total_rects = 0

    # 对每种颜色独立做 2D 合并,贪心
    for ci in range(len(palette)):
        for y in range(h):
            x = 0
            while x < w:
                if grid[y][x] == ci and not visited[y][x]:
                    # 向右扫
                    x_end = x + 1
                    while x_end < w and grid[y][x_end] == ci and not visited[y][x_end]:
                        x_end += 1
                    run_w = x_end - x
                    # 向上扩(检查 [x, x_end) 整列是否全为 ci 且未访问)
                    y_end = y + 1
                    while y_end < h:
                        ok = True
                        for xi in range(x, x_end):
                            if grid[y_end][xi] != ci or visited[y_end][xi]:
                                ok = False
                                break
                        if ok:
                            y_end += 1
                        else:
                            break
                    run_h = y_end - y
                    for yi in range(y, y_end):
                        for xi in range(x, x_end):
                            visited[yi][xi] = True
                    rects_by_color[ci].append((x, y, run_w, run_h))
                    total_rects += 1
                    x = x_end
                else:
                    x += 1

    # 拼装 SVG
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'shape-rendering="crispEdges" width="{w}" height="{h}">'
    ]
    # 像素数多的色先画(背景),少的叠上面
    for ci in sorted(range(len(palette)), key=lambda i: -len(rects_by_color[i])):
        if not rects_by_color[ci]:
            continue
        fill = to_hex(palette[ci])
        rect_strs = [
            f'<rect x="{x}" y="{y}" width="{rw}" height="{rh}"/>'
            for (x, y, rw, rh) in rects_by_color[ci]
        ]
        parts.append(f'<g fill="{fill}">{"".join(rect_strs)}</g>')
    parts.append("</svg>")

    svg_path.write_text("".join(parts), encoding="utf-8")
    return w, h, total_rects, len(palette)


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("avatar.png")
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".svg")

    w, h, n_rects, n_colors = png_to_svg(src, dst)
    src_size = src.stat().st_size
    dst_size = dst.stat().st_size
    print(f"input:  {src} ({w}x{h}, {src_size} bytes)")
    print(f"output: {dst} ({dst_size} bytes, {n_rects} rects, {n_colors} colors)")
    print(f"ratio:  {dst_size / src_size:.2f}x")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
