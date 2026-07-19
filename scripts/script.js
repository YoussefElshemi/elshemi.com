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

  if (window.innerWidth < 768) { canvas.style.display = 'none'; return; }

  const COUNT = 300;
  const CONNECT_DIST = 100;
  const MOUSE_DIST = 150;
  let particles = [];
  let mouse = { x: null, y: null };
  let rafId;

  function resize() {
    if (window.innerWidth < 768) {
      canvas.style.display = 'none';
      cancelAnimationFrame(rafId);
      return;
    }
    canvas.style.display = '';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  const hero = document.getElementById('hero');
  if (hero) hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r = Math.random() * 1.5 + 0.8;
  }

  Particle.prototype.update = function () {
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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190,21,73,0.65)';
    ctx.fill();
  };

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    rafId = requestAnimationFrame(loop);
  }
  loop();
})();

(function () {
  const headlineEl = document.getElementById('hero-headline');
  const subtitleEl = document.getElementById('hero-subtitle');
  if (!headlineEl || !subtitleEl) return;

  const HEADLINE = "Hi, I'm Youssef Elshemi";
  const SUBTITLES = ['AWS & .NET Backend Engineer', 'Payments & FX Engineer', 'Distributed Systems Builder'];
  let subIdx = 0;

  function type(el, text, speed, done) {
    let i = 0;
    el.textContent = '';
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(t); if (done) done(); }
    }, speed);
  }

  function erase(el, speed, done) {
    const t = setInterval(() => {
      el.textContent = el.textContent.slice(0, -1);
      if (!el.textContent.length) { clearInterval(t); if (done) done(); }
    }, speed);
  }

  function cycle() {
    type(subtitleEl, SUBTITLES[subIdx], 65, () => {
      setTimeout(() => {
        erase(subtitleEl, 40, () => {
          subIdx = (subIdx + 1) % SUBTITLES.length;
          setTimeout(cycle, 300);
        });
      }, 2200);
    });
  }

  type(headlineEl, HEADLINE, 55, () => {
    setTimeout(cycle, 450);
  });
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
    bar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
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
