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
  const toggle = document.getElementById('terminal-toggle');
  if (!overlay || !toggle) return;

  const terminalInstances = [];
  let focusedInstance = null;

  function fitOverlay() {
    if (overlay.hidden || !window.visualViewport) return;
    overlay.style.top = window.visualViewport.offsetTop + 'px';
    overlay.style.height = window.visualViewport.height + 'px';
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitOverlay);
    window.visualViewport.addEventListener('scroll', fitOverlay);
  }

  function openOverlay() {
    overlay.hidden = false;
    fitOverlay();
  }

  function closeOverlay() {
    overlay.hidden = true;
    overlay.style.top = '';
    overlay.style.height = '';
    terminalInstances.forEach(function (inst) {
      inst.element.classList.remove('minimized', 'fullscreen');
    });
    primaryWin.style.left = '';
    primaryWin.style.top = '';
    primaryWin.style.transform = '';
    if (focusedInstance) focusedInstance.element.querySelector('.terminal-input').blur();
  }

  function spawnWindow(x, y) {
    const tpl = document.getElementById('terminal-window-template');
    const el = document.createElement('div');
    el.className = 'terminal-window';
    el.innerHTML = tpl.innerHTML;
    const w = 520, h = 320;
    el.style.position = 'absolute';
    const overlayRect = overlay.getBoundingClientRect();
    const relX = x - overlayRect.left;
    const relY = y - overlayRect.top;
    el.style.left = Math.min(Math.max(0, relX - w / 2), overlay.clientWidth - w) + 'px';
    el.style.top = Math.min(Math.max(0, relY - 20), overlay.clientHeight - h) + 'px';
    overlay.appendChild(el);
    const inst = createTerminal(el);
    terminalInstances.push(inst);
    el.querySelector('.dot-close').addEventListener('click', function (e) { e.stopPropagation(); inst.destroy(); });
    el.querySelector('.dot-min').addEventListener('click', function (e) { e.stopPropagation(); closeOverlay(); });
    el.querySelector('.dot-max').addEventListener('click', function (e) {
      e.stopPropagation();
      el.classList.remove('minimized');
      el.classList.toggle('fullscreen');
      el.querySelector('.terminal-input').focus();
    });
    focusedInstance = inst;
    return inst;
  }

  function createTerminal(rootEl) {
    const input = rootEl.querySelector('.terminal-input');
    const ghost = rootEl.querySelector('.terminal-ghost');
    const tabsEl = rootEl.querySelector('.terminal-tabs');
    const tabAdd = rootEl.querySelector('.terminal-tab-add');
    if (!input || !tabsEl || !tabAdd) return null;

    const MAX_TABS = 4;
    const HISTORY_KEY = 'terminal_history';
    const CMD_NAMES = ['cat', 'cd', 'clear', 'contact', 'date', 'echo', 'exit', 'experience', 'help', 'ls', 'man', 'matrix', 'neofetch', 'particles', 'ping', 'pwd', 'skills', 'sudo', 'theme', 'uname', 'whoami'];
    let suggestion = null;
    let cycleMatches = [];
    let cycleIdx = -1;
    let activeMatrixTeardown = null;
    let sessions = [];
    let activeSession = null;
    let nextId = 1;
    let dragSession = null;
    let dragGhostEl = null;
    let dragInsertIdx = -1;
    let windowGhostEl = null;
    let currentDropTarget = null;

    function getInsertIdx(clientX) {
      const tabs = Array.from(tabsEl.querySelectorAll('.terminal-tab'));
      for (let i = 0; i < tabs.length; i++) {
        const r = tabs[i].getBoundingClientRect();
        if (clientX < r.left + r.width / 2) return i;
      }
      return tabs.length;
    }

    function startTabDrag(e, session) {
      dragSession = session;
      dragInsertIdx = sessions.indexOf(session);
      dragGhostEl = document.createElement('div');
      dragGhostEl.className = 'tab-drag-ghost';
      dragGhostEl.textContent = session.name;
      dragGhostEl.style.left = e.clientX + 'px';
      dragGhostEl.style.top = e.clientY - 20 + 'px';
      document.body.appendChild(dragGhostEl);
    }

    function createSession() {
      const name = nextId === 1 ? 'bash' : 'bash ' + nextId;
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const outputEl = document.createElement('div');
      outputEl.className = 'terminal-output-pane';
      outputEl.setAttribute('aria-live', 'polite');
      outputEl.style.display = 'none';
      rootEl.insertBefore(outputEl, rootEl.querySelector('.terminal-input-row'));
      const session = { id: nextId++, name, outputEl, history: stored.slice(), historyIdx: stored.length, booted: false };
      sessions.push(session);
      return session;
    }

    function switchToSession(session) {
      if (activeSession) activeSession.outputEl.style.display = 'none';
      activeSession = session;
      activeSession.outputEl.style.display = '';
      renderTabBar();
      input.focus();
    }

    function renderTabBar() {
      tabsEl.querySelectorAll('.terminal-tab, .tab-drop-gap').forEach(function (el) { el.remove(); });
      sessions.forEach(function (session) {
        const tab = document.createElement('button');
        tab.className = 'terminal-tab' + (session === activeSession ? ' active' : '');
        tab.addEventListener('click', function () { if (session !== activeSession) switchToSession(session); });
        tab.addEventListener('pointerdown', function (e) {
          if (e.button !== 0) return;
          if (dragSession) return;
          if (e.target.classList.contains('terminal-tab-close')) return;
          e.preventDefault();
          startTabDrag(e, session);
          const pid = e.pointerId;

          function onMove(e) {
            if (e.pointerId !== pid || !dragSession) return;
            const stripRect = tabsEl.getBoundingClientRect();
            const outsideStrip = e.clientY > stripRect.bottom + 5 || e.clientY < stripRect.top;

            if (outsideStrip) {
              if (dragGhostEl) { dragGhostEl.remove(); dragGhostEl = null; }
              if (!windowGhostEl) {
                renderTabBar();
                windowGhostEl = document.createElement('div');
                windowGhostEl.className = 'window-drag-ghost';
                document.body.appendChild(windowGhostEl);
              }
              windowGhostEl.style.left = e.clientX + 'px';
              windowGhostEl.style.top = e.clientY + 'px';

              currentDropTarget = null;
              terminalInstances.forEach(function (inst) {
                if (inst === instance) return;
                const r = inst.element.getBoundingClientRect();
                const tr = inst.element.querySelector('.terminal-tabs').getBoundingClientRect();
                const hitTop = Math.min(r.top, tr.top);
                if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= hitTop && e.clientY <= r.bottom) {
                  currentDropTarget = inst;
                  inst.element.classList.add('drop-target');
                } else {
                  inst.element.classList.remove('drop-target');
                }
              });
            } else {
              if (windowGhostEl) { windowGhostEl.remove(); windowGhostEl = null; }
              currentDropTarget = null;
              terminalInstances.forEach(function (inst) {
                inst.element.classList.remove('drop-target');
              });
              if (!dragGhostEl) {
                dragGhostEl = document.createElement('div');
                dragGhostEl.className = 'tab-drag-ghost';
                dragGhostEl.textContent = dragSession.name;
                document.body.appendChild(dragGhostEl);
              }
              dragGhostEl.style.left = e.clientX + 'px';
              dragGhostEl.style.top = e.clientY - 20 + 'px';
              const fromIdx = sessions.indexOf(dragSession);
              const rawIdx = getInsertIdx(e.clientX);
              dragInsertIdx = rawIdx >= fromIdx ? rawIdx + 1 : rawIdx;
              renderTabBarWithGap(dragInsertIdx);
            }
          }

          function cleanup() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onCancel);
          }

          function onCancel(e) {
            if (e.pointerId !== pid) return;
            cleanup();
            dragSession = null;
            dragInsertIdx = -1;
            if (dragGhostEl) { dragGhostEl.remove(); dragGhostEl = null; }
            if (windowGhostEl) { windowGhostEl.remove(); windowGhostEl = null; }
            terminalInstances.forEach(function (inst) { inst.element.classList.remove('drop-target'); });
            currentDropTarget = null;
            renderTabBar();
          }

          function onUp(e) {
            if (e.pointerId !== pid) return;
            cleanup();
            if (!dragSession) return;
            const session = dragSession;
            const savedInsertIdx = dragInsertIdx;
            dragSession = null;
            dragInsertIdx = -1;
            if (dragGhostEl) { dragGhostEl.remove(); dragGhostEl = null; }
            if (windowGhostEl) { windowGhostEl.remove(); windowGhostEl = null; }
            terminalInstances.forEach(function (inst) { inst.element.classList.remove('drop-target'); });

            const stripRect = tabsEl.getBoundingClientRect();
            const outsideStrip = e.clientY > stripRect.bottom + 5 || e.clientY < stripRect.top;

            if (outsideStrip && currentDropTarget) {
              instance.removeSession(session);
              currentDropTarget.addSession(session);
              if (instance.sessions.length === 0) instance.destroy();
            } else if (outsideStrip && sessions.length > 1) {
              instance.removeSession(session);
              const newInst = spawnWindow(e.clientX, e.clientY);
              newInst.addSession(session);
            } else {
              if (savedInsertIdx !== -1) {
                const fromIdx = sessions.indexOf(session);
                if (fromIdx !== -1) {
                  const toIdx = savedInsertIdx > fromIdx ? savedInsertIdx - 1 : savedInsertIdx;
                  sessions.splice(fromIdx, 1);
                  sessions.splice(toIdx, 0, session);
                }
              }
              renderTabBar();
            }
            currentDropTarget = null;
          }

          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
          document.addEventListener('pointercancel', onCancel);
        });
        const lbl = document.createElement('span');
        lbl.className = 'terminal-tab-label';
        lbl.textContent = session.name;
        tab.appendChild(lbl);
        const x = document.createElement('span');
        x.className = 'terminal-tab-close';
        x.setAttribute('role', 'button');
        x.setAttribute('tabindex', '0');
        x.textContent = '×';
        x.addEventListener('click', function (e) { e.stopPropagation(); closeSession(session); });
        tab.appendChild(x);
        tab.addEventListener('mousedown', function (e) { if (e.button === 1) { e.preventDefault(); closeSession(session); } });
        tabsEl.insertBefore(tab, tabAdd);
      });
      tabAdd.style.display = sessions.length >= MAX_TABS ? 'none' : '';
    }

    function renderTabBarWithGap(gapIdx) {
      tabsEl.querySelectorAll('.terminal-tab, .tab-drop-gap').forEach(function (el) { el.remove(); });
      sessions.forEach(function (session, i) {
        if (i === gapIdx) {
          const gap = document.createElement('div');
          gap.className = 'tab-drop-gap';
          tabsEl.insertBefore(gap, tabAdd);
        }
        if (session !== dragSession) {
          const tab = document.createElement('button');
          tab.className = 'terminal-tab' + (session === activeSession ? ' active' : '');
          const lbl = document.createElement('span');
          lbl.className = 'terminal-tab-label';
          lbl.textContent = session.name;
          tab.appendChild(lbl);
          tabsEl.insertBefore(tab, tabAdd);
        }
      });
      if (gapIdx >= sessions.length) {
        const gap = document.createElement('div');
        gap.className = 'tab-drop-gap';
        tabsEl.insertBefore(gap, tabAdd);
      }
    }

    function closeSession(session) {
      const idx = sessions.indexOf(session);
      sessions.splice(idx, 1);
      session.outputEl.remove();
      if (sessions.length > 0) {
        switchToSession(sessions[Math.max(0, idx - 1)]);
      } else if (terminalInstances[0] === instance) {
        renderTabBar();
        closeOverlay();
      } else {
        instance.destroy();
      }
    }

    tabAdd.addEventListener('click', function () {
      if (sessions.length >= MAX_TABS) return;
      const session = createSession();
      switchToSession(session);
      boot(session);
    });

    function boot(session) {
      if (session.booted) return;
      session.booted = true;
      print('<span class="t-muted">elshemi.com terminal — type <span class="t-accent">help</span> to get started.</span>');
    }

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
      activeSession.outputEl.appendChild(line);
      activeSession.outputEl.scrollTop = activeSession.outputEl.scrollHeight;
    }

    function printEcho(cmd) {
      const line = document.createElement('div');
      const prompt = document.createElement('span');
      prompt.className = 't-accent';
      prompt.textContent = '$ ';
      line.appendChild(prompt);
      line.appendChild(document.createTextNode(cmd));
      activeSession.outputEl.appendChild(line);
      activeSession.outputEl.scrollTop = activeSession.outputEl.scrollHeight;
    }

    function updateGhost() {
      suggestion = null;
      if (ghost) ghost.textContent = '';
      const val = input.value;
      if (!val) return;
      const spaceIdx = val.indexOf(' ');
      if (spaceIdx === -1) {
        const match = CMD_NAMES.find(function (c) { return c.startsWith(val.toLowerCase()) && c !== val.toLowerCase(); });
        if (match) { suggestion = match; if (ghost) ghost.textContent = val + match.slice(val.length); }
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
          const match = completions.find(function (c) { return c.startsWith(arg.toLowerCase()) && c !== arg.toLowerCase(); });
          if (match) { suggestion = val.slice(0, spaceIdx + 1) + match; if (ghost) ghost.textContent = suggestion; }
        }
      }
    }
    input.addEventListener('input', function () { cycleMatches = []; cycleIdx = -1; updateGhost(); });

    function run(raw) {
      if (activeMatrixTeardown) { activeMatrixTeardown(); activeMatrixTeardown = null; }
      const cmd = raw.trim();
      printEcho(cmd);
      if (!cmd) return;
      const name = cmd.split(/\s+/)[0].toLowerCase();
      if (name === 'clear') { activeSession.outputEl.innerHTML = ''; return; }
      if (name === 'exit')  { closeOverlay(); return; }
      if (name === 'sudo')  { print('youssef is not in the sudoers file. This incident will be reported.'); return; }
      if (name === 'particles') {
        print('<span class="t-muted">re-running hero animation…</span>');
        closeOverlay();
        window.smoothScrollTo(0, 600);
        setTimeout(function () { if (window.formParticles) window.formParticles(); }, 650);
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
        const out = activeSession.outputEl;
        const mcW = out.clientWidth;
        const mcH = out.clientHeight;
        const mc = document.createElement('canvas');
        mc.width = mcW;
        mc.height = mcH;
        out.style.position = 'relative';
        mc.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer;';
        out.appendChild(mc);
        const mctx = mc.getContext('2d');
        const cols = Math.floor(mcW / 14);
        const drops = Array.from({length: cols}, function () { return Math.random() * -(mcH / 14); });
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'.split('');
        let rafId;
        function drawMatrix() {
          mctx.fillStyle = isLight ? 'rgba(245,235,238,0.18)' : 'rgba(10,0,2,0.09)';
          mctx.fillRect(0, 0, mcW, mcH);
          mctx.font = '14px "Fira Code", monospace';
          drops.forEach(function (y, i) {
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
          out.style.position = '';
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
      if (name === 'date') { print(new Date().toString()); return; }
      if (name === 'echo') { print(cmd.slice(4).trim()); return; }
      if (name === 'ping') {
        const host = cmd.slice(4).trim() || 'elshemi.com';
        const times = Array.from({length: 4}, function () { return (1 + Math.random() * 12).toFixed(1); });
        const nums = times.map(Number);
        const avg = (nums.reduce(function (a, b) { return a + b; }, 0) / 4).toFixed(1);
        print('PING ' + host + ': 56 data bytes');
        times.forEach(function (t, i) {
          setTimeout(function () {
            print('64 bytes from ' + host + ': icmp_seq=' + i + ' ttl=64 time=' + t + ' ms');
          }, (i + 1) * 800);
        });
        setTimeout(function () {
          print('--- ' + host + ' ping statistics ---');
          print('4 packets transmitted, 4 received, 0.0% packet loss');
          print('round-trip min/avg/max = ' + Math.min.apply(null, nums).toFixed(1) + '/' + avg + '/' + Math.max.apply(null, nums).toFixed(1) + ' ms');
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
        if (window.innerWidth < 768) {
          print(info.join('\n'));
        } else {
          const infoStart = 3;
          print(logo.map(function (l, i) {
            const infoIdx = i - infoStart;
            return a + l + z + (infoIdx >= 0 && infoIdx < info.length ? '   ' + info[infoIdx] : '');
          }).join('\n'));
        }
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
      if (name === 'pwd')   { print('/home/youssef/elshemi.com'); return; }
      if (name === 'uname') { print('Darwin elshemi.com 23.0.0 Browser x86_64 JavaScript'); return; }
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
        if (!arg || arg === '~' || arg === '..') { window.smoothScrollTo(0, 600); closeOverlay(); return; }
        if (sections.includes(arg)) {
          const el = document.getElementById(arg);
          if (el) {
            const navH = document.querySelector('nav') ? document.querySelector('nav').offsetHeight : 0;
            window.smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - navH - 16, 750);
          }
          closeOverlay();
          return;
        }
        print('<span class="t-muted">bash: cd: ' + arg + ': No such file or directory</span>');
        return;
      }
      if (COMMANDS[name]) { print(COMMANDS[name]); return; }
      const err = document.createElement('div');
      err.textContent = 'command not found: ' + name;
      activeSession.outputEl.appendChild(err);
      print('<span class="t-muted">type <span class="t-accent">help</span> for available commands</span>');
    }

    function reset() {
      sessions.forEach(function (s) { s.outputEl.remove(); });
      sessions = [];
      activeSession = null;
      nextId = 1;
      if (ghost) ghost.textContent = '';
      suggestion = null;
      input.value = '';
    }

    const titlebar = rootEl.querySelector('.terminal-titlebar');
    if (titlebar) {
      let dragStartX, dragStartY, dragOrigLeft, dragOrigTop;
      titlebar.addEventListener('pointerdown', function (e) {
        if (rootEl.classList.contains('fullscreen')) return;
        if (e.target.classList.contains('terminal-dot') ||
            e.target.classList.contains('terminal-tab') ||
            e.target.classList.contains('terminal-tab-close') ||
            e.target.classList.contains('terminal-tab-label') ||
            e.target.classList.contains('terminal-tab-add')) return;
        const overlayRect = overlay.getBoundingClientRect();
        const winRect = rootEl.getBoundingClientRect();
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragOrigLeft = winRect.left - overlayRect.left;
        dragOrigTop = winRect.top - overlayRect.top;
        rootEl.style.transform = 'none';
        rootEl.style.left = dragOrigLeft + 'px';
        rootEl.style.top = dragOrigTop + 'px';
        titlebar.setPointerCapture(e.pointerId);
      });
      titlebar.addEventListener('pointermove', function (e) {
        if (!titlebar.hasPointerCapture(e.pointerId)) return;
        const overlayRect = overlay.getBoundingClientRect();
        const winRect = rootEl.getBoundingClientRect();
        const maxLeft = overlayRect.width - winRect.width;
        const maxTop = overlayRect.height - winRect.height;
        rootEl.style.left = Math.min(Math.max(0, dragOrigLeft + (e.clientX - dragStartX)), maxLeft) + 'px';
        rootEl.style.top = Math.min(Math.max(0, dragOrigTop + (e.clientY - dragStartY)), maxTop) + 'px';
      });
      titlebar.addEventListener('pointerup', function (e) {
        titlebar.releasePointerCapture(e.pointerId);
      });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (input.value.indexOf(' ') === -1) {
          if (cycleIdx === -1) {
            cycleMatches = CMD_NAMES.filter(function (c) { return c.startsWith(input.value.toLowerCase()) && c !== input.value.toLowerCase(); });
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
        if (val.trim()) {
          activeSession.history.push(val);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(activeSession.history));
        }
        activeSession.historyIdx = activeSession.history.length;
        input.value = '';
        updateGhost();
        run(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cycleMatches = []; cycleIdx = -1;
        if (activeSession.historyIdx > 0) {
          activeSession.historyIdx--;
          input.value = activeSession.history[activeSession.historyIdx];
          updateGhost();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        cycleMatches = []; cycleIdx = -1;
        if (activeSession.historyIdx < activeSession.history.length - 1) {
          activeSession.historyIdx++;
          input.value = activeSession.history[activeSession.historyIdx];
        } else {
          activeSession.historyIdx = activeSession.history.length;
          input.value = '';
        }
        updateGhost();
      }
    });

    rootEl.addEventListener('pointerdown', function () { focusedInstance = instance; });
    rootEl.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (window.getSelection().toString()) return;
      input.focus();
    });

    const instance = {
      element: rootEl,
      get activeSession() { return activeSession; },
      get sessions() { return sessions; },
      reset: reset,
      ensureBooted: function () {
        if (sessions.length === 0) {
          const session = createSession();
          switchToSession(session);
          boot(session);
        } else {
          boot(activeSession);
        }
      },
      addSession: function (session) {
        session.outputEl.remove();
        rootEl.insertBefore(session.outputEl, rootEl.querySelector('.terminal-input-row'));
        sessions.push(session);
        switchToSession(session);
      },
      removeSession: function (session) {
        const idx = sessions.indexOf(session);
        if (idx === -1) return;
        sessions.splice(idx, 1);
        session.outputEl.style.display = 'none';
        if (sessions.length > 0) switchToSession(sessions[Math.max(0, idx - 1)]);
        else renderTabBar();
      },
      destroy: function () {
        if (activeMatrixTeardown) { activeMatrixTeardown(); activeMatrixTeardown = null; }
        sessions.forEach(function (s) { s.outputEl.remove(); });
        const i = terminalInstances.indexOf(instance);
        if (i !== -1) terminalInstances.splice(i, 1);
        rootEl.remove();
        if (focusedInstance === instance) focusedInstance = terminalInstances[0] || null;
      }
    };

    return instance;
  }

  const primaryWin = document.getElementById('terminal-window');
  primaryWin.innerHTML = document.getElementById('terminal-window-template').innerHTML;
  const primaryInstance = createTerminal(primaryWin);
  terminalInstances.push(primaryInstance);
  focusedInstance = primaryInstance;

  primaryWin.querySelector('.dot-close').addEventListener('click', function (e) { e.stopPropagation(); primaryInstance.reset(); closeOverlay(); });
  primaryWin.querySelector('.dot-min').addEventListener('click', function (e) { e.stopPropagation(); closeOverlay(); });
  primaryWin.querySelector('.dot-max').addEventListener('click', function (e) {
    e.stopPropagation();
    primaryWin.classList.remove('minimized');
    primaryWin.classList.toggle('fullscreen');
    primaryWin.querySelector('.terminal-input').focus();
  });

  function open() {
    openOverlay();
    primaryWin.classList.remove('minimized');
    primaryInstance.ensureBooted();
    primaryWin.querySelector('.terminal-input').focus();
  }

  window.__terminalOpen = open;
  window.__terminalGetOutput = function () {
    var inst = focusedInstance || primaryInstance;
    return inst && inst.activeSession ? inst.activeSession.outputEl : null;
  };
  toggle.addEventListener('click', function () { overlay.hidden ? open() : closeOverlay(); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '`' && overlay.hidden && document.activeElement.tagName !== 'INPUT') { open(); }
    else if (e.key === 'Escape' && !overlay.hidden) { closeOverlay(); }
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
  const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
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
    const output = window.__terminalGetOutput ? window.__terminalGetOutput() : document.querySelector('.terminal-output-pane');
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

(function () {
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('button, a, .palette-item, .section-dot, .terminal-dot')) return;
    try { navigator.vibrate?.(10); } catch (_) {}
  }, { passive: true });
})();
