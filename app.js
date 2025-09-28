const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d', { alpha: false });

let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
let dots = [];
let width = 0, height = 0;
let lastTS = 0;

// Linkvertise button handler
const linkBtn = document.getElementById('linkvertise-btn');
if (linkBtn) {
  linkBtn.addEventListener('click', (e) => {
    console.log('Redirecting to Linkvertise...');

    // ✅ Set flag so Site C knows they came from here
    localStorage.setItem('passedLinkvertise', 'true');

    window.open('https://link-center.net/1401533/EfTevELAULeU', '_blank', 'noopener');
    e.preventDefault();
  }, { passive: false });
}

// WorkInk button handler
const workBtn = document.getElementById('workink-btn');
if (workBtn) {
  workBtn.addEventListener('click', (e) => {
    console.log('Redirecting to WorkInk...');

    // ✅ Also set flag so Site C accepts this path too
    localStorage.setItem('passedLinkvertise', 'true');

    window.open('https://work.ink', '_blank', 'noopener');
    e.preventDefault();
  }, { passive: false });
}

function resize() {
  width = Math.floor(canvas.clientWidth);
  height = Math.floor(canvas.clientHeight);

  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  initDots();
}

function dotCountForArea(w, h) {
  const area = w * h;
  const base = Math.round(area / 12000);
  return Math.max(45, Math.min(base, 180));
}

function initDots() {
  const target = dotCountForArea(width, height);
  dots.length = 0;

  for (let i = 0; i < target; i++) {
    dots.push(makeDot(true));
  }
}

function makeDot(spawnAnywhere = false) {
  const size = rand(0.6, 2.2);
  return {
    x: Math.random() * width,
    y: spawnAnywhere ? Math.random() * height : -rand(5, 40),
    vy: lerp(35, 140, easeOutQuad(clamp((size - 0.6) / (2.2 - 0.6), 0, 1))),
    vx: rand(-10, 10),
    size,
    alpha: rand(0.4, 0.95),
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: rand(0.5, 1.5)
  };
}

function step(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < dots.length; i++) {
    const p = dots[i];

    p.y += p.vy * dt;
    p.x += p.vx * dt * 0.2;
    p.twinklePhase += p.twinkleSpeed * dt;

    if (p.y - p.size > height) {
      const n = makeDot(false);
      p.x = n.x; p.y = n.y; p.vy = n.vy; p.vx = n.vx;
      p.size = n.size; p.alpha = n.alpha;
      p.twinklePhase = n.twinklePhase; p.twinkleSpeed = n.twinkleSpeed;
    }
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;

    const twinkle = 0.9 + Math.sin(p.twinklePhase) * 0.1;
    const a = clamp(p.alpha * twinkle, 0.25, 1);

    if (p.size > 1.0 && a > 0.35) {
      ctx.shadowColor = `rgba(255,255,255,${a * 0.35})`;
      ctx.shadowBlur = Math.max(0, p.size * 0.5);
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}

function loop(ts) {
  if (!lastTS) lastTS = ts;
  const dt = Math.min(0.033, (ts - lastTS) / 1000);
  lastTS = ts;

  step(dt);
  requestAnimationFrame(loop);
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

let resizeRAF = 0;
window.addEventListener('resize', () => {
  if (resizeRAF) cancelAnimationFrame(resizeRAF);
  resizeRAF = requestAnimationFrame(resize);
}, { passive: true });

resize();
requestAnimationFrame(loop);
