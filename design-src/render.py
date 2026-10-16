"""Renders the placeholder screens and print textures in design-src/ to WebP files in public/assets/.
Requires Python Playwright + Pillow. Run from the project root: python3 design-src/render.py"""
import io, pathlib, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'design-src'
OUT = ROOT / 'public' / 'assets'
only = set(sys.argv[1:])

def save(png: bytes, dest: pathlib.Path, size=None, q=86):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    if size: im = im.resize(size, Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, 'WEBP', quality=q, method=6)
    print(dest.relative_to(ROOT), im.size, dest.stat().st_size // 1024, 'KB')

with sync_playwright() as p:
    b = p.chromium.launch()
    if not only or 'screens' in only:
        pg = b.new_page(device_scale_factor=1.5, viewport={'width': 1600, 'height': 1200})
        pg.goto((SRC / 'screens.html').as_uri()); pg.wait_for_timeout(400)
        for sid in ['home', 'quiz', 'results', 'leaderboard', 'profile']:
            save(pg.locator(f'#{sid}').screenshot(), OUT / 'screens' / f'{sid}.webp')
        pg.close()
        pg = b.new_page(device_scale_factor=1, viewport={'width': 1600, 'height': 1200})
        pg.goto((SRC / 'screens.html').as_uri()); pg.wait_for_timeout(400)
        save(pg.locator('#tablet').screenshot(), OUT / 'screens' / 'tablet-home.webp')
        pg.close()
    if not only or 'print' in only:
        pg = b.new_page(device_scale_factor=1, viewport={'width': 2600, 'height': 2000})
        pg.goto((SRC / 'print.html').as_uri()); pg.wait_for_timeout(600)
        for sid in ['backdrop', 'rollup', 'tablefront', 'wallbanner', 'scoreboard']:
            save(pg.locator(f'#{sid}').screenshot(), OUT / 'textures' / f'{sid}.webp', q=88)
        pg.close()
    b.close()
