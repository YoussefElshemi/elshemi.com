window.initParticles = function (options) {
  options = options || {};
  var formation = !!options.formation;
  var formText = options.formText || null;
  var onFormationStart = options.onFormationStart || null;
  var onDisperse = options.onDisperse || null;

  if (window.__particles2DStarted) return { formParticles: null, setTheme: function () {} };
  window.__particles2DStarted = true;

  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return { formParticles: null, setTheme: function () {} };
  const ctx = canvas.getContext('2d');
  if (!ctx) return { formParticles: null, setTheme: function () {} };

  function getFormText() {
    if (typeof formText === 'function') return formText();
    if (formText) return formText;
    return window.innerWidth < 768 ? 'YE' : 'YOUSSEF';
  }

  const CONNECT_DIST = 100;
  const MOUSE_DIST = 150;
  let particles = [];
  let mouse = { x: null, y: null };
  let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  let rotX = 0, rotY = 0;
  let cosRY = 1, sinRY = 0, cosRX = 1, sinRX = 0;
  let overflowPx = 150;

  const BASE_CHARS = 7;
  const FORM_HOLD_MS = 2200;
  const DISPERSE_MS = 1400;
  const SWIRL_MS = 1200;
  const STAGGER_MS = 400;
  let swirlMs = SWIRL_MS;
  let staggerMs = STAGGER_MS;
  let holdMs = FORM_HOLD_MS;
  let formationPhase = null;
  let formationStart = null;
  let waveX = null;

  function targetCount() {
    return window.innerWidth < 768 ? 200 : 500;
  }

  function resize() {
    const oldW = canvas.width;
    const oldH = canvas.height;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    overflowPx = Math.round(canvas.width * 0.12);
    if (oldW && oldH && (oldW !== canvas.width || oldH !== canvas.height)) {
      const sx = canvas.width / oldW;
      const sy = canvas.height / oldH;
      particles.forEach(p => {
        p.x *= sx; p.y *= sy;
        if (p.home)  { p.home.x  *= sx; p.home.y  *= sy; }
        if (p.start) { p.start.x *= sx; p.start.y *= sy; }
        if (p.ctrl)  { p.ctrl.x  *= sx; p.ctrl.y  *= sy; }
      });
      if (formation && formationPhase === 'form') {
        const text = getFormText();
        const points = sampleTextPoints(text);
        if (points.length) {
          const scale = text.length / BASE_CHARS;
          swirlMs   = SWIRL_MS   * scale;
          staggerMs = STAGGER_MS * scale;
          holdMs    = FORM_HOLD_MS * scale;
          particles.forEach((p, i) => {
            p.target = points[Math.floor((i / particles.length) * points.length)];
            const mx = (p.start.x + p.target.x) / 2;
            const my = (p.start.y + p.target.y) / 2;
            const dx = p.target.x - p.start.x;
            const dy = p.target.y - p.start.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const bow = (Math.random() - 0.5) * 2 * Math.min(180, len * 0.5);
            p.ctrl = { x: mx - (dy / len) * bow, y: my + (dx / len) * bow };
            p.delay = (p.target.x / canvas.width) * staggerMs;
            p.arrived = false;
          });
        }
      }
    }
    const target = targetCount();
    while (particles.length > target) particles.pop();
    while (particles.length < target) particles.push(new Particle());
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', e => { if (!e.relatedTarget) { mouse.x = null; mouse.y = null; } });
  document.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
  document.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let ps = 1, ox = 0, oy = 0;
    for (let k = 0; k < 5; k++) {
      ox = (px - cx) / (ps * (cosRY || 1));
      oy = ((py - cy) / ps - ox * sinRY * sinRX) / (cosRX || 1);
      const z2 = oy * sinRX - ox * sinRY * cosRX;
      ps = 300 / Math.max(1, 300 - z2);
    }
    for (let i = 0; i < 6; i++) {
      const p = new Particle();
      p.x = cx + ox + (Math.random() - 0.5) * 4;
      p.y = cy + oy + (Math.random() - 0.5) * 4;
      p.baseZ = 0;
      p.z = 0;
      p.sx = px;
      p.sy = py;
      p.vx = (Math.random() - 0.5) * 0.3;
      p.vy = (Math.random() - 0.5) * 0.3;
      particles.push(p);
    }
    while (particles.length > Math.round(targetCount() * 1.1)) particles.shift();
  });

  function Particle() {
    this.x = -overflowPx + Math.random() * (canvas.width + 2 * overflowPx);
    this.y = -overflowPx + Math.random() * (canvas.height + 2 * overflowPx);
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r = Math.random() * 1.5 + 0.8;
    this.baseZ = (Math.random() - 0.5) * 80;
    this.z = this.baseZ;
    this.phase = Math.random() * Math.PI * 2;
    this.sx = this.x;
    this.sy = this.y;
    this.secondary = Math.random() < 0.3;
  }

  Particle.prototype.update = function () {
    if (formationPhase === 'form' && this.target) {
      if (formationStart === null) return;
      const t = Math.min(1, Math.max(0, (performance.now() - formationStart - this.delay) / swirlMs));
      const e = 1 - Math.pow(1 - t, 3);
      const u = 1 - e;
      this.x = u * u * this.start.x + 2 * u * e * this.ctrl.x + e * e * this.target.x;
      this.y = u * u * this.start.y + 2 * u * e * this.ctrl.y + e * e * this.target.y;
      this.arrived = t >= 1;
      this.z = this.baseZ * (1 - e);
      return;
    }
    if (formationPhase === 'disperse' && this.target) {
      this.x += (this.target.x - this.x) * 0.07;
      this.y += (this.target.y - this.y) * 0.07;
      this.z += (this.baseZ - this.z) * 0.07;
      return;
    }
    if (mouse.x !== null) {
      const dx = mouse.x - this.sx;
      const dy = mouse.y - this.sy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0 && d < MOUSE_DIST) {
        const f = (MOUSE_DIST - d) / MOUSE_DIST;
        this.vx += (dx / d) * f * 0.5;
        this.vy += (dy / d) * f * 0.5;
      }
    }
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -overflowPx || this.x > canvas.width + overflowPx) this.vx *= -1;
    if (this.y < -overflowPx || this.y > canvas.height + overflowPx) this.vy *= -1;
    this.z = this.baseZ + Math.sin(performance.now() / 800 + this.phase) * 12;
  };

  Particle.prototype.draw = function () {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    const ox = this.x - cx;
    const oy = this.y - cy;
    const x1 = ox * cosRY + this.z * sinRY;
    const z1 = -ox * sinRY + this.z * cosRY;
    const y2 = oy * cosRX - z1 * sinRX;
    const z2 = oy * sinRX + z1 * cosRX;
    const pScale = 300 / Math.max(1, 300 - z2);
    this.sx = cx + x1 * pScale;
    this.sy = cy + y2 * pScale;
    let alpha = 0.65;
    let r = this.r * pScale;
    if (formationPhase === 'form' && this.arrived) {
      alpha = 0.95;
      r += 0.6;
      if (waveX !== null) {
        const d = Math.abs(this.sx - waveX);
        if (d < 120) {
          const b = 1 - d / 120;
          alpha = Math.min(1, alpha + b * 0.05);
          r += b * 1.4;
        }
      }
    }
    const depthFactor = Math.min(1.0, Math.max(0.6, 0.6 + 0.4 * ((z2 + 60) / 120)));
    alpha *= depthFactor;
    ctx.beginPath();
    ctx.arc(this.sx, this.sy, Math.max(0.1, r), 0, Math.PI * 2);
    ctx.fillStyle = this.secondary
      ? isDark ? `rgba(255,255,255,${alpha})` : `rgba(25,25,25,${alpha})`
      : `rgba(190,21,73,${alpha})`;
    ctx.fill();
  };

  function sampleTextPoints(text) {
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d');
    const fontSize = Math.min((canvas.width * 0.9) / (text.length * 0.62), canvas.height * 0.35);
    octx.font = '700 ' + fontSize + 'px Inter, sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = '#fff';
    octx.fillText(text, off.width / 2, off.height / 2);
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    const points = [];
    const stride = 4;
    for (let y = 0; y < off.height; y += stride) {
      for (let x = 0; x < off.width; x += stride) {
        if (data[(y * off.width + x) * 4 + 3] > 128) points.push({ x, y });
      }
    }
    return points;
  }

  function formParticles() {
    if (!canvas.width || !canvas.height) return;
    const text = getFormText();
    const points = sampleTextPoints(text);
    if (!points.length) return;
    const scale = text.length / BASE_CHARS;
    swirlMs = SWIRL_MS * scale;
    staggerMs = STAGGER_MS * scale;
    holdMs = FORM_HOLD_MS * scale;
    particles.forEach((p, i) => {
      p.home = { x: p.x, y: p.y };
      p.start = { x: p.x, y: p.y };
      p.target = points[Math.floor((i / particles.length) * points.length)];
      const mx = (p.x + p.target.x) / 2;
      const my = (p.y + p.target.y) / 2;
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const bow = (Math.random() - 0.5) * 2 * Math.min(180, len * 0.5);
      p.ctrl = { x: mx - (dy / len) * bow, y: my + (dx / len) * bow };
      p.delay = (p.target.x / canvas.width) * staggerMs;
      p.arrived = false;
    });
    formationPhase = 'form';
    formationStart = null;
    if (onFormationStart) onFormationStart();
  }

  function disperseFormation() {
    particles.forEach(p => { p.target = p.home; });
    formationPhase = 'disperse';
    formationStart = performance.now();
    waveX = null;
    if (onDisperse) onDisperse();
  }

  function releaseFormation() {
    formationPhase = null;
    particles.forEach(p => {
      p.target = null;
      p.vx = (Math.random() - 0.5) * 0.45;
      p.vy = (Math.random() - 0.5) * 0.45;
    });
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].sx - particles[j].sx;
        const dy = particles[i].sy - particles[j].sy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const a = (1 - d / CONNECT_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].sx, particles[i].sy);
          ctx.lineTo(particles[j].sx, particles[j].sy);
          ctx.strokeStyle = `rgba(190,21,73,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    if (formationPhase) {
      if (formationStart === null) {
        if (!document.hidden) formationStart = performance.now();
      } else if (formationPhase === 'form') {
        const formed = performance.now() - formationStart - swirlMs - staggerMs;
        waveX = formed > 0 ? -150 + (formed / holdMs) * (canvas.width + 300) : null;
        if (formed > holdMs) disperseFormation();
      } else if (formationPhase === 'disperse' && performance.now() - formationStart > DISPERSE_MS) {
        releaseFormation();
      }
    }
    const targetRotY = mouse.x !== null ? (mouse.x / canvas.width  - 0.5) * 0.25 : 0;
    const targetRotX = mouse.y !== null ? (mouse.y / canvas.height - 0.5) * 0.15 : 0;
    rotY += (targetRotY - rotY) * 0.05;
    rotX += (targetRotX - rotX) * 0.05;
    cosRY = Math.cos(rotY); sinRY = Math.sin(rotY);
    cosRX = Math.cos(rotX); sinRX = Math.sin(rotX);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(loop);
  }

  loop();
  if (formation) formParticles();

  return {
    formParticles: formation ? formParticles : null,
    setTheme(theme) { isDark = theme !== 'light'; },
  };
};
