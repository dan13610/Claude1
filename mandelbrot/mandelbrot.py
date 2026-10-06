"""Render the Mandelbrot set to a PNG image.

Usage:
    python mandelbrot.py [--width 1600] [--height 1200] [--max-iter 256] [--output mandelbrot.png]
"""

import argparse

import numpy as np
from PIL import Image


def mandelbrot(width, height, max_iter, x_min=-2.5, x_max=1.0, y_min=-1.25, y_max=1.25):
    """Return a smooth iteration-count array for the given region of the complex plane."""
    xs = np.linspace(x_min, x_max, width)
    ys = np.linspace(y_min, y_max, height)
    c = xs[np.newaxis, :] + 1j * ys[:, np.newaxis]

    z = np.zeros_like(c)
    counts = np.full(c.shape, float(max_iter))
    active = np.ones(c.shape, dtype=bool)

    for i in range(max_iter):
        z[active] = z[active] ** 2 + c[active]
        escaped = active & (np.abs(z) > 2.0)
        # Smooth colouring: fractional escape count avoids visible bands.
        abs_z = np.abs(z[escaped])
        counts[escaped] = i + 1 - np.log2(np.log2(abs_z))
        active &= ~escaped
        if not active.any():
            break

    return counts


def colourise(counts, max_iter):
    """Map iteration counts to RGB; points inside the set are black."""
    inside = counts >= max_iter
    t = np.clip(counts / max_iter, 0.0, 1.0) ** 0.5

    r = 9 * (1 - t) * t**3
    g = 15 * (1 - t) ** 2 * t**2
    b = 8.5 * (1 - t) ** 3 * t

    rgb = np.stack([r, g, b], axis=-1)
    rgb = np.clip(rgb * 255, 0, 255).astype(np.uint8)
    rgb[inside] = 0
    return rgb


def main():
    parser = argparse.ArgumentParser(description="Render the Mandelbrot set to a PNG.")
    parser.add_argument("--width", type=int, default=1600)
    parser.add_argument("--height", type=int, default=1200)
    parser.add_argument("--max-iter", type=int, default=256)
    parser.add_argument("--output", default="mandelbrot.png")
    args = parser.parse_args()

    counts = mandelbrot(args.width, args.height, args.max_iter)
    image = Image.fromarray(colourise(counts, args.max_iter), mode="RGB")
    image.save(args.output)
    print(f"Saved {args.width}x{args.height} image to {args.output}")


if __name__ == "__main__":
    main()
