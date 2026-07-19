(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  function alignWithFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    btn.style.bottom = ((footer.offsetHeight - 42) / 2) + 'px';
  }
  alignWithFooter();
  window.addEventListener('resize', alignWithFooter);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.smoothScrollTo(0, 750));
})();

(function () {
  const btn = document.getElementById('nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

(function () {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  if (window.matchMedia('(hover: none)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  function tick() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CONNECT_DIST = 100;
  const MOUSE_DIST = 150;
  let particles = [];
  let mouse = { x: null, y: null };
  let rafId;

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
    return window.innerWidth < 768 ? 100 : 300;
  }

  function resize() {
    const oldW = canvas.width;
    const oldH = canvas.height;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    if (oldW && oldH && (oldW !== canvas.width || oldH !== canvas.height)) {
      const sx = canvas.width / oldW;
      const sy = canvas.height / oldH;
      particles.forEach(p => { p.x *= sx; p.y *= sy; });
      if (formationPhase) releaseFormation();
    }
    const target = targetCount();
    while (particles.length > target) particles.pop();
    while (particles.length < target) particles.push(new Particle());
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    hero.addEventListener('touchmove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - r.left;
      mouse.y = e.touches[0].clientY - r.top;
    }, { passive: true });
    hero.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
  }

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r = Math.random() * 1.5 + 0.8;
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
      return;
    }
    if (formationPhase === 'disperse' && this.target) {
      this.x += (this.target.x - this.x) * 0.07;
      this.y += (this.target.y - this.y) * 0.07;
      return;
    }
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_DIST) {
        const f = (MOUSE_DIST - d) / MOUSE_DIST;
        this.vx += (dx / d) * f * 0.5;
        this.vy += (dy / d) * f * 0.5;
      }
    }
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  };

  Particle.prototype.draw = function () {
    let alpha = 0.65;
    let r = this.r;
    if (formationPhase === 'form' && this.arrived) {
      alpha = 0.95;
      r += 0.6;
      if (waveX !== null) {
        const d = Math.abs(this.x - waveX);
        if (d < 120) {
          const b = 1 - d / 120;
          alpha = Math.min(1, alpha + b * 0.05);
          r += b * 1.4;
        }
      }
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190,21,73,${alpha})`;
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
    const text = window.innerWidth < 768 ? 'YE' : 'YOUSSEF';
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
    window.__heroIntroManaged = true;
    const content = document.querySelector('.hero-content');
    if (content) content.classList.remove('visible');
  }

  function disperseFormation() {
    particles.forEach(p => { p.target = p.home; });
    formationPhase = 'disperse';
    formationStart = performance.now();
    waveX = null;
    if (window.startHeroTyping) window.startHeroTyping();
  }

  function releaseFormation() {
    formationPhase = null;
    particles.forEach(p => {
      p.target = null;
      p.vx = (Math.random() - 0.5) * 0.45;
      p.vy = (Math.random() - 0.5) * 0.45;
    });
  }

  window.formParticles = formParticles;

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const a = (1 - d / CONNECT_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  formParticles();
})();

(function () {
  const headlineEl = document.getElementById('hero-headline');
  const subtitleEl = document.getElementById('hero-subtitle');
  if (!headlineEl || !subtitleEl) return;

  const HEADLINE = "Hi, I'm Youssef Elshemi";
  const SUBTITLES = ['AWS & .NET Backend Engineer', 'Payments & FX Engineer', 'Distributed Systems Builder'];
  let subIdx = 0;
  let timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function type(el, text, speed, done) {
    let i = 0;
    el.textContent = '';
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(t); if (done) done(); }
    }, speed);
    timers.push(t);
  }

  function erase(el, speed, done) {
    const t = setInterval(() => {
      el.textContent = el.textContent.slice(0, -1);
      if (!el.textContent.length) { clearInterval(t); if (done) done(); }
    }, speed);
    timers.push(t);
  }

  function cycle() {
    type(subtitleEl, SUBTITLES[subIdx], 65, () => {
      later(() => {
        erase(subtitleEl, 40, () => {
          subIdx = (subIdx + 1) % SUBTITLES.length;
          later(cycle, 300);
        });
      }, 2200);
    });
  }

  function startHeroTyping() {
    timers.forEach(clearTimeout);
    timers = [];
    subIdx = 0;
    headlineEl.textContent = '';
    subtitleEl.textContent = '';
    const content = document.querySelector('.hero-content');
    if (content) content.classList.add('visible');
    type(headlineEl, HEADLINE, 55, () => {
      later(cycle, 450);
    });
  }

  window.startHeroTyping = startHeroTyping;

  setTimeout(() => {
    if (!window.__heroIntroManaged) startHeroTyping();
  }, 300);
})();

(function () {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.timeline-item').forEach(el => cardObs.observe(el));

  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-tag').forEach((tag, i) => {
          tag.style.animationDelay = `${i * 55}ms`;
          tag.classList.add('visible');
        });
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.skill-group').forEach(el => skillObs.observe(el));
})();

(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-logo[href^="#"], .nav-links a[href^="#"], .btn[href^="#"]'));

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    if (diff === 0) return;
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  window.smoothScrollTo = smoothScrollTo;

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('nav').offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      smoothScrollTo(targetY, 750);
    });
  });

  const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sectionMap = [];
  sectionLinks.forEach(a => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el && !sectionMap.find(s => s.el === el)) sectionMap.push({ el, a });
  });

  function updateActive() {
    const navHeight = document.querySelector('nav').offsetHeight;
    let current = sectionMap[0];
    sectionMap.forEach(item => {
      if (item.el.getBoundingClientRect().top <= navHeight + 40) current = item;
    });
    sectionLinks.forEach(a => a.classList.remove('active'));
    if (current) current.a.classList.add('active');
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

(function () {
  document.addEventListener('click', function (e) {
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 5;
      const size = 2 + Math.random() * 4;
      p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;border-radius:50%;background:rgba(190,21,73,${0.6+Math.random()*0.4});pointer-events:none;z-index:9995;transform:translate(-50%,-50%);`;
      document.body.appendChild(p);
      let vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
      let x = e.clientX, y = e.clientY, op = 1;
      (function animate() {
        x += vx; y += vy; vy += 0.18; op -= 0.025;
        p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.opacity = op;
        if (op > 0) requestAnimationFrame(animate); else p.remove();
      })();
    }
  });
})();

(function () {
  const els = document.querySelectorAll('.count-up');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      obs.unobserve(el);
      (function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
})();

(function () {
  const sections = ['hero', 'about', 'experience', 'skills', 'contact'];
  const container = document.getElementById('section-dots');
  const dots = sections.map(id => {
    const d = document.createElement('div');
    d.className = 'section-dot';
    d.title = id.charAt(0).toUpperCase() + id.slice(1);
    d.addEventListener('click', () => {
      const target = document.getElementById(id);
      if (!target) return;
      const navH = document.querySelector('nav').offsetHeight;
      const y = target.getBoundingClientRect().top + window.scrollY - (id === 'hero' ? 0 : navH + 16);
      window.smoothScrollTo(y, 750);
    });
    container.appendChild(d);
    return { id, el: d };
  });

  function updateDots() {
    const navH = document.querySelector('nav').offsetHeight;
    let current = dots[0];
    dots.forEach(dot => {
      const sec = document.getElementById(dot.id);
      if (sec && sec.getBoundingClientRect().top <= navH + 40) current = dot;
    });
    dots.forEach(d => d.el.classList.toggle('active', d === current));
  }
  window.addEventListener('scroll', updateDots, { passive: true });
  updateDots();
})();

(function () {
  const el = document.getElementById('hero-headline');
  function glitch() {
    if (!el.textContent) return;
    el.classList.add('glitching');
    el.addEventListener('animationend', () => el.classList.remove('glitching'), { once: true });
    setTimeout(glitch, 4000 + Math.random() * 5000);
  }
  setTimeout(glitch, 3000 + Math.random() * 3000);
})();

(function () {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      timeline.classList.add('line-drawn');
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(timeline);
})();

(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  const nav = document.querySelector('nav');
  function update() {
    const p = Math.min(window.scrollY / 150, 1);
    nav.style.backdropFilter = `blur(${8 + p * 14}px)`;
    nav.style.background = `rgba(13,13,13,${0.82 + p * 0.13})`;
  }
  window.addEventListener('scroll', update, { passive: true });
})();

(function () {
  const bar = document.getElementById('scroll-progress');
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

(function () {
  document.querySelectorAll('.timeline-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      this.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 9}deg) scale(1.025)`;
      this.style.transition = 'transform 0.08s ease';
      this.style.borderColor = 'rgba(190,21,73,0.45)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), border-color 0.3s';
      this.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
      this.style.borderColor = '';
    });
  });
})();

(function () {
  document.querySelectorAll('.btn, .contact-link').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
      this.style.transition = 'transform 0.1s ease, background 0.2s, color 0.2s';
    });
    btn.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      this.style.transform = `translate(${dx * 0.28}px, ${dy * 0.38}px)`;
    });
    btn.addEventListener('mouseleave', function () {
      this.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), background 0.2s, color 0.2s';
      this.style.transform = 'translate(0,0)';
    });
  });
})();

(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  const COUNT = 10;
  const trail = Array.from({ length: COUNT }, (_, i) => {
    const el = document.createElement('div');
    const size = 5 - i * 0.3;
    el.style.cssText = `position:fixed;width:${size}px;height:${size}px;border-radius:50%;background:rgba(190,21,73,${0.55 - i * 0.05});pointer-events:none;z-index:9996;top:0;left:0;`;
    document.body.appendChild(el);
    return { el, x: 0, y: 0 };
  });
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function loop() {
    let px = mx, py = my;
    trail.forEach(p => {
      p.x += (px - p.x) * 0.3;
      p.y += (py - p.y) * 0.3;
      p.el.style.transform = `translate(${p.x - p.el.offsetWidth / 2}px,${p.y - p.el.offsetHeight / 2}px)`;
      px = p.x; py = p.y;
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

(function () {
  const overlay = document.getElementById('terminal-overlay');
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  const toggle = document.getElementById('terminal-toggle');
  if (!overlay || !output || !input || !toggle) return;

  const history = [];
  let historyIdx = -1;
  let booted = false;

  const ghost = document.getElementById('terminal-ghost');
  const CMD_NAMES = ['clear', 'contact', 'exit', 'experience', 'help', 'particles', 'skills', 'sudo', 'whoami'];
  let suggestion = null;

  function updateGhost() {
    suggestion = null;
    if (ghost) ghost.textContent = '';
    const val = input.value;
    if (!val || /\s/.test(val)) return;
    const match = CMD_NAMES.find(c => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
    if (match) {
      suggestion = match;
      if (ghost) ghost.textContent = val + match.slice(val.length);
    }
  }
  input.addEventListener('input', updateGhost);

  const COMMANDS = {
    help: [
      '<span class="t-accent">Available commands:</span>',
      '  whoami       who is this guy',
      '  experience   where I\'ve worked',
      '  skills       what I work with',
      '  contact      how to reach me',
      '  particles    re-run the hero animation',
      '  clear        clear the screen',
      '  exit         close the terminal'
    ].join('\n'),
    whoami: [
      '<span class="t-accent">Youssef Elshemi</span> — Software Engineer, London',
      'Building payment infrastructure in fintech: API integrations',
      'processing billions in payments, containerised services on',
      'Kubernetes, AWS, .NET. BSc Computer Science, University of',
      'Exeter (First Class Honours). English & Arabic.'
    ].join('\n'),
    experience: [
      '<span class="t-accent">Software Engineer</span> · Alpha Group <span class="t-muted">(Jan 2025 – Present)</span>',
      '  K8s migrations, Verification of Payee, BoE compliance',
      '<span class="t-accent">Graduate Software Engineer</span> · Alpha Group <span class="t-muted">(Sep 2023 – Jan 2025)</span>',
      '  Bank API integrations (£25bn+ processed), STP (-90% processing time)',
      '<span class="t-accent">Co-Founder & CTO</span> · DataScrapa <span class="t-muted">(Feb 2023 – Jan 2024)</span>',
      '  AWS serverless data pipeline, millions of records daily'
    ].join('\n'),
    skills: [
      '<span class="t-accent">Languages</span>      C#/.NET Core, Python, TypeScript, Apex',
      '<span class="t-accent">Cloud/DevOps</span>   AWS, Docker, Kubernetes, IaC, CircleCI, Jenkins',
      '<span class="t-accent">Data</span>           PostgreSQL, MongoDB, MySQL, Big Data',
      '<span class="t-accent">Payments</span>       REST APIs, SWIFT, H2H, Open Banking',
      '<span class="t-accent">Engineering</span>    System Design, Distributed Systems, EDA, CI/CD'
    ].join('\n'),
    contact: [
      'email     <a href="mailto:youssef@elshemi.com">youssef@elshemi.com</a>',
      'linkedin  <a href="https://www.linkedin.com/in/youssef-elshemi/" target="_blank" rel="noopener">linkedin.com/in/youssef-elshemi</a>',
      'github    <a href="https://github.com/YoussefElshemi" target="_blank" rel="noopener">github.com/YoussefElshemi</a>'
    ].join('\n')
  };

  function print(html) {
    const line = document.createElement('div');
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function printEcho(cmd) {
    const line = document.createElement('div');
    const prompt = document.createElement('span');
    prompt.className = 't-accent';
    prompt.textContent = '$ ';
    line.appendChild(prompt);
    line.appendChild(document.createTextNode(cmd));
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function fitOverlay() {
    if (overlay.hidden || !window.visualViewport) return;
    overlay.style.top = window.visualViewport.offsetTop + 'px';
    overlay.style.height = window.visualViewport.height + 'px';
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitOverlay);
    window.visualViewport.addEventListener('scroll', fitOverlay);
  }

  function open() {
    overlay.hidden = false;
    fitOverlay();
    if (!booted) {
      booted = true;
      print('<span class="t-muted">elshemi.com terminal — type <span class="t-accent">help</span> to get started.</span>');
    }
    input.focus();
  }

  function close() {
    overlay.hidden = true;
    overlay.style.top = '';
    overlay.style.height = '';
    input.blur();
  }

  function run(raw) {
    const cmd = raw.trim();
    printEcho(cmd);
    if (!cmd) return;
    const name = cmd.split(/\s+/)[0].toLowerCase();
    if (name === 'clear') { output.innerHTML = ''; return; }
    if (name === 'exit') { close(); return; }
    if (name === 'sudo') { print('youssef is not in the sudoers file. This incident will be reported.'); return; }
    if (name === 'particles') {
      print('<span class="t-muted">re-running hero animation…</span>');
      close();
      window.smoothScrollTo(0, 600);
      setTimeout(() => { if (window.formParticles) window.formParticles(); }, 650);
      return;
    }
    if (COMMANDS[name]) { print(COMMANDS[name]); return; }
    const err = document.createElement('div');
    err.textContent = 'command not found: ' + name;
    output.appendChild(err);
    print('<span class="t-muted">type <span class="t-accent">help</span> for available commands</span>');
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestion) { input.value = suggestion; updateGhost(); }
    } else if (e.key === 'Enter') {
      const val = input.value;
      if (val.trim()) { history.push(val); }
      historyIdx = history.length;
      input.value = '';
      updateGhost();
      run(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; updateGhost(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; }
      else { historyIdx = history.length; input.value = ''; }
      updateGhost();
    }
  });

  toggle.addEventListener('click', () => { overlay.hidden ? open() : close(); });

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.getElementById('terminal-window').addEventListener('click', e => {
    if (e.target.closest('a')) return;
    if (window.getSelection().toString()) return;
    input.focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key === '`' && overlay.hidden && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      open();
    } else if (e.key === 'Escape' && !overlay.hidden) {
      close();
    }
  });
})();
