#!/usr/bin/env python3
"""Render Chrome Web Store listing images at exact pixel sizes.

Run from the repo root:

    python3 store/make-assets.py

Needs Google Chrome. Screenshots are 24-bit PNG (no alpha), as the store requires.
"""
from __future__ import annotations

import http.server
import shutil
import socketserver
import subprocess
import threading
import time
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STORE = Path(__file__).resolve().parent
ASSETS = STORE / "assets"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

SHOTS = [
    ("screenshot.html", "screenshot-catalog.png", (1280, 800)),
    ("screenshot.html?filter=cad", "screenshot-cad.png", (1280, 800)),
    ("screenshot.html?q=pdf", "screenshot-search.png", (1280, 800)),
]
PROMOS = [
    ("promo-small.html", "promo-small.png", (440, 280)),
    ("promo-marquee.html", "promo-marquee.png", (1400, 560)),
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):  # noqa: A003
        return


def start_server(directory: Path) -> tuple[socketserver.TCPServer, int]:
    class Handler(QuietHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

    httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)
    httpd.allow_reuse_address = True
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, port


def chrome_shot(url: str, dest: Path, size: tuple[int, int]) -> None:
    w, h = size
    tmp = dest.with_suffix(".raw.png")
    cmd = [
        str(CHROME),
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={w},{h}",
        "--virtual-time-budget=8000",
        f"--screenshot={tmp}",
        url,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    im = Image.open(tmp).convert("RGB")
    if im.size != size:
        canvas = Image.new("RGB", size, (20, 32, 26))
        canvas.paste(im.crop((0, 0, min(im.width, w), min(im.height, h))), (0, 0))
        im = canvas
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG", optimize=True)
    tmp.unlink(missing_ok=True)
    print(f"{dest.relative_to(ROOT)} {im.size}")


def copy_icon() -> None:
    dest = STORE / "icon-128.png"
    Image.open(ROOT / "icons/icon128.png").convert("RGBA").save(dest, "PNG")
    print(f"{dest.relative_to(ROOT)} {Image.open(dest).size}")


def main() -> None:
    if not CHROME.exists():
        raise SystemExit(f"Chrome not found: {CHROME}")
    ASSETS.mkdir(parents=True, exist_ok=True)
    httpd, port = start_server(ROOT)
    try:
        time.sleep(0.2)
        base = f"http://127.0.0.1:{port}/store/"
        for page, name, size in SHOTS + PROMOS:
            chrome_shot(base + page, ASSETS / name, size)
        copy_icon()
    finally:
        httpd.shutdown()
        httpd.server_close()


if __name__ == "__main__":
    main()
