import './DotField.css';

const GLOW_RADIUS = 160;
const IDLE_TIMEOUT = 2000;

// Geometry is fixed; the color seam is the --dot-gradient-* CSS variables.
const DOT_RADIUS = 1.5;
const DOT_SPACING = 14;
// The paused frame only needs to look like the field, so it is rasterized at
// 60% resolution. That keeps the first paint off the long-task budget; the
// backing store goes full resolution when the loop starts.
const STATIC_SCALE = 0.6;
const CURSOR_RADIUS = 500;
const BULGE_STRENGTH = 67;
const FALLBACK_FROM = 'rgba(168, 85, 247, 0.35)';
const FALLBACK_TO = 'rgba(180, 151, 207, 0.25)';

function createGlow(canvasParent) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const glowId = `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`;

  const defs = document.createElementNS(ns, 'defs');
  const gradient = document.createElementNS(ns, 'radialGradient');
  gradient.setAttribute('id', glowId);

  const stopStart = document.createElementNS(ns, 'stop');
  stopStart.setAttribute('offset', '0%');
  stopStart.setAttribute('stop-color', 'transparent');

  const stopEnd = document.createElementNS(ns, 'stop');
  stopEnd.setAttribute('offset', '100%');
  stopEnd.setAttribute('stop-color', 'transparent');

  gradient.append(stopStart, stopEnd);
  defs.append(gradient);

  const glow = document.createElementNS(ns, 'circle');
  glow.setAttribute('cx', '-9999');
  glow.setAttribute('cy', '-9999');
  glow.setAttribute('r', String(GLOW_RADIUS));
  glow.setAttribute('fill', `url(#${glowId})`);
  glow.style.opacity = '0';

  svg.append(defs, glow);
  canvasParent.append(svg);

  return glow;
}

/**
 * Mounts the decorative dot field into `container`.
 *
 * @param {HTMLElement} container
 */
export function initDotField(container) {
  if (!container) return;

  const root = document.createElement('div');
  root.className = 'dot-field-container';

  const canvas = document.createElement('canvas');
  root.append(canvas);

  container.append(root);
  const glowEl = createGlow(root);

  const ctx = canvas.getContext('2d', { alpha: true });
  // Wide viewports have enough dots that a 2x backing store costs more than it
  // shows; cap them to 1x so the engaged loop can hold its frame budget.
  const getDpr = () =>
    Math.min(window.devicePixelRatio || 1, window.innerWidth > 1200 ? 1 : 2);
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let reducedMotion = motionQuery.matches;
  let resizeTimer;
  let running = false;
  let speedInterval = null;
  let pointerListenersAttached = false;
  let lastPointerTime = performance.now();

  let colors = { from: FALLBACK_FROM, to: FALLBACK_TO };
  let dots = [];
  let size = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
  const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
  let raf = null;
  let lastFrameTime = 0;
  let glowOpacity = 0;
  let engagement = 0;

  function syncColors() {
    const styles = getComputedStyle(canvas);
    const from = styles.getPropertyValue('--dot-gradient-from').trim();
    const to = styles.getPropertyValue('--dot-gradient-to').trim();
    colors = {
      from: from || FALLBACK_FROM,
      to: to || FALLBACK_TO,
    };

    // When the loop is paused (reduced motion or idle), repaint once so a
    // theme switch still recolors the visible dots.
    if (!running && size.w > 0) drawStaticFrame();
  }

  function buildDots(w, h) {
    const step = DOT_RADIUS + DOT_SPACING;
    const cols = Math.floor(w / step);
    const rows = Math.floor(h / step);
    const padX = (w % step) / 2;
    const padY = (h % step) / 2;
    const next = new Array(rows * cols);
    let idx = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ax = padX + col * step + step / 2;
        const ay = padY + row * step + step / 2;
        next[idx++] = { ax, ay, sx: ax, sy: ay };
      }
    }
    dots = next;
  }

  function drawFrame() {
    const { w, h } = size;

    const targetEngagement = Math.min(mouse.speed / 5, 1);
    engagement += (targetEngagement - engagement) * 0.06;
    if (engagement < 0.001) engagement = 0;
    const eng = engagement;

    glowOpacity += (eng - glowOpacity) * 0.08;
    glowEl.setAttribute('cx', mouse.x);
    glowEl.setAttribute('cy', mouse.y);
    glowEl.style.opacity = glowOpacity;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, colors.from);
    grad.addColorStop(1, colors.to);
    ctx.fillStyle = grad;

    const crSq = CURSOR_RADIUS * CURSOR_RADIUS;
    const rad = DOT_RADIUS / 2;

    ctx.beginPath();

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = mouse.x - d.ax;
      const dy = mouse.y - d.ay;
      const distSq = dx * dx + dy * dy;

      if (distSq < crSq && eng > 0.01) {
        const dist = Math.sqrt(distSq);
        const t = 1 - dist / CURSOR_RADIUS;
        const push = t * t * BULGE_STRENGTH * eng;
        d.sx += (d.ax - (dx / dist) * push - d.sx) * 0.15;
        d.sy += (d.ay - (dy / dist) * push - d.sy) * 0.15;
      } else {
        d.sx += (d.ax - d.sx) * 0.1;
        d.sy += (d.ay - d.sy) * 0.1;
      }

      ctx.rect(d.sx - rad, d.sy - rad, rad * 2, rad * 2);
    }

    ctx.fill();
  }

  // At rest every dot sits on its home grid, so no deformation math is needed —
  // just one batched rect path. A rect is a hair cheaper than an arc per dot,
  // and at ~1.5px the two are visually indistinguishable.
  function drawStaticFrame() {
    const { w, h } = size;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, colors.from);
    grad.addColorStop(1, colors.to);
    ctx.fillStyle = grad;

    ctx.clearRect(0, 0, w, h);
    const rad = DOT_RADIUS / 2;
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      ctx.rect(d.ax - rad, d.ay - rad, rad * 2, rad * 2);
    }
    ctx.fill();
  }

  function doResize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const scale = running ? getDpr() : getDpr() * STATIC_SCALE;
    canvas.width = w * scale;
    canvas.height = h * scale;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    size = {
      w,
      h,
      offsetX: rect.left,
      offsetY: rect.top,
    };

    buildDots(w, h);
    // Keep a static frame on screen even while the loop is paused. Painting it
    // on the next frame splits the grid build and the fill into two tasks.
    if (running) {
      drawFrame();
    } else {
      requestAnimationFrame(drawStaticFrame);
    }
  }

  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 100);
  }

  function updateMouseSpeed() {
    const dx = mouse.prevX - mouse.x;
    const dy = mouse.prevY - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    mouse.speed += (dist - mouse.speed) * 0.5;
    if (mouse.speed < 0.001) mouse.speed = 0;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
  }

  function loop(now) {
    if (!running) return;

    if (document.hidden) {
      stop();
      return;
    }

    // Dots are at rest and the pointer has been idle: stop drawing until the
    // next interaction instead of burning a frame budget forever.
    if (engagement === 0 && performance.now() - lastPointerTime > IDLE_TIMEOUT) {
      stop();
      return;
    }

    // The deform animation reads well at ~30fps and halves the per-frame cost,
    // which is what keeps 1440px and 1920px viewports smooth.
    if (now - lastFrameTime < 33) {
      raf = requestAnimationFrame(loop);
      return;
    }
    lastFrameTime = now;

    drawFrame();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reducedMotion || document.hidden) return;
    running = true;
    lastFrameTime = 0;
    // Upgrade the backing store from the low-cost static resolution before
    // the first animated frame.
    doResize();
    if (speedInterval === null) speedInterval = setInterval(updateMouseSpeed, 20);
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    if (speedInterval !== null) {
      clearInterval(speedInterval);
      speedInterval = null;
    }
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.speed = 0;
    engagement = 0;
    glowOpacity = 0;
    glowEl.style.opacity = '0';
  }

  function onPointerMove(event) {
    if (reducedMotion) return;
    mouse.x = event.clientX - size.offsetX;
    mouse.y = event.clientY - size.offsetY;
    lastPointerTime = performance.now();
    start();
  }

  function onTouchStart(event) {
    if (reducedMotion || event.touches.length === 0) return;
    const touch = event.touches[0];
    mouse.x = touch.clientX - size.offsetX;
    mouse.y = touch.clientY - size.offsetY;
    lastPointerTime = performance.now();
    start();
  }

  function addPointerListeners() {
    if (pointerListenersAttached) return;
    pointerListenersAttached = true;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
  }

  function removePointerListeners() {
    if (!pointerListenersAttached) return;
    pointerListenersAttached = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('touchstart', onTouchStart);
  }

  function onVisibilityChange() {
    // Returning to the tab keeps the static frame; the loop restarts on the
    // next pointer input, not on a timer.
    if (document.hidden) stop();
  }

  function onMotionChange(event) {
    reducedMotion = event.matches;
    if (reducedMotion) {
      stop();
      removePointerListeners();
      // One static frame, no motion.
      drawStaticFrame();
    } else {
      addPointerListeners();
      drawStaticFrame();
    }
  }

  syncColors();

  // The theme is toggled via a `dark` class on <html>; re-read on that change.
  new MutationObserver(syncColors).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  // A static frame is painted on the next frame: building the grid and the
  // first fill is the heaviest part, so it stays out of the idle callback that
  // mounted us. The animation loop only starts when the pointer first moves
  // over the page.
  requestAnimationFrame(doResize);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibilityChange);
  motionQuery.addEventListener('change', onMotionChange);
  window.addEventListener('pagehide', stop);

  if (!reducedMotion) {
    addPointerListeners();
  }
}
