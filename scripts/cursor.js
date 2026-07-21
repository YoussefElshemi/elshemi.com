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
    const half = ring.offsetWidth / 2;
    ring.style.transform = `translate(${rx - half}px, ${ry - half}px)`;
    requestAnimationFrame(tick);
  }
  tick();
})();
