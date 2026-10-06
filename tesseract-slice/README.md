# Tesseract Slicer

Computes the 3D solid you get when a 4D hypercube (a tesseract) is cut by a 3D hyperplane, and shows it on screen as a rotating 3D shape.

Open `index.html` in a browser (phone included). Tilt the hyperplane with the x, y, z and w sliders, move it with the d slider, or press **Sweep through** to pass it from one side of the hypercube to the other.

## How it works

The hypercube is every point (x, y, z, w) with each coordinate between −1 and 1. The hyperplane is the set of points where `n · (x, y, z, w) = d`.

`slice.js` does the geometry:

1. **Vertices.** For each of the hypercube's 32 edges whose ends lie on opposite sides of the hyperplane, it finds the crossing point. Hypercube corners lying exactly on the hyperplane are included too.
2. **Faces.** The hypercube's boundary is 8 cubes (x = ±1, y = ±1, z = ±1, w = ±1). Each cube the hyperplane cuts through contributes one polygon face: the crossing points in that cube, sorted into order around their centre.
3. **3D coordinates.** Points are rewritten in an orthonormal basis of the hyperplane, which turns the 4D points into ordinary 3D ones.

`index.html` draws the result on a canvas with a perspective projection. Faces are coloured by the cube of the hypercube they lie in, and hidden edges are dashed. The page also reports the vertex, edge and face counts, and names the shape when it is a familiar one (cube, octahedron, tetrahedron, truncated tetrahedron, triangular or hexagonal prism).

Degenerate cases are handled: a hyperplane that only touches a corner gives a point, one along an edge gives a segment, and one lying along a square face of the hypercube gives a flat square.

## Checking the geometry

`slice.js` also runs under Node:

```bash
node -e "const T=require('./slice.js'); const s=T.slice([1,1,1,1],0); console.log(T.describe(s))"
```

It was tested against the known cross-sections listed above, and on 20,000 random hyperplanes, where every result was a closed solid with V − E + F = 2.
