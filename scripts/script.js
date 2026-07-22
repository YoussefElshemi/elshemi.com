(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  function alignWithFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const bottom = ((footer.offsetHeight - 42) / 2) + 'px';
    btn.style.bottom = bottom;
    const terminal = document.getElementById('terminal-toggle');
    if (terminal) terminal.style.bottom = bottom;
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


setTimeout(() => {
  if (window.__particles2DStarted) return;
  const p = window.initParticles({
    formation: true,
    onFormationStart() {
      window.__heroIntroManaged = true;
      const content = document.querySelector('.hero-content');
      if (content) content.classList.remove('visible');
    },
    onDisperse() {
      if (window.startHeroTyping) window.startHeroTyping();
    },
  });
  window.formParticles = p.formParticles;
  window.__particlesSetTheme = p.setTheme;
}, 150);

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
        const children = Array.from(e.target.children);
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 80}ms`;
        });
        e.target.classList.add('visible');
        setTimeout(() => {
          children.forEach(child => { child.style.transitionDelay = ''; });
        }, children.length * 80 + 900);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  const twObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const text = el.dataset.typewriter;
      let i = 0;
      el.textContent = '';
      el.classList.add('tw-typing');
      const tick = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, 55);
        else el.classList.remove('tw-typing');
      };
      setTimeout(tick, 200);
      twObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-typewriter]').forEach(el => twObs.observe(el));

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
    nav.style.background = `rgba(var(--nav-bg-rgb), ${0.82 + p * 0.13})`;
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
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const max = parseFloat(el.getAttribute('data-tilt-max')) || 8;
    el.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      this.style.transition = 'transform 0.08s ease';
      this.style.transform = `perspective(700px) rotateY(${x * max}deg) rotateX(${-y * max * 0.65}deg) scale(1.02)`;
      this.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`);
      this.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`);
    });
    el.addEventListener('mouseleave', function () {
      this.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      this.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  });
})();

(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  const els = Array.from(document.querySelectorAll('[data-magnetic]'));
  if (!els.length) return;
  const ring = document.getElementById('cursor-ring');
  const state = els.map(el => ({ el, s: parseFloat(el.getAttribute('data-magnetic')) || 0.3, active: false }));
  let hoverCount = 0;

  window.addEventListener('mousemove', e => {
    state.forEach(item => {
      const r = item.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const zone = Math.max(r.width, r.height) / 2 + 70;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < zone) {
        if (!item.active) {
          item.active = true;
          item.el.style.transition = 'transform 0.12s ease-out, background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s';
          hoverCount++;
          if (ring) ring.classList.add('magnet-hover');
        }
        const f = 1 - d / zone;
        item.el.style.transform = `translate(${dx * f * item.s}px, ${dy * f * item.s}px)`;
      } else if (item.active) {
        item.active = false;
        hoverCount = Math.max(0, hoverCount - 1);
        if (ring && hoverCount === 0) ring.classList.remove('magnet-hover');
        item.el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s';
        item.el.style.transform = 'translate(0, 0)';
      }
    });
  }, { passive: true });
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

  const HISTORY_KEY = 'terminal_history';
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  let historyIdx = history.length;
  let booted = false;

  const ghost = document.getElementById('terminal-ghost');
  const CMD_NAMES = ['cat', 'cd', 'clear', 'contact', 'date', 'echo', 'exit', 'experience', 'help', 'ls', 'man', 'matrix', 'neofetch', 'particles', 'ping', 'pwd', 'skills', 'sudo', 'theme', 'uname', 'whoami'];
  let suggestion = null;
  let cycleMatches = [];
  let cycleIdx = -1;
  let activeMatrixTeardown = null;

  function updateGhost() {
    suggestion = null;
    if (ghost) ghost.textContent = '';
    const val = input.value;
    if (!val) return;
    const spaceIdx = val.indexOf(' ');
    if (spaceIdx === -1) {
      const match = CMD_NAMES.find(c => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
      if (match) {
        suggestion = match;
        if (ghost) ghost.textContent = val + match.slice(val.length);
      }
    } else {
      const base = val.slice(0, spaceIdx).toLowerCase();
      const arg = val.slice(spaceIdx + 1);
      const ARG_COMPLETIONS = {
        man: CMD_NAMES,
        cd: ['about', 'contact', 'experience', 'skills', '..', '~'],
        cat: ['about.txt', 'contact.txt', 'experience.txt', 'skills.txt'],
        ls: ['-la'],
        theme: ['dark', 'light'],
        ping: ['elshemi.com']
      };
      const completions = ARG_COMPLETIONS[base];
      if (completions) {
        const match = completions.find(c => c.startsWith(arg.toLowerCase()) && c !== arg.toLowerCase());
        if (match) {
          suggestion = val.slice(0, spaceIdx + 1) + match;
          if (ghost) ghost.textContent = suggestion;
        }
      }
    }
  }
  input.addEventListener('input', () => { cycleMatches = []; cycleIdx = -1; updateGhost(); });

  const COMMANDS = {
    help: [
      '<span class="t-accent">Available commands:</span>',
      '  whoami       who is this guy',
      '  experience   where I\'ve worked',
      '  skills       what I work with',
      '  contact      how to reach me',
      '  particles    re-run the hero animation',
      '  theme        switch light/dark mode',
      '  clear        clear the screen',
      '  exit         close the terminal',
      '  ls           list site sections',
      '  cd           navigate to a section',
      '  pwd          print working directory',
      '  cat          print file contents',
      '  echo         write arguments to stdout',
      '  date         display current date and time',
      '  ping         send ICMP packets to a host',
      '  uname        print system information',
      '  neofetch     display system info with style',
      '  man          display manual for a command',
      '  matrix       enter the matrix'
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
      'email     <a href="mailto:youssef@elshemi.com" target="_blank" rel="noopener">youssef@elshemi.com</a>',
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

  const win = document.getElementById('terminal-window');

  function open() {
    overlay.hidden = false;
    win.classList.remove('minimized');
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
    win.classList.remove('minimized', 'fullscreen');
    win.style.left = '';
    win.style.top = '';
    win.style.transform = '';
    input.blur();
  }

  function reset() {
    output.innerHTML = '';
    history.length = 0;
    historyIdx = -1;
    booted = false;
    if (ghost) ghost.textContent = '';
    suggestion = null;
    input.value = '';
  }

  const dotClose = document.querySelector('.dot-close');
  const dotMin   = document.querySelector('.dot-min');
  const dotMax   = document.querySelector('.dot-max');
  if (dotClose) dotClose.addEventListener('click', e => { e.stopPropagation(); reset(); close(); });
  if (dotMin)   dotMin.addEventListener('click',   e => { e.stopPropagation(); close(); });
  if (dotMax)   dotMax.addEventListener('click',   e => {
    e.stopPropagation();
    win.classList.remove('minimized');
    win.classList.toggle('fullscreen');
    input.focus();
  });

  const titlebar = document.querySelector('.terminal-titlebar');
  if (titlebar) {
    let dragStartX, dragStartY, dragOrigLeft, dragOrigTop;

    titlebar.addEventListener('pointerdown', e => {
      if (win.classList.contains('fullscreen')) return;
      if (e.target.classList.contains('terminal-dot')) return;

      const overlayRect = overlay.getBoundingClientRect();
      const winRect = win.getBoundingClientRect();

      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOrigLeft = winRect.left - overlayRect.left;
      dragOrigTop  = winRect.top  - overlayRect.top;

      win.style.transform = 'none';
      win.style.left = dragOrigLeft + 'px';
      win.style.top  = dragOrigTop  + 'px';

      titlebar.setPointerCapture(e.pointerId);
    });

    titlebar.addEventListener('pointermove', e => {
      if (!titlebar.hasPointerCapture(e.pointerId)) return;

      const overlayRect = overlay.getBoundingClientRect();
      const winRect = win.getBoundingClientRect();
      const maxLeft = overlayRect.width  - winRect.width;
      const maxTop  = overlayRect.height - winRect.height;

      const newLeft = Math.min(Math.max(0, dragOrigLeft + (e.clientX - dragStartX)), maxLeft);
      const newTop  = Math.min(Math.max(0, dragOrigTop  + (e.clientY - dragStartY)), maxTop);

      win.style.left = newLeft + 'px';
      win.style.top  = newTop  + 'px';
    });

    titlebar.addEventListener('pointerup', e => {
      titlebar.releasePointerCapture(e.pointerId);
    });
  }

  function run(raw) {
    if (activeMatrixTeardown) { activeMatrixTeardown(); activeMatrixTeardown = null; }
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
    if (name === 'theme') {
      const arg = (cmd.split(/\s+/)[1] || '').toLowerCase();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      if (arg === 'light' || arg === 'dark') {
        if (window.__applyTheme) window.__applyTheme(arg);
        print('<span class="t-muted">theme set to ' + arg + '</span>');
      } else if (!arg) {
        print('<span class="t-muted">current theme: ' + current + ' — usage: theme light|dark</span>');
      } else {
        print('<span class="t-muted">usage: theme light|dark</span>');
      }
      return;
    }
    if (name === 'matrix') {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const mcW = output.clientWidth;
      const mcH = output.clientHeight;
      const mc = document.createElement('canvas');
      mc.width = mcW;
      mc.height = mcH;
      output.style.position = 'relative';
      mc.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer;';
      output.appendChild(mc);
      const mctx = mc.getContext('2d');
      const cols = Math.floor(mcW / 14);
      const drops = Array.from({length: cols}, () => Math.random() * -(mcH / 14));
      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'.split('');
      let rafId;
      function drawMatrix() {
        mctx.fillStyle = isLight ? 'rgba(245,235,238,0.18)' : 'rgba(10,0,2,0.09)';
        mctx.fillRect(0, 0, mcW, mcH);
        mctx.font = '14px "Fira Code", monospace';
        drops.forEach((y, i) => {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const b = Math.random();
          mctx.fillStyle = isLight
            ? (b > 0.95 ? '#5a0820' : b > 0.6 ? '#8b1530' : '#c05070')
            : (b > 0.95 ? '#ffb3cc' : b > 0.6 ? '#be1549' : '#6b0c29');
          mctx.fillText(ch, i * 14, y * 14);
          drops[i] = y > mcH / 14 && Math.random() > 0.975 ? 0 : y + 1;
        });
        rafId = requestAnimationFrame(drawMatrix);
      }
      rafId = requestAnimationFrame(drawMatrix);
      function matrixTeardown() {
        cancelAnimationFrame(rafId);
        mc.remove();
        output.style.position = '';
        document.removeEventListener('keydown', matrixKey, true);
        activeMatrixTeardown = null;
      }
      function matrixKey(e) {
        if (e.key === 'Escape') { e.stopImmediatePropagation(); matrixTeardown(); }
      }
      document.addEventListener('keydown', matrixKey, true);
      mc.addEventListener('click', matrixTeardown);
      activeMatrixTeardown = matrixTeardown;
      return;
    }
    if (name === 'date') {
      print(new Date().toString());
      return;
    }
    if (name === 'echo') {
      print(cmd.slice(4).trim());
      return;
    }
    if (name === 'ping') {
      const host = cmd.slice(4).trim() || 'elshemi.com';
      const times = Array.from({length: 4}, () => (1 + Math.random() * 12).toFixed(1));
      const nums = times.map(Number);
      const avg = (nums.reduce((a, b) => a + b, 0) / 4).toFixed(1);
      print('PING ' + host + ': 56 data bytes');
      times.forEach((t, i) => {
        setTimeout(() => {
          print('64 bytes from ' + host + ': icmp_seq=' + i + ' ttl=64 time=' + t + ' ms');
        }, (i + 1) * 800);
      });
      setTimeout(() => {
        print('--- ' + host + ' ping statistics ---');
        print('4 packets transmitted, 4 received, 0.0% packet loss');
        print('round-trip min/avg/max = ' + Math.min(...nums).toFixed(1) + '/' + avg + '/' + Math.max(...nums).toFixed(1) + ' ms');
      }, 5 * 800);
      return;
    }
    if (name === 'neofetch') {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const uptime = Math.floor(performance.now() / 1000);
      const ua = navigator.userAgent;
      const browser = /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Browser';
      const particleCount = window.innerWidth < 768 ? 200 : 500;
      const a = '<span class="t-accent">';
      const z = '</span>';
      const logo = [
        '  ............................  ',
        ' .............................. ',
        '................................',
        '..........    ....    ..........',
        '...........    ..    ...........',
        '............        ............',
        '.............      .............',
        '..............    ..............',
        '..............    ..............',
        '..............    ..............',
        '................................',
        ' .............................. ',
        '  ............................  ',
      ];
      const info = [
        'youssef@elshemi.com',
        a + '───────────────────' + z,
        'OS:         elshemi.com v1.0',
        'Host:       ' + browser,
        'Uptime:     ' + uptime + 's',
        'Shell:      bash (simulated)',
        'Theme:      ' + theme,
        'Particles:  ' + particleCount,
        'Location:   London, UK',
        'Languages:  C#, Python, TypeScript',
      ];
      const infoStart = 3;
      print(logo.map((l, i) => {
        const infoIdx = i - infoStart;
        return a + l + z + (infoIdx >= 0 && infoIdx < info.length ? '   ' + info[infoIdx] : '');
      }).join('\n'));
      return;
    }
    if (name === 'man') {
      const topic = cmd.slice(3).trim().toLowerCase();
      if (!topic) { print('<span class="t-muted">usage: man [command]</span>'); return; }
      const pages = {
        whoami:    'NAME\n    whoami - print current user\n\nSYNOPSIS\n    whoami\n\nDESCRIPTION\n    Displays the name of the current user of this terminal.',
        help:      'NAME\n    help - list available commands\n\nSYNOPSIS\n    help\n\nDESCRIPTION\n    Prints a summary of all commands supported by this terminal.',
        ls:        'NAME\n    ls - list site sections\n\nSYNOPSIS\n    ls [-la]\n\nDESCRIPTION\n    Without flags, lists site sections. With -la shows a long listing with permissions and sizes.',
        pwd:       'NAME\n    pwd - print working directory\n\nSYNOPSIS\n    pwd\n\nDESCRIPTION\n    Outputs the current working directory path.',
        cat:       'NAME\n    cat - print file contents\n\nSYNOPSIS\n    cat [file]\n\nDESCRIPTION\n    Prints the contents of the given file. Supported files: about.txt, experience.txt, skills.txt, contact.txt.',
        cd:        'NAME\n    cd - navigate to a section\n\nSYNOPSIS\n    cd [section]\n\nDESCRIPTION\n    Scrolls to the given section and closes the terminal. Sections: about, experience, skills, contact. Use cd or cd ~ to return to the top.',
        echo:      'NAME\n    echo - write arguments to stdout\n\nSYNOPSIS\n    echo [text]\n\nDESCRIPTION\n    Writes the given text to the terminal output.',
        date:      'NAME\n    date - display current date and time\n\nSYNOPSIS\n    date\n\nDESCRIPTION\n    Prints the current date and time from your system clock.',
        ping:      'NAME\n    ping - send ICMP packets to a host\n\nSYNOPSIS\n    ping [host]\n\nDESCRIPTION\n    Sends 4 simulated ICMP packets to the given host and prints round-trip statistics.',
        uname:     'NAME\n    uname - print system information\n\nSYNOPSIS\n    uname\n\nDESCRIPTION\n    Prints system information about the current environment.',
        neofetch:  'NAME\n    neofetch - display system information with style\n\nSYNOPSIS\n    neofetch\n\nDESCRIPTION\n    Prints a summary of the current environment including theme, uptime, and particle count.',
        matrix:    'NAME\n    matrix - enter the matrix\n\nSYNOPSIS\n    matrix\n\nDESCRIPTION\n    Renders a Matrix rain animation inside the terminal. Click the canvas or press ESC to stop.',
        theme:     'NAME\n    theme - toggle light/dark mode\n\nSYNOPSIS\n    theme [light|dark]\n\nDESCRIPTION\n    Without arguments, shows the current theme. With an argument, switches to that theme.',
        particles: 'NAME\n    particles - re-run the hero animation\n\nSYNOPSIS\n    particles\n\nDESCRIPTION\n    Scrolls to the top and replays the particle formation animation.',
        clear:     'NAME\n    clear - clear the terminal\n\nSYNOPSIS\n    clear\n\nDESCRIPTION\n    Removes all output from the terminal screen.',
        exit:      'NAME\n    exit - close the terminal\n\nSYNOPSIS\n    exit\n\nDESCRIPTION\n    Closes the terminal overlay.',
        sudo:      'NAME\n    sudo - execute a command as superuser\n\nSYNOPSIS\n    sudo [command]\n\nDESCRIPTION\n    You are not in the sudoers file. This incident will be reported.'
      };
      if (!pages[topic]) { print('No manual entry for ' + topic); return; }
      print(pages[topic]);
      return;
    }
    if (name === 'ls') {
      const arg = cmd.slice(2).trim();
      if (arg === '-la') {
        print([
          'total 9',
          'drwxr-xr-x  <span class="t-accent">hero/</span>            4.2K  Jan 25 2025',
          'drwxr-xr-x  <span class="t-accent">about/</span>           2.1K  Jan 25 2025',
          'drwxr-xr-x  <span class="t-accent">experience/</span>      8.4K  Jan 25 2025',
          'drwxr-xr-x  <span class="t-accent">skills/</span>          3.7K  Jan 25 2025',
          'drwxr-xr-x  <span class="t-accent">contact/</span>         1.8K  Jan 25 2025',
          '-rw-r--r--  about.txt           512  Jan 25 2025',
          '-rw-r--r--  experience.txt      1.2K  Jan 25 2025',
          '-rw-r--r--  skills.txt           892  Jan 25 2025',
          '-rw-r--r--  contact.txt          256  Jan 25 2025'
        ].join('\n'));
      } else {
        print('<span class="t-accent">hero/</span>  <span class="t-accent">about/</span>  <span class="t-accent">experience/</span>  <span class="t-accent">skills/</span>  <span class="t-accent">contact/</span>  about.txt  experience.txt  skills.txt  contact.txt');
      }
      return;
    }
    if (name === 'pwd') {
      print('/home/youssef/elshemi.com');
      return;
    }
    if (name === 'uname') {
      print('Darwin elshemi.com 23.0.0 Browser x86_64 JavaScript');
      return;
    }
    if (name === 'cat') {
      const arg = cmd.slice(3).trim();
      if (arg === 'about.txt') {
        print('Software engineer with 3 years of experience building payment infrastructure in fintech. Working across the full stack — from API integrations processing billions in payments to containerised services on Kubernetes. AWS, .NET, and distributed systems.');
      } else if (arg === 'experience.txt') {
        print(COMMANDS.experience);
      } else if (arg === 'skills.txt') {
        print(COMMANDS.skills);
      } else if (arg === 'contact.txt') {
        print(COMMANDS.contact);
      } else {
        print('cat: ' + (arg || '(no file)') + ': No such file or directory');
      }
      return;
    }
    if (name === 'cd') {
      const arg = cmd.slice(2).trim().toLowerCase();
      const sections = ['about', 'experience', 'skills', 'contact'];
      if (!arg || arg === '~' || arg === '..') {
        window.smoothScrollTo(0, 600);
        close();
        return;
      }
      if (sections.includes(arg)) {
        const el = document.getElementById(arg);
        if (el) {
          const navH = document.querySelector('nav')?.offsetHeight ?? 0;
          window.smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - navH - 16, 750);
        }
        close();
        return;
      }
      print('<span class="t-muted">bash: cd: ' + arg + ': No such file or directory</span>');
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
      if (input.value.indexOf(' ') === -1) {
        if (cycleIdx === -1) {
          cycleMatches = CMD_NAMES.filter(c => c.startsWith(input.value.toLowerCase()) && c !== input.value.toLowerCase());
          if (cycleMatches.length === 0) return;
          cycleIdx = 0;
        } else {
          cycleIdx = (cycleIdx + 1) % cycleMatches.length;
        }
        input.value = cycleMatches[cycleIdx];
        updateGhost();
      } else {
        if (suggestion) { input.value = suggestion; cycleMatches = []; cycleIdx = -1; updateGhost(); }
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (suggestion) { input.value = suggestion; cycleMatches = []; cycleIdx = -1; updateGhost(); }
    } else if (e.key === 'Enter') {
      cycleMatches = []; cycleIdx = -1;
      const val = input.value;
      if (val.trim()) { history.push(val); localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
      historyIdx = history.length;
      input.value = '';
      updateGhost();
      run(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cycleMatches = []; cycleIdx = -1;
      if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; updateGhost(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cycleMatches = []; cycleIdx = -1;
      if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; }
      else { historyIdx = history.length; input.value = ''; }
      updateGhost();
    }
  });

  window.__terminalOpen = open;
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

(function () {
  const btn = document.getElementById('theme-toggle');
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (window.__particlesSetTheme) window.__particlesSetTheme(theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
  window.__applyTheme = apply;
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    if (document.startViewTransition) {
      const r = btn.getBoundingClientRect();
      document.documentElement.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
      document.documentElement.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
      document.startViewTransition(() => apply(next));
    } else {
      apply(next);
    }
  });
})();

(function () {
  const overlay = document.getElementById('palette-overlay');
  const input = document.getElementById('palette-input');
  const results = document.getElementById('palette-results');
  if (!overlay || !input || !results) return;

  const NAV_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  const ACT_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const navH = document.querySelector('nav')?.offsetHeight ?? 0;
    window.smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - navH - 16, 750);
  }

  const ITEMS = [
    { section: 'Navigation', label: 'Home',             icon: NAV_ICON, kbd: null, action: () => window.smoothScrollTo(0, 750) },
    { section: 'Navigation', label: 'About',            icon: NAV_ICON, kbd: null, action: () => scrollToSection('about') },
    { section: 'Navigation', label: 'Experience',       icon: NAV_ICON, kbd: null, action: () => scrollToSection('experience') },
    { section: 'Navigation', label: 'Skills',           icon: NAV_ICON, kbd: null, action: () => scrollToSection('skills') },
    { section: 'Navigation', label: 'Contact',          icon: NAV_ICON, kbd: null, action: () => scrollToSection('contact') },
    { section: 'Actions',    label: 'Toggle Theme',     icon: ACT_ICON, kbd: null, action: () => { const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; if (window.__applyTheme) window.__applyTheme(next); } },
    { section: 'Actions',    label: 'Open Terminal',    icon: ACT_ICON, kbd: '`',  action: () => { if (window.__terminalOpen) window.__terminalOpen(); } },
    { section: 'Actions',    label: 'Re-run Particles', icon: ACT_ICON, kbd: null, action: () => { window.smoothScrollTo(0, 600); setTimeout(() => { if (window.formParticles) window.formParticles(); }, 650); } },
    { section: 'Actions',    label: 'Back to Top',      icon: ACT_ICON, kbd: null, action: () => window.smoothScrollTo(0, 750) },
  ];

  let activeIdx = 0;
  let filtered = ITEMS.slice();

  function render() {
    results.innerHTML = '';
    const query = input.value.trim().toLowerCase();
    filtered = query ? ITEMS.filter(item => item.label.toLowerCase().includes(query)) : ITEMS.slice();
    if (activeIdx >= filtered.length) activeIdx = 0;
    let lastSection = null;
    filtered.forEach((item, i) => {
      if (!query && item.section !== lastSection) {
        const lbl = document.createElement('div');
        lbl.className = 'palette-section-label';
        lbl.textContent = item.section;
        results.appendChild(lbl);
        lastSection = item.section;
      }
      const el = document.createElement('div');
      el.className = 'palette-item' + (i === activeIdx ? ' active' : '');
      el.setAttribute('role', 'option');
      el.innerHTML = '<span class="palette-item-icon">' + item.icon + '</span>' +
        '<span class="palette-item-label">' + item.label + '</span>' +
        (item.kbd ? '<kbd class="palette-item-kbd">' + item.kbd + '</kbd>' : '');
      el.addEventListener('mouseenter', () => {
        activeIdx = i;
        results.querySelectorAll('.palette-item').forEach((item, j) => item.classList.toggle('active', j === i));
      });
      el.addEventListener('click', () => execute(i));
      results.appendChild(el);
    });
  }

  function execute(idx) {
    const item = filtered[idx];
    if (!item) return;
    closePalette();
    item.action();
  }

  function openPalette() {
    overlay.hidden = false;
    const win = document.getElementById('palette-window');
    if (win) { win.style.animation = 'none'; void win.offsetWidth; win.style.animation = ''; }
    input.value = '';
    activeIdx = 0;
    render();
    input.focus();
  }

  function closePalette() {
    overlay.hidden = true;
  }

  input.addEventListener('input', () => { activeIdx = 0; render(); });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = (activeIdx + 1) % (filtered.length || 1);
      render();
      results.querySelector('.palette-item.active')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = (activeIdx - 1 + (filtered.length || 1)) % (filtered.length || 1);
      render();
      results.querySelector('.palette-item.active')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      execute(activeIdx);
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const active = document.activeElement;
      if (active && active.tagName === 'INPUT' && active.id !== 'palette-input') return;
      overlay.hidden ? openPalette() : closePalette();
    } else if (e.key === 'Escape' && !overlay.hidden) {
      closePalette();
    }
  });
})();

(function () {
  const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  const buf = [];
  let active = false;

  const LINES = [
    { html: '$ ssh root@elshemi.com', delay: 400 },
    { html: "root@elshemi.com's password: ••••••••••••", delay: 300 },
    { html: 'Permission denied (publickey).', delay: 600 },
    { html: '', delay: 200 },
    { html: '$ sudo -s', delay: 400 },
    { html: '[sudo] password for youssef: ••••••••••••', delay: 300 },
    { html: 'youssef is not in the sudoers file. This incident will be reported.', delay: 600 },
    { html: '', delay: 300 },
    { html: '&gt; Attempting privilege escalation...', delay: 400 },
    { html: '&gt; Bypassing auth layer...      [OK]', delay: 300 },
    { html: '&gt; Injecting payload...         [OK]', delay: 300 },
    { html: '<span class="t-accent">&gt; Root access granted.</span>', delay: 800 },
    { html: '', delay: 200 },
    { html: '<span class="t-accent">  ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ </span>', delay: 100 },
    { html: '<span class="t-accent">  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗</span>', delay: 100 },
    { html: '<span class="t-accent">  ███████║███████║██║     █████╔╝ █████╗  ██║  ██║</span>', delay: 100 },
    { html: '<span class="t-accent">  ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██║  ██║</span>', delay: 100 },
    { html: '<span class="t-accent">  ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██████╔╝</span>', delay: 100 },
    { html: '<span class="t-accent">  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ </span>', delay: 300 },
    { html: '', delay: 150 },
    { html: '<span class="t-muted">// nice one. you found the easter egg.</span>', delay: 150 },
    { html: '<span class="t-muted">// ↑↑↓↓←→←→BA — a classic.</span>', delay: 150 },
    { html: '<span class="t-muted">// type <span class="t-accent">help</span> if you actually want something.</span>', delay: 0 },
  ];

  document.addEventListener('keydown', function (e) {
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
    buf.push(e.key);
    if (buf.length > SEQUENCE.length) buf.shift();
    if (active || buf.length < SEQUENCE.length) return;
    if (buf.join(',') !== SEQUENCE.join(',')) return;
    buf.length = 0;
    active = true;
    if (typeof window.__terminalOpen !== 'function') { active = false; return; }
    window.__terminalOpen();
    const output = document.getElementById('terminal-output');
    const termInput = document.getElementById('terminal-input');
    if (termInput) termInput.disabled = true;
    let t = 300;
    LINES.forEach(function (line, i) {
      setTimeout(function () {
        const div = document.createElement('div');
        div.innerHTML = line.html;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
        if (i === LINES.length - 1) { active = false; if (termInput) { termInput.disabled = false; termInput.focus(); } }
      }, t);
      t += line.delay;
    });
  });
})();
