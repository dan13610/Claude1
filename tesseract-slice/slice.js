/*
 * Cross-section of the 4D hypercube [-1, 1]^4 by the hyperplane  n · x = d.
 *
 * The result is a convex 3D polytope (or, in degenerate cases, something flatter).
 *  - Its vertices are where the hyperplane meets the tesseract's 32 edges
 *    (including tesseract vertices that lie exactly on the hyperplane).
 *  - Its faces come from the tesseract's 8 cubic cells (x_i = ±1): each cell
 *    the hyperplane passes through contributes one polygon face.
 *  - Points are expressed in 3D using an orthonormal basis of the hyperplane.
 *
 * Works in the browser (window.TesseractSlice) and in Node (module.exports).
 */
(function (root) {
  "use strict";

  const EPS = 1e-9;
  const AXES = ["x", "y", "z", "w"];

  // The 16 vertices and 32 edges of the tesseract.
  const VERTS = [];
  for (let m = 0; m < 16; m++) {
    VERTS.push([0, 1, 2, 3].map(i => ((m >> i) & 1 ? 1 : -1)));
  }
  const EDGES = [];
  for (let m = 0; m < 16; m++) {
    for (let i = 0; i < 4; i++) {
      const n = m ^ (1 << i);
      if (m < n) EDGES.push([m, n]);
    }
  }

  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const scale = (a, k) => a.map(v => v * k);
  const norm = a => Math.sqrt(dot(a, a));
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // Orthonormal basis (3 vectors) of the subspace perpendicular to unit vector n.
  function hyperplaneBasis(n) {
    const basis = [];
    // Try standard basis vectors, most-perpendicular to n first, for stability.
    const order = [0, 1, 2, 3].sort((i, j) => Math.abs(n[i]) - Math.abs(n[j]));
    for (const i of order) {
      let v = [0, 0, 0, 0];
      v[i] = 1;
      v = sub(v, scale(n, dot(v, n)));
      for (const b of basis) v = sub(v, scale(b, dot(v, b)));
      const len = norm(v);
      if (len > 1e-6) basis.push(scale(v, 1 / len));
      if (basis.length === 3) break;
    }
    return basis;
  }

  /**
   * normal: 4 numbers (need not be unit length, must not be all zero).
   * t: offset as a fraction in [-1, 1] of the range over which the hyperplane
   *    touches the tesseract (t = 0 goes through the centre, ±1 touches a corner/face).
   */
  function slice(normal, t) {
    const len = norm(normal);
    if (len < EPS) throw new Error("normal must be non-zero");
    const n = scale(normal, 1 / len);
    const reach = n.reduce((s, v) => s + Math.abs(v), 0); // max of n·x over the tesseract
    const d = t * reach;
    const basis = hyperplaneBasis(n);
    const to3 = p => basis.map(b => dot(p, b));

    // 1. Intersection points in 4D.
    const pts4 = [];
    const addPoint = p => {
      for (const q of pts4) if (norm(sub(p, q)) < 1e-7) return;
      pts4.push(p);
    };
    const f = VERTS.map(v => dot(n, v) - d);
    VERTS.forEach((v, i) => { if (Math.abs(f[i]) < EPS) addPoint(v); });
    for (const [a, b] of EDGES) {
      if ((f[a] < -EPS && f[b] > EPS) || (f[a] > EPS && f[b] < -EPS)) {
        const s = f[a] / (f[a] - f[b]);
        addPoint(VERTS[a].map((v, i) => v + s * (VERTS[b][i] - v)));
      }
    }

    const vertices = pts4.map(to3);
    const empty = { vertices, faces: [], edges: [], dim: vertices.length ? 0 : -1, d, normal: n };
    if (vertices.length === 0) return empty;

    // Overall dimension of the slice.
    const dim = affineDim(vertices);

    // 2. One face per cubic cell (x_i = ±1) that the hyperplane cuts in a polygon.
    const faces = [];
    const seen = new Set();
    for (let axis = 0; axis < 4; axis++) {
      for (const sign of [-1, 1]) {
        const idx = [];
        pts4.forEach((p, k) => { if (Math.abs(p[axis] - sign) < 1e-7) idx.push(k); });
        if (idx.length < 3) continue;
        const poly = idx.map(k => vertices[k]);
        if (affineDim(poly) !== 2) continue; // a segment, or the whole cell lies in the hyperplane
        const ordered = orderPolygon(idx, vertices);
        const key = idx.slice().sort((a, b) => a - b).join(",");
        if (seen.has(key)) continue; // flat slices can repeat the same polygon
        seen.add(key);
        faces.push({ verts: ordered, axis, sign, cell: (sign > 0 ? "+" : "−") + AXES[axis] });
      }
    }

    // In the 3D case, orient every face outward (counter-clockwise seen from outside).
    if (dim === 3) {
      const c = centroid(vertices);
      for (const face of faces) {
        const [a, b, e] = face.verts.map(k => vertices[k]);
        const nrm = cross3(sub(b, a), sub(e, a));
        if (dot(nrm, sub(a, c)) < 0) face.verts.reverse();
      }
    }

    // 3. Edges: unique sides of the faces (or of the single polygon when flat).
    const edgeSet = new Map();
    for (const face of faces) {
      const v = face.verts;
      for (let i = 0; i < v.length; i++) {
        const a = v[i], b = v[(i + 1) % v.length];
        edgeSet.set(a < b ? a + "-" + b : b + "-" + a, [Math.min(a, b), Math.max(a, b)]);
      }
    }
    if (dim === 1 && vertices.length === 2) edgeSet.set("0-1", [0, 1]);

    return { vertices, faces, edges: [...edgeSet.values()], dim, d, normal: n };
  }

  function centroid(ps) {
    const c = [0, 0, 0];
    for (const p of ps) for (let i = 0; i < 3; i++) c[i] += p[i] / ps.length;
    return c;
  }

  // Dimension (0-3) of the affine hull of a set of 3D points.
  function affineDim(ps) {
    if (ps.length <= 1) return 0;
    const rows = ps.slice(1).map(p => sub(p, ps[0]));
    // Gaussian elimination rank with tolerance.
    let rank = 0;
    const m = rows.map(r => r.slice());
    for (let col = 0; col < 3 && rank < m.length; col++) {
      let piv = rank;
      for (let r = rank; r < m.length; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
      if (Math.abs(m[piv][col]) < 1e-7) continue;
      [m[rank], m[piv]] = [m[piv], m[rank]];
      for (let r = 0; r < m.length; r++) {
        if (r === rank) continue;
        const k = m[r][col] / m[rank][col];
        for (let c = col; c < 3; c++) m[r][c] -= k * m[rank][c];
      }
      rank++;
    }
    return rank;
  }

  // Sort the indices of a convex planar polygon's vertices into cyclic order.
  function orderPolygon(idx, vertices) {
    const ps = idx.map(k => vertices[k]);
    const c = centroid(ps);
    let u = null, nrm = null;
    for (const p of ps) {
      const r = sub(p, c);
      if (!u && norm(r) > 1e-7) { u = scale(r, 1 / norm(r)); continue; }
      if (u) {
        const cr = cross3(u, r);
        if (norm(cr) > 1e-7) { nrm = scale(cr, 1 / norm(cr)); break; }
      }
    }
    const v = cross3(nrm, u);
    return idx
      .map(k => { const r = sub(vertices[k], c); return { k, a: Math.atan2(dot(r, v), dot(r, u)) }; })
      .sort((p, q) => p.a - q.a)
      .map(p => p.k);
  }

  // A plain-language description of the slice.
  function describe(s) {
    const V = s.vertices.length, E = s.edges.length, F = s.faces.length;
    if (s.dim < 0) return { name: "Nothing", detail: "The hyperplane misses the hypercube." };
    if (s.dim === 0) return { name: "A single point", detail: "The hyperplane just touches one corner." };
    if (s.dim === 1) return { name: "A line segment", detail: "The hyperplane just touches one edge." };
    if (s.dim === 2) return { name: polyName(V, true), detail: "The hyperplane lies along a face of the hypercube, so the slice is flat." };

    const counts = {};
    for (const f of s.faces) counts[f.verts.length] = (counts[f.verts.length] || 0) + 1;
    const c = k => counts[k] || 0;
    const kinds = Object.keys(counts).length;
    let name = "Polyhedron";
    if (F === 4 && c(3) === 4) name = "Tetrahedron";
    else if (F === 6 && c(4) === 6) name = "Box (hexahedron)";
    else if (F === 8 && c(3) === 8 && V === 6) name = "Octahedron";
    else if (F === 5 && c(3) === 2 && c(4) === 3) name = "Triangular prism";
    else if (F === 8 && c(6) === 2 && c(4) === 6) name = "Hexagonal prism";
    else if (F === 8 && c(6) === 4 && c(3) === 4) name = "Truncated tetrahedron";
    else if (F === 5 && c(4) === 1 && c(3) === 4) name = "Square pyramid";
    else if (kinds === 1) name = F + "-faced polyhedron";

    const parts = Object.keys(counts).sort((a, b) => a - b)
      .map(k => counts[k] + " " + polyName(+k, false) + (counts[k] > 1 ? "s" : ""));
    return { name, detail: F + " faces: " + parts.join(", ") + "." };
  }

  function polyName(k, capital) {
    const names = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon" };
    const s = names[k] || k + "-gon";
    return capital ? s[0].toUpperCase() + s.slice(1) : s;
  }

  const api = { slice, describe, VERTS, EDGES, AXES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TesseractSlice = api;
})(typeof window !== "undefined" ? window : this);
