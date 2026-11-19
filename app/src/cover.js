// Renders the cover: multi-panel layout, per-panel photo crop or procedural demo
// art, a sunset/neon colour grade, and bold original lettering over a scrim.
import { DEMO_ART } from './art.js';

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

export const LAYOUTS = {
  poster: {
    label: 'Poster',
    panels: [
      { name: 'Hero panel', x: 0, y: 0, w: 1, h: 0.56 },
      { name: 'Lower left', x: 0, y: 0.56, w: 0.5, h: 0.44 },
      { name: 'Lower right', x: 0.5, y: 0.56, w: 0.5, h: 0.44 },
    ],
  },
  duo: {
    label: 'Duo',
    panels: [
      { name: 'Tall panel', x: 0, y: 0, w: 0.58, h: 1 },
      { name: 'Upper right', x: 0.58, y: 0, w: 0.42, h: 0.5 },
      { name: 'Lower right', x: 0.58, y: 0.5, w: 0.42, h: 0.5 },
    ],
  },
  hero: {
    label: 'Hero',
    panels: [{ name: 'Full cover', x: 0, y: 0, w: 1, h: 1 }],
  },
};

export const GRADES = {
  sunset: { label: 'Sunset', top: 'rgba(255, 120, 60, 0)', mid: 'rgba(255, 90, 120, 0.10)', bottom: 'rgba(120, 20, 90, 0.28)', tint: 'rgba(255, 110, 60, 0.05)' },
  neon: { label: 'Neon', top: 'rgba(60, 220, 255, 0)', mid: 'rgba(255, 46, 136, 0.12)', bottom: 'rgba(40, 10, 90, 0.34)', tint: 'rgba(255, 46, 136, 0.06)' },
  noir: { label: 'Noir', top: 'rgba(10, 10, 20, 0.05)', mid: 'rgba(20, 20, 40, 0.16)', bottom: 'rgba(0, 0, 0, 0.45)', tint: 'rgba(30, 30, 60, 0.10)' },
};

export const INKS = {
  white: { fill: ['#ffffff', '#ffe9c4'], stroke: '#1c0b33' },
  gold: { fill: ['#ffe98a', '#ff9a3d'], stroke: '#3d1400' },
  neon: { fill: ['#ff9ad5', '#ff2e88'], stroke: '#2b0033' },
};

/** One panel's content: a photo (Image) with crop, or a named demo artwork. */
export function makePanel(art = 'sunset') {
  return { photo: null, zoom: 1, ox: 0, oy: 0, art };
}

/** The cover's whole state: layout, grade, lettering, size and one panel per slot. */
export function makeCoverState() {
  return {
    layout: 'poster',
    grade: 'sunset',
    caption: 'SUNSET HEIST',
    subcaption: 'VICE CITY NIGHTS',
    ink: 'white',
    size: 'square',
    panels: [makePanel('sunset'), makePanel('palms'), makePanel('skyline')],
  };
}

/** Panel rectangles in canvas pixels for the state's layout and size. */
export function panelRects(state) {
  const { w, h } = SIZES[state.size];
  const gap = Math.round(Math.min(w, h) * 0.008);
  return LAYOUTS[state.layout].panels.map((p) => ({
    name: p.name,
    x: Math.round(p.x * w) + (p.x > 0 ? gap : 0),
    y: Math.round(p.y * h) + (p.y > 0 ? gap : 0),
    w: Math.round(p.w * w) - (p.x > 0 ? gap : 0) - (p.x + p.w < 1 ? gap : 0),
    h: Math.round(p.h * h) - (p.y > 0 ? gap : 0) - (p.y + p.h < 1 ? gap : 0),
  }));
}

/** Which panel (index) holds canvas point (px, py), or -1. */
export function panelAt(state, px, py) {
  const rects = panelRects(state);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return i;
  }
  return -1;
}

/** Draws one panel: photo cover-fit with zoom/pan, or its procedural demo art. */
export function drawPanel(ctx, rect, panel) {
  ctx.save();
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  if (panel.photo) {
    const img = panel.photo;
    const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * panel.zoom;
    const pw = img.naturalWidth * scale;
    const ph = img.naturalHeight * scale;
    ctx.drawImage(img, rect.x + (rect.w - pw) / 2 + panel.ox * rect.w, rect.y + (rect.h - ph) / 2 + panel.oy * rect.h, pw, ph);
  } else {
    DEMO_ART[panel.art](ctx, rect.x, rect.y, rect.w, rect.h);
  }
  ctx.restore();
}

/** Bold original lettering: gradient fill, dark outline, soft shadow, fitted to width. */
export function drawLettering(ctx, w, h, caption, subcaption, ink) {
  const text = caption.trim().toUpperCase();
  const sub = subcaption.trim().toUpperCase();
  const bandH = h * 0.2;
  const scrim = ctx.createLinearGradient(0, h - bandH * 1.6, 0, h);
  scrim.addColorStop(0, 'rgba(10, 4, 24, 0)');
  scrim.addColorStop(1, 'rgba(10, 4, 24, 0.72)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h - bandH * 1.6, w, bandH * 1.6);
  if (!text) return;
  const colors = INKS[ink] ?? INKS.white;
  let size = h * 0.115;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const fit = (s) => {
    ctx.font = `900 ${s}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    return ctx.measureText(text).width;
  };
  while (fit(size) > w * 0.92 && size > 16) size -= 4;
  fit(size);
  const grad = ctx.createLinearGradient(0, h - bandH - size * 0.4, 0, h - bandH * 0.2);
  grad.addColorStop(0, colors.fill[0]);
  grad.addColorStop(1, colors.fill[1]);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.04;
  const cy = h - h * 0.055;
  ctx.strokeText(text, w / 2, cy);
  ctx.fillStyle = grad;
  ctx.fillText(text, w / 2, cy);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (sub) {
    const subSize = Math.max(14, h * 0.026);
    ctx.font = `700 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
    try { ctx.letterSpacing = `${subSize * 0.42}px`; } catch { /* older canvas: no letter spacing */ }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    const ruleY = cy - size * 0.78;
    const subW = ctx.measureText(sub).width;
    ctx.fillText(sub, w / 2, ruleY);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = Math.max(1.5, h * 0.0016);
    const gap = w * 0.02;
    const ruleW = Math.min(w * 0.16, (w - subW) / 2 - gap * 2);
    if (ruleW > 10) {
      ctx.beginPath();
      ctx.moveTo(w / 2 - subW / 2 - gap - ruleW, ruleY - subSize * 0.35);
      ctx.lineTo(w / 2 - subW / 2 - gap, ruleY - subSize * 0.35);
      ctx.moveTo(w / 2 + subW / 2 + gap, ruleY - subSize * 0.35);
      ctx.lineTo(w / 2 + subW / 2 + gap + ruleW, ruleY - subSize * 0.35);
      ctx.stroke();
    }
  }
}

/** Draws the whole cover onto a canvas sized to the state's export size. */
export function drawCover(canvas, state, selected = -1) {
  const { w, h } = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d0716';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state);
  state.panels.forEach((panel, i) => drawPanel(ctx, rects[i], panel));
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, grade.top); wash.addColorStop(0.55, grade.mid); wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = grade.tint; ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
  drawLettering(ctx, w, h, state.caption, state.subcaption, state.ink);
  if (selected >= 0 && rects[selected]) {
    const r = rects[selected];
    ctx.strokeStyle = '#37e0ff';
    ctx.lineWidth = Math.max(4, w * 0.006);
    ctx.setLineDash([w * 0.02, w * 0.01]);
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.setLineDash([]);
  }
  return { w, h };
}
