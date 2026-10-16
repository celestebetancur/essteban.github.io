/*
 * Background attractor — Lorenz, Chen, Chua, Rössler.
 * A fixed canvas behind every page. On scroll it drifts and turns more
 * slowly than the content (parallax) and fades back so text stays readable.
 *  - one renderer, trail geometry rebuilt once per frame, colour lookup tables
 *  - light theme: dark ink-like trails; dark theme: additive glow
 *  - pauses when the tab is hidden; still frame for prefers-reduced-motion
 *  - mouse-drag on empty background to orbit; never captures keys
 * Needs THREE (r128) loaded first.
 */
(function () {
  'use strict';
  var canvas = document.getElementById('attractor');
  if (!canvas || !window.THREE) return;

  var NUM = 120, TSIZE = 320, SUBSTEPS = 10, WAIT = 35 * 30, FPS = 30, LUT = 32;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var darkMQ = matchMedia('(prefers-color-scheme: dark)');
  var dark = darkMQ.matches;

  // how strong the figure is at the top of the page and once you scroll past it
  var isHome = document.body.classList.contains('home');
  var OP_TOP = isHome ? 1 : 0.55, OP_READ = 0.22, FADE_PX = isHome ? 520 : 360;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  var scene = new THREE.Scene();
  var holder = new THREE.Group();   // parallax offset
  var pivot = new THREE.Group();    // orbit rotation
  holder.add(pivot);
  scene.add(holder);
  var camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
  camera.position.set(0, 0, 150);

  var baseX = 0;
  function size() {
    var w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    baseX = (isHome && w > 860) ? 28 : 0;   // sit beside the hero text on wide screens
    if (reduced) draw();
  }
  addEventListener('resize', size);

  var o, pp, bp, dt, kind = -1, frame = WAIT + 1, parts = [];
  var steps = [
    function (p) { return [p[0] + dt * o * (p[1] - p[0]), p[1] + dt * (p[0] * (pp - p[2]) - p[1]), p[2] + dt * (p[0] * p[1] - bp * p[2])]; },
    function (p) { return [p[0] + dt * o * (p[1] - p[0]), p[1] + dt * ((bp - o) * p[0] - p[0] * p[2] + bp * p[1]), p[2] + dt * (p[0] * p[1] - pp * p[2])]; },
    function (p) { var h = -0.11 * Math.sin(Math.PI * p[0] / 2.6); return [p[0] + dt * o * (p[1] - h), p[1] + dt * (p[0] - p[1] + p[2]), p[2] + dt * (-pp * p[1])]; },
    function (p) { return [p[0] + dt * (-p[1] - Math.pow(o * p[2], 2)), p[1] + dt * (p[0] + o * p[1]), p[2] + dt * (pp + p[2] * (p[0] - bp))]; }
  ];
  function gauss() { return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()); }

  function blending() { return dark ? THREE.AdditiveBlending : THREE.NormalBlending; }
  // light theme: fade from paper (old trail) to deep colour (head); dark: black → bright
  function lum(j) { var t = j / (LUT - 1); return dark ? 0.03 + 0.87 * t : 0.93 - 0.58 * t; }

  var heads = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({
    size: 1.6, vertexColors: true, depthWrite: false, transparent: true
  }));
  pivot.add(heads);

  function clear() {
    parts.forEach(function (p) { pivot.remove(p.line); p.line.geometry.dispose(); p.line.material.dispose(); });
    parts = [];
  }

  function next() {
    kind = (kind + 1) % 4;
    var s = 1, sx = 1, sy = 1, sz = 1;
    if (kind === 0) { o = 10; pp = 28; bp = 8 / 3; s = 20; dt = 0.0005; }
    else if (kind === 1) { o = 40; pp = 3; bp = 28; dt = 0.0005; }
    else if (kind === 2) { o = 10.82; pp = 14.286; s = 0.01; dt = 0.01; }
    else { o = 0.1; pp = 0.1; bp = 14; sx = 20; sy = 20; sz = 0; dt = 0.002; }
    clear();
    heads.material.blending = blending();
    var base = 0.48 + Math.random() * 0.32;           // teal → violet
    var hp = new Float32Array(NUM * 3), hc = new Float32Array(NUM * 3);
    for (var i = 0; i < NUM; i++) {
      var hue = ((base + gauss() * 0.08) % 1 + 1) % 1;
      var lut = new Float32Array(LUT * 3), c = new THREE.Color();
      for (var j = 0; j < LUT; j++) { c.setHSL(hue, dark ? 1 : 0.75, lum(j)); lut[j * 3] = c.r; lut[j * 3 + 1] = c.g; lut[j * 3 + 2] = c.b; }
      c.setHSL(hue, 1, dark ? 0.85 : 0.3); hc[i * 3] = c.r; hc[i * 3 + 1] = c.g; hc[i * 3 + 2] = c.b;
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TSIZE * 3), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TSIZE * 3), 3));
      geo.setDrawRange(0, 0);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, blending: blending(), depthWrite: false, transparent: true }));
      pivot.add(line);
      var start = [(Math.random() * 2 - 1) * sx * s, (Math.random() * 2 - 1) * sy * s, (Math.random() * 2 - 1) * sz * s];
      parts.push({ line: line, trail: [start, start], lut: lut });
    }
    heads.geometry.setAttribute('position', new THREE.BufferAttribute(hp, 3));
    heads.geometry.setAttribute('color', new THREE.BufferAttribute(hc, 3));
  }

  function update() {
    var hp = heads.geometry.attributes.position.array;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], tr = p.trail;
      for (var s = 0; s < SUBSTEPS; s++) tr.push(steps[kind](tr[tr.length - 1]));
      while (tr.length > TSIZE) tr.shift();
      var n = tr.length, a = tr[n - 1], b = tr[n - 2];
      var bright = Math.min(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 50, 1);
      var pos = p.line.geometry.attributes.position.array, col = p.line.geometry.attributes.color.array;
      for (var k = 0; k < n; k++) {
        var q = tr[k], x = k * 3, li = Math.min(LUT - 1, Math.round(bright * (k / n) * (LUT - 1))) * 3;
        pos[x] = q[0]; pos[x + 1] = q[1]; pos[x + 2] = q[2];
        col[x] = p.lut[li]; col[x + 1] = p.lut[li + 1]; col[x + 2] = p.lut[li + 2];
      }
      p.line.geometry.attributes.position.needsUpdate = true;
      p.line.geometry.attributes.color.needsUpdate = true;
      p.line.geometry.setDrawRange(0, n);
      hp[i * 3] = a[0]; hp[i * 3 + 1] = a[1]; hp[i * 3 + 2] = a[2];
    }
    heads.geometry.attributes.position.needsUpdate = true;
  }

  // ---- parallax: the figure rises at ~¼ of scroll speed, turns a little and fades back
  var scrollY = pageYOffset, py = scrollY;
  addEventListener('scroll', function () { scrollY = pageYOffset; if (reduced) draw(); }, { passive: true });

  // ---- orbit: mouse-drag on empty background (not on text, links or media)
  var rot = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, last = null;
  var BLOCK = 'a,button,input,textarea,select,iframe,img,figure,p,li,h1,h2,h3,nav,header.site-header';
  addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest(BLOCK)) return;
    last = { x: e.clientX, y: e.clientY };
    document.documentElement.classList.add('orbiting');
    e.preventDefault();
  });
  addEventListener('pointermove', function (e) {
    if (!last) return;
    vel.x += (e.clientX - last.x) / 1000; vel.y -= (e.clientY - last.y) / 1000;
    last = { x: e.clientX, y: e.clientY };
    if (reduced) draw();
  });
  addEventListener('pointerup', function () { last = null; document.documentElement.classList.remove('orbiting'); });

  var btn = document.getElementById('next-shape');
  if (btn) btn.addEventListener('click', function () { frame = WAIT + 1; if (reduced) tick(); });

  darkMQ.addEventListener && darkMQ.addEventListener('change', function (e) { dark = e.matches; kind = (kind + 3) % 4; frame = WAIT + 1; if (reduced) tick(); });

  function draw() {
    py += (scrollY - py) * (reduced ? 1 : 0.12);
    vel.x *= 0.9; vel.y *= 0.9; rot.x += vel.x; rot.y += vel.y;
    var f = Math.min(py / FADE_PX, 1);
    canvas.style.opacity = (OP_TOP + (OP_READ - OP_TOP) * f).toFixed(3);
    // rises at ≈ ¼ of scroll speed, then stays in view and keeps turning with the scroll
    holder.position.set(baseX * (1 - f), Math.min(py * 0.04, 30), 0);
    holder.rotation.x = py * 0.0006;
    holder.rotation.y = py * 0.0002;
    pivot.rotation.y = rot.x; pivot.rotation.x = rot.y;
    renderer.render(scene, camera);
  }
  function tick() {
    if (frame > WAIT) { frame = 0; next(); if (reduced) for (var i = 0; i < 30; i++) update(); }
    frame++;
    if (!reduced) update();
    draw();
  }

  size();
  var lastT = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    if (document.hidden || t - lastT < 1000 / FPS) return;
    lastT = t;
    tick();
  }
  if (reduced) tick(); else requestAnimationFrame(loop);
})();
