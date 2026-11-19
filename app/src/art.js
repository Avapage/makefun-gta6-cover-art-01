// Original procedural demo art: every panel the app ships with is drawn here from
// gradients, shapes and a seeded random, so the cover looks finished before any
// photo is loaded. No stock art, no game artwork, nothing copied.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A dusk sky: warm horizon melting into violet, with a glowing sun and streak clouds. */
export function paintSky(ctx, x, y, w, h, top, mid, low, sunY = 0.52, sunR = 0.16) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, top); sky.addColorStop(0.55, mid); sky.addColorStop(1, low);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const cx = x + w * 0.5, cy = y + h * sunY, r = Math.min(w, h) * sunR;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 3.2);
  glow.addColorStop(0, 'rgba(255, 214, 130, 0.85)');
  glow.addColorStop(0.35, 'rgba(255, 140, 90, 0.35)');
  glow.addColorStop(1, 'rgba(255, 140, 90, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffe9b0';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
  const rnd = mulberry32(7);
  for (let i = 0; i < 5; i++) {
    const cy2 = y + h * (0.16 + rnd() * 0.5);
    const cw = w * (0.25 + rnd() * 0.45);
    ctx.beginPath();
    ctx.ellipse(x + w * rnd(), cy2, cw / 2, h * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A palm silhouette: curved trunk and drooping fronds, drawn in one dark ink. */
export function paintPalm(ctx, x, y, s, lean, ink) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, s * 0.045);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.06, -s * 0.55, s * 0.02, -s); ctx.stroke();
  ctx.translate(s * 0.02, -s);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + (i / 6) * 0.84);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42 - s * 0.08, Math.cos(a) * s * 0.62, Math.sin(a) * s * 0.62 + s * 0.22);
    ctx.quadraticCurveTo(Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4 + s * 0.05, 0, 0);
    ctx.fill();
  }
  ctx.restore();
}

/** Sunset over the bay: glowing sun, sea with a light path, distant palms. */
export function drawSunset(ctx, x, y, w, h) {
  paintSky(ctx, x, y, w, h, '#2b1055', '#c63d7a', '#ff8a3d', 0.46, 0.17);
  const seaY = y + h * 0.72;
  const sea = ctx.createLinearGradient(0, seaY, 0, y + h);
  sea.addColorStop(0, '#ff7a4d'); sea.addColorStop(0.25, '#8e2f6e'); sea.addColorStop(1, '#1c0b33');
  ctx.fillStyle = sea; ctx.fillRect(x, seaY, w, y + h - seaY);
  ctx.fillStyle = 'rgba(255, 220, 150, 0.55)';
  const rnd = mulberry32(11);
  for (let i = 0; i < 26; i++) {
    const yy = seaY + (y + h - seaY) * rnd();
    const ww = w * (0.02 + rnd() * 0.16) * (1 - (yy - seaY) / (y + h - seaY) * 0.6);
    ctx.fillRect(x + w * 0.5 - ww / 2 + (rnd() - 0.5) * w * 0.08, yy, ww, Math.max(1.5, h * 0.004));
  }
  ctx.fillStyle = '#160a2b';
  ctx.fillRect(x, seaY - h * 0.012, w, h * 0.012);
  paintPalm(ctx, x + w * 0.1, seaY, h * 0.34, -0.1, '#1c0b33');
  paintPalm(ctx, x + w * 0.88, seaY, h * 0.28, 0.12, '#1c0b33');
}

/** Palm silhouettes against a teal-to-violet dusk, low sun on the horizon. */
export function drawPalms(ctx, x, y, w, h) {
  paintSky(ctx, x, y, w, h, '#0f3b4d', '#7a3d8f', '#ff7a5c', 0.62, 0.2);
  ctx.fillStyle = '#12081f';
  ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  paintPalm(ctx, x + w * 0.22, y + h * 0.86, h * 0.62, -0.14, '#12081f');
  paintPalm(ctx, x + w * 0.62, y + h * 0.86, h * 0.5, 0.1, '#12081f');
  paintPalm(ctx, x + w * 0.9, y + h * 0.86, h * 0.36, 0.2, '#12081f');
}

/** Neon skyline: dark towers, lit windows, a glowing sign band and a ferris wheel. */
export function drawSkyline(ctx, x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#12082e'); sky.addColorStop(0.6, '#3d1458'); sky.addColorStop(1, '#a3235e');
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  const rnd = mulberry32(23);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 40; i++) ctx.fillRect(x + w * rnd(), y + h * rnd() * 0.4, 1.6, 1.6);
  const base = y + h;
  // Ferris wheel, far left, glowing rim.
  const fx = x + w * 0.16, fy = y + h * 0.52, fr = h * 0.2;
  ctx.strokeStyle = 'rgba(255, 90, 180, 0.9)'; ctx.lineWidth = Math.max(2, h * 0.006);
  ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(fx, fy, fr * 0.55, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(a) * fr, fy + Math.sin(a) * fr); ctx.stroke();
  }
  // Towers, back row then front row.
  const rows = [
    { n: 7, min: 0.28, max: 0.5, ink: '#241040' },
    { n: 5, min: 0.45, max: 0.72, ink: '#160a2b' },
  ];
  for (const row of rows) {
    let bx = x;
    for (let i = 0; i < row.n; i++) {
      const bw = w / row.n * (0.7 + rnd() * 0.5);
      const bh = h * (row.min + rnd() * (row.max - row.min));
      ctx.fillStyle = row.ink;
      ctx.fillRect(bx, base - bh, bw, bh);
      if (rnd() > 0.5) { ctx.fillRect(bx + bw * 0.3, base - bh - h * 0.05, bw * 0.12, h * 0.05); }
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255, 210, 110, 0.9)' : 'rgba(90, 220, 255, 0.9)';
      for (let wy = base - bh + h * 0.04; wy < base - h * 0.03; wy += h * 0.055) {
        for (let wx = bx + bw * 0.12; wx < bx + bw * 0.88; wx += bw * 0.22) {
          if (rnd() > 0.62) ctx.fillRect(wx, wy, Math.max(2, bw * 0.07), Math.max(2, h * 0.018));
        }
      }
      bx += bw + w * 0.01;
    }
  }
  // Neon sign band across the front row.
  const band = ctx.createLinearGradient(x, 0, x + w, 0);
  band.addColorStop(0, '#ff2e88'); band.addColorStop(0.5, '#ff9a3d'); band.addColorStop(1, '#37e0ff');
  ctx.fillStyle = band;
  ctx.fillRect(x, y + h * 0.86, w, h * 0.02);
  ctx.fillStyle = 'rgba(255, 46, 136, 0.25)';
  ctx.fillRect(x, y + h * 0.88, w, h * 0.05);
}

/** Night cruise: a low car silhouette on a wet road under a neon sunset. */
export function drawCar(ctx, x, y, w, h) {
  paintSky(ctx, x, y, w, h * 0.62, '#1a0b3d', '#8e2f6e', '#ff6a3d', 0.3, 0.2);
  const roadY = y + h * 0.62;
  const road = ctx.createLinearGradient(0, roadY, 0, y + h);
  road.addColorStop(0, '#3a1440'); road.addColorStop(1, '#0c0618');
  ctx.fillStyle = road; ctx.fillRect(x, roadY, w, y + h - roadY);
  // Neon underglow.
  const glow = ctx.createRadialGradient(x + w * 0.5, roadY + h * 0.16, 4, x + w * 0.5, roadY + h * 0.16, w * 0.42);
  glow.addColorStop(0, 'rgba(255, 46, 136, 0.5)'); glow.addColorStop(1, 'rgba(255, 46, 136, 0)');
  ctx.fillStyle = glow; ctx.fillRect(x, roadY, w, y + h - roadY);
  // Headlight beams.
  ctx.fillStyle = 'rgba(255, 240, 190, 0.20)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.86, roadY + h * 0.1);
  ctx.lineTo(x + w, roadY + h * 0.02); ctx.lineTo(x + w, roadY + h * 0.22); ctx.closePath(); ctx.fill();
  // Car body, one low wedge with a cabin.
  ctx.fillStyle = '#0a0614';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, roadY + h * 0.2);
  ctx.lineTo(x + w * 0.1, roadY + h * 0.1);
  ctx.quadraticCurveTo(x + w * 0.28, roadY + h * 0.06, x + w * 0.4, roadY + h * 0.05);
  ctx.quadraticCurveTo(x + w * 0.52, roadY - h * 0.02, x + w * 0.66, roadY + h * 0.02);
  ctx.quadraticCurveTo(x + w * 0.78, roadY + h * 0.05, x + w * 0.9, roadY + h * 0.1);
  ctx.lineTo(x + w * 0.94, roadY + h * 0.2);
  ctx.quadraticCurveTo(x + w * 0.5, roadY + h * 0.26, x + w * 0.06, roadY + h * 0.2);
  ctx.closePath(); ctx.fill();
  // Window glass catching the sunset.
  ctx.fillStyle = 'rgba(255, 150, 90, 0.85)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.42, roadY + h * 0.045);
  ctx.quadraticCurveTo(x + w * 0.52, roadY - h * 0.005, x + w * 0.63, roadY + h * 0.02);
  ctx.lineTo(x + w * 0.6, roadY + h * 0.05);
  ctx.lineTo(x + w * 0.44, roadY + h * 0.05);
  ctx.closePath(); ctx.fill();
  // Wheels.
  for (const wx of [0.2, 0.78]) {
    ctx.fillStyle = '#05030a';
    ctx.beginPath(); ctx.arc(x + w * wx, roadY + h * 0.21, h * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8c8d8';
    ctx.beginPath(); ctx.arc(x + w * wx, roadY + h * 0.21, h * 0.024, 0, Math.PI * 2); ctx.fill();
  }
  // Headlight + tail light.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.ellipse(x + w * 0.9, roadY + h * 0.13, w * 0.02, h * 0.012, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff2e50';
  ctx.beginPath(); ctx.ellipse(x + w * 0.08, roadY + h * 0.13, w * 0.015, h * 0.01, 0, 0, Math.PI * 2); ctx.fill();
  paintPalm(ctx, x + w * 0.06, roadY + h * 0.02, h * 0.3, -0.08, '#0a0614');
}

export const DEMO_ART = { sunset: drawSunset, palms: drawPalms, skyline: drawSkyline, car: drawCar };
export const DEMO_NAMES = { sunset: 'Sunset over the bay', palms: 'Palm silhouettes', skyline: 'Neon skyline', car: 'Night cruise' };
