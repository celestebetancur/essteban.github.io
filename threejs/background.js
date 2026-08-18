/**
 * Three.js background — Chaotic Attractor System
 * Port of p5/index.js for Celeste Betancur's website.
 *
 * Implements the same algorithm:
 *   - 4 attractors: Lorenz (0), Chen (1), Chua (2), Rössler (3)
 *   - 100 particles each with a velocity-coloured fading trail (TSIZE=400)
 *   - Mouse / touch drag orbit with momentum (mirrors p5 orbit())
 *   - Auto-cycle between shapes every ~35 s  (WAIT_FRAMES = 35 × 30)
 *   - Any key press / spacebar advances to the next shape
 *
 * Requires THREE to be available globally (three.min.js loaded before this file).
 * Attaches a WebGL canvas to #three-container.
 */

(function () {
  "use strict";

  // ─── Configuration ────────────────────────────────────────────────────────
  const NUM = 200;          // particles per shape
  const TSIZE = 400;          // max trail length (frames)
  const WAIT_FRAMES = 35 * 30;      // frames per shape @ 30 fps  = 35 s
  const SUBSTEPS = 10;           // physics sub-steps per rendered frame
  const FPS_TARGET = 30;

  // ─── Runtime state ─────────────────────────────────────────────────────────
  let renderer, glowRenderer, scene, camera, pivot;
  let particles = [];   // array of particle state objects
  let attractorType = -1;
  let frameTime = WAIT_FRAMES + 1;
  let sspeed = 0.0005;

  // Attractor constants (set per shape)
  let o, pp, bp;   // sigma/alpha, rho/beta, b  (pp/bp avoid collision with p5 names)

  // Orbit
  let mx = { x: 0, y: 0 };
  let mv = { x: 0, y: 0 };
  let pointerDown = false;
  let prevPointer = { x: 0, y: 0 };

  // Frame-rate limiter
  let lastTS = 0;
  const frameDur = 1000 / FPS_TARGET;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Box–Muller Gaussian sample */
  function gaussRand() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) *
      Math.cos(2 * Math.PI * Math.random());
  }

  /**
   * HSL → linear RGB  (h, s, l each in [0, 1]).
   * Returns [r, g, b] each in [0, 1].
   */
  function hslToRgb(h, s, l) {
    if (s === 0) return [l, l, l];
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 0.5) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
  }

  // ─── Attractor step functions ─────────────────────────────────────────────
  // Each returns a new [x, y, z] position (mirrors p5 calculate(t)).

  function stepLorenz(pos, dt) {
    return [
      pos[0] + dt * o * (pos[1] - pos[0]),
      pos[1] + dt * (pos[0] * (pp - pos[2]) - pos[1]),
      pos[2] + dt * (pos[0] * pos[1] - bp * pos[2])
    ];
  }

  function stepChen(pos, dt) {
    return [
      pos[0] + dt * o * (pos[1] - pos[0]),
      pos[1] + dt * ((bp - o) * pos[0] - pos[0] * pos[2] + bp * pos[1]),
      pos[2] + dt * (pos[0] * pos[1] - pp * pos[2])
    ];
  }

  function stepChua(pos, dt) {
    // h is recalculated from x each step (mirrors p5's `this.h`)
    const h = -0.11 * Math.sin(Math.PI * pos[0] / 2.6);
    return [
      pos[0] + dt * o * (pos[1] - h),
      pos[1] + dt * (pos[0] - pos[1] + pos[2]),
      pos[2] + dt * (-pp * pos[1])
    ];
  }

  function stepRossler(pos, dt) {
    return [
      pos[0] + dt * (-pos[1] - Math.pow(o * pos[2], 2)),
      pos[1] + dt * (pos[0] + o * pos[1]),
      pos[2] + dt * (pp + pos[2] * (pos[0] - bp))
    ];
  }

  const STEPFNS = [stepLorenz, stepChen, stepChua, stepRossler];

  // ─── Particle creation ────────────────────────────────────────────────────

  function makeParticle(initPos, hue, k) {
    const maxPts = TSIZE + 2;

    const posArr = new Float32Array(maxPts * 3);
    const colArr = new Float32Array(maxPts * 3);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
    geo.setDrawRange(0, 1);

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 1.0
    });

    const line = new THREE.Line(geo, mat);
    pivot.add(line);

    // Sharp sphere at the head of the trail
    const sGeo = new THREE.SphereGeometry(0.5, 4, 4);
    const sMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 1, 0.9),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sphere = new THREE.Mesh(sGeo, sMat);
    pivot.add(sphere);

    // Larger, dim halo sphere — amplified by the CSS glow pass
    const hGeo = new THREE.SphereGeometry(2.5, 6, 6);
    const hMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 1, 0.6),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.18
    });
    const halo = new THREE.Mesh(hGeo, hMat);
    pivot.add(halo);

    return {
      line, sphere, halo, hGeo, hMat, geo, posArr, colArr,
      prev: [initPos.slice(), initPos.slice()],
      k,
      hue
    };
  }

  // ─── Clear all particles from scene ──────────────────────────────────────

  function clearParticles() {
    for (const p of particles) {
      pivot.remove(p.line);
      pivot.remove(p.sphere);
      pivot.remove(p.halo);
      p.line.geometry.dispose();
      p.line.material.dispose();
      p.sphere.geometry.dispose();
      p.sphere.material.dispose();
      p.hGeo.dispose();
      p.hMat.dispose();
    }
    particles = [];
  }

  // ─── Spawn new attractor shape (mirrors newLorenz) ───────────────────────

  function newAttractor(prev) {
    const A = (prev + 1) % 4;

    // Default spread / speed per attractor type
    let s = 1, sx = 1, sy = 1, sz = 1;

    if (A === 0) {          // Lorenz
      o = 10; pp = 28; bp = 8 / 3;
      s = 20; sspeed = 0.0005;
    } else if (A === 1) {   // Chen
      o = 40; pp = 3; bp = 28;
      s = 1; sspeed = 0.0005;
    } else if (A === 2) {   // Chua
      o = 10.82; pp = 14.286;
      s = 0.01; sspeed = 0.01;
    } else {                // Rössler
      o = 0.1; pp = 0.1; bp = 14;
      s = 1; sx = 20; sy = 20; sz = 0; sspeed = 0.002;
    }

    clearParticles();

    // Teal-to-purple palette  — matches CSS --primary-color (#007a7a ≈ 0.50)
    // through --secondary-color (#8a00cc ≈ 0.78), spanning [0.48, 0.80].
    const baseHue = 0.48 + Math.random() * 0.32;

    for (let i = 0; i < NUM; i++) {
      const ix = (Math.random() * 2 - 1) * sx * s;
      const iy = (Math.random() * 2 - 1) * sy * s;
      const iz = (Math.random() * 2 - 1) * sz * s;

      // Gaussian spread around baseHue — wider (±0.08) to mix teal ↔ purple
      const hue = ((baseHue + gaussRand() * 0.08) % 1 + 1) % 1;
      particles.push(makeParticle([ix, iy, iz], hue, A));
    }

    return A;
  }

  // ─── Per-frame particle update ────────────────────────────────────────────

  function updateParticle(p) {
    const prev = p.prev;
    const last = prev[prev.length - 1];

    // Advance physics
    const next = STEPFNS[p.k](last, sspeed);
    prev.push(next);
    if (prev.length > TSIZE) prev.shift();

    const len = prev.length;
    const head = prev[len - 1];
    const tail = prev[len - 2];

    // Speed → brightness (mirrors p5: G = mod.mag(); stroke(h, 100, G*50))
    const dx = head[0] - tail[0];
    const dy = head[1] - tail[1];
    const dz = head[2] - tail[2];
    const speed = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const brightness = Math.min(speed * 50, 1.0);

    // Build trail geometry
    const posArr = p.posArr;
    const colArr = p.colArr;

    for (let i = 0; i < len; i++) {
      const pt = prev[i];
      const idx = i * 3;
      posArr[idx] = pt[0];
      posArr[idx + 1] = pt[1];
      posArr[idx + 2] = pt[2];

      // Fade trail: oldest → dim, newest → full brightness
      const t = i / len;
      const lum = brightness * t * 0.9 + 0.03;
      const [r, g, b] = hslToRgb(p.hue, 1.0, Math.min(lum, 1.0));
      colArr[idx] = r;
      colArr[idx + 1] = g;
      colArr[idx + 2] = b;
    }

    p.geo.attributes.position.needsUpdate = true;
    p.geo.attributes.color.needsUpdate = true;
    p.geo.setDrawRange(0, len);

    // Move sphere and halo to head position
    p.sphere.position.set(head[0], head[1], head[2]);
    p.halo.position.set(head[0], head[1], head[2]);
  }

  // ─── Orbit (mirrors p5 orbit()) ───────────────────────────────────────────

  function applyOrbit() {
    mv.x *= 0.9;
    mv.y *= 0.9;
    mx.x += mv.x;
    mx.y += mv.y;
    pivot.rotation.y = mx.x;
    pivot.rotation.x = mx.y;
  }

  // ─── Render loop ──────────────────────────────────────────────────────────

  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - lastTS < frameDur) return;
    lastTS = ts;

    // Cycle attractor shape
    if (frameTime > WAIT_FRAMES) {
      frameTime = 0;
      attractorType = newAttractor(attractorType);
    }
    frameTime++;

    // Physics sub-steps
    for (let s = 0; s < SUBSTEPS; s++) {
      for (const p of particles) updateParticle(p);
    }

    applyOrbit();
    // Glow pass first (behind), then sharp pass on top
    glowRenderer.render(scene, camera);
    renderer.render(scene, camera);
  }

  // ─── Initialisation ───────────────────────────────────────────────────────

  function init() {
    const container = document.getElementById('three-container');
    if (!container) {
      console.warn('[three-bg] #three-container not found.');
      return;
    }

    // ── Glow renderer (half-res, behind — blurred by CSS) ──
    glowRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    glowRenderer.setPixelRatio(1);  // always 1× — it will be blurred anyway
    glowRenderer.setSize(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2));
    glowRenderer.setClearColor(0xf5f0e8, 1);  // cream bg — matches CSS --bg-color
    const glowCanvas = glowRenderer.domElement;
    glowCanvas.id = 'glow-canvas';
    glowCanvas.style.position = 'absolute';
    glowCanvas.style.top = '0';
    glowCanvas.style.left = '0';
    glowCanvas.style.width = '100%';
    glowCanvas.style.height = '100%';
    container.appendChild(glowCanvas);  // appended first → rendered behind

    // ── Sharp renderer (full-res, in front) ──
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);  // transparent so glow shows through
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);  // appended second → rendered on top

    // Scene + pivot
    scene = new THREE.Scene();
    pivot = new THREE.Group();
    scene.add(pivot);

    // Camera (mirrors p5: camera(0, 0, 150), perspective(PI/4, w/h, 1, 1000))
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 150);
    camera.lookAt(0, 0, 0);

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      glowRenderer.setSize(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── Mouse orbit ──
    window.addEventListener('mousedown', e => {
      pointerDown = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { pointerDown = false; });
    window.addEventListener('mousemove', e => {
      if (!pointerDown) return;
      mv.x += (e.clientX - prevPointer.x) / 1000;
      mv.y -= (e.clientY - prevPointer.y) / 1000;
      prevPointer = { x: e.clientX, y: e.clientY };
    });

    // ── Touch orbit ──
    let tp = null;
    window.addEventListener('touchstart', e => {
      if (e.touches.length === 1) tp = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchmove', e => {
      if (!tp || e.touches.length !== 1) return;
      mv.x += (e.touches[0].clientX - tp.x) / 1000;
      mv.y -= (e.touches[0].clientY - tp.y) / 1000;
      tp = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchend', () => { tp = null; });

    // ── Any key → skip to next shape ──
    window.addEventListener('keydown', () => { frameTime = WAIT_FRAMES + 1; });

    requestAnimationFrame(loop);
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
