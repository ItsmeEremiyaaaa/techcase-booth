"""Renders the tablet screen and print textures in design-src/ to WebP files in public/assets/.
Requires Python Playwright + Pillow. Run from the project root: python3 design-src/render.py
Pick parts with: python3 design-src/render.py tablet | print | rollup"""
import io, pathlib, sys
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

# The demo tablet: the real StudyQuest home dashboard (design-src/tablet-home.png), centred on the
# app's cream background at the tablet screen's 1100 x 800 shape (matches the 3D tablet in Booth.tsx).
if not only or 'tablet' in only or 'screens' in only:
    shot = Image.open(SRC / 'tablet-home.png').convert('RGB')
    W, H = 1100, 800
    canvas = Image.new('RGB', (W, H), shot.getpixel((3, 300)))
    w = round(shot.width * H / shot.height)
    canvas.paste(shot.resize((w, H), Image.LANCZOS), ((W - w) // 2, 0))
    buf = io.BytesIO(); canvas.save(buf, 'PNG')
    save(buf.getvalue(), OUT / 'screens' / 'tablet.webp', q=90)

if not only or 'print' in only:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(device_scale_factor=1, viewport={'width': 2600, 'height': 2000})
        pg.goto((SRC / 'print.html').as_uri()); pg.wait_for_timeout(600)
        for sid in ['backdrop', 'tablefront', 'wallbanner', 'scoreboard']:
            save(pg.locator(f'#{sid}').screenshot(), OUT / 'textures' / f'{sid}.webp', q=88)
        pg.close()
        b.close()

# The roll-up texture comes straight from the team's print PDF (needs poppler's pdftoppm).
if not only or 'rollup' in only:
    import subprocess, tempfile
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['pdftoppm', '-r', '24', '-png', '-singlefile', str(SRC / 'StudyQuest-Rollup-Banner-33x80.pdf'), f'{tmp}/rollup'], check=True)
        im = Image.open(f'{tmp}/rollup.png').convert('RGB')
        buf = io.BytesIO(); im.save(buf, 'PNG')
        save(buf.getvalue(), OUT / 'textures' / 'rollup.webp', size=(720, round(720 * im.height / im.width)), q=88)
