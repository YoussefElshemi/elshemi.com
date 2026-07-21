(function () {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('snake-overlay');
  const overScore = document.getElementById('snake-over-score');
  const actionBtn = document.getElementById('snake-action-btn');
  const CELL = 14;
  const COLS = 20;
  const ROWS = 20;
  const SPEED = 130;

  let snake, dir, nextDir, food, score, state, timer, touchStart;

  function css(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }

  function randFood() {
    let p;
    do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (snake.some(s => s.x === p.x && s.y === p.y));
    return p;
  }

  function setOverlay(show, scoreVal) {
    overlay.style.display = show ? 'flex' : 'none';
    if (show && scoreVal !== undefined) {
      overScore.textContent = 'score: ' + scoreVal;
      overScore.style.display = '';
      actionBtn.textContent = '↩ restart';
    } else {
      overScore.style.display = 'none';
      actionBtn.textContent = '▶ start';
    }
  }

  function init() {
    if (timer) clearInterval(timer);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    state = 'idle';
    food = randFood();
    setOverlay(true);
    draw();
  }

  function startGame() {
    state = 'playing';
    setOverlay(false);
    timer = setInterval(step, SPEED);
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      state = 'dead';
      clearInterval(timer);
      setOverlay(true, score);
      draw();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      food = randFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    const accent = css('--accent') || '#be1549';
    const bg = css('--bg') || '#0d0d0d';
    const text = css('--text') || '#fff';
    const muted = css('--text-muted') || '#888';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = text;
    ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? accent : accent + 'bb';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });

    ctx.font = '11px "Fira Code", monospace';
    ctx.fillStyle = muted;
    ctx.fillText('score: ' + score, 6, 14);
  }

  function steer(dx, dy) {
    if (state === 'dead') return;
    if (dx === -dir.x && dy === -dir.y) return;
    nextDir = { x: dx, y: dy };
    if (state === 'idle') startGame();
  }

  window.__snakeAction = function () {
    if (state === 'idle') startGame();
    else if (state === 'dead') { init(); startGame(); }
  };

  document.addEventListener('keydown', e => {
    const map = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
                  w: [0,-1], s: [0,1], a: [-1,0], d: [1,0] };
    if (map[e.key]) { e.preventDefault(); steer(...map[e.key]); return; }
    if (e.key === ' ') { e.preventDefault(); if (state === 'idle') startGame(); else if (state === 'dead') { init(); startGame(); } }
  });

  [['dpad-up',[0,-1]],['dpad-down',[0,1]],['dpad-left',[-1,0]],['dpad-right',[1,0]]].forEach(([id, d]) => {
    document.getElementById(id).addEventListener('click', () => steer(...d));
  });

  canvas.addEventListener('touchstart', e => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 1 : -1, 0);
    else steer(0, dy > 0 ? 1 : -1);
  }, { passive: true });

  init();
})();

window.initParticles();
