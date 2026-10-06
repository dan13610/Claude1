# Mandelbrot

Renders the Mandelbrot set to a PNG image.

![Mandelbrot set](mandelbrot.png)

## Usage

From this folder:

```bash
pip install -r requirements.txt
python mandelbrot.py
```

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `--width` | 1600 | Image width in pixels |
| `--height` | 1200 | Image height in pixels |
| `--max-iter` | 256 | Maximum iterations per point |
| `--output` | `mandelbrot.png` | Output file name |
