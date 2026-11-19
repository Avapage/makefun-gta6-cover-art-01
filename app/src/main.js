// Wires the page: load photos, fill panels, pick layout and grade, edit the
// lettering, crop the selected panel, export the cover as a PNG. A `?shot=`
// query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, makeCoverState, panelAt, panelRects, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const caption = document.getElementById('caption');
const subcaption = document.getElementById('subcaption');
const status = document.getElementById('status');
const thumbs = document.getElementById('thumbs');
const panelName = document.getElementById('panel-name');
const zoom = document.getElementById('zoom');
const panx = document.getElementById('panx');
const pany = document.getElementById('pany');
const demoArt = document.getElementById('demo-art');

const state = makeCoverState();
const photos = [];
let selected = 0;
let activePhoto = -1;

function redraw() {
  drawCover(canvas, state, document.body.classList.contains('shot-cover') ? -1 : selected);
  panelName.textContent = panelRects(state)[selected]?.name ?? 'Panel';
  const panel = state.panels[selected];
  if (panel) {
    zoom.value = String(panel.zoom);
    panx.value = String(panel.ox);
    pany.value = String(panel.oy);
    demoArt.value = panel.art;
  }
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function addPhoto(img, name) {
  photos.push({ img, name });
  const index = photos.length - 1;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.textContent = name;
  button.addEventListener('click', () => {
    activePhoto = index;
    [...thumbs.children].forEach((b) => b.classList.toggle('on', b === button));
    state.panels[selected].photo = img;
    state.panels[selected].zoom = 1;
    state.panels[selected].ox = 0;
    state.panels[selected].oy = 0;
    status.textContent = `${name} is in the ${panelRects(state)[selected].name.toLowerCase()}.`;
    redraw();
  });
  thumbs.appendChild(button);
  return photos.length - 1;
}

async function loadSample(file, name) {
  try {
    const img = await loadImage(`samples/${file}.jpg`);
    const i = addPhoto(img, name);
    activePhoto = i;
    [...thumbs.children].forEach((b, j) => b.classList.toggle('on', j === i));
    state.panels[selected].photo = img;
    state.panels[selected].zoom = 1;
    state.panels[selected].ox = 0;
    state.panels[selected].oy = 0;
    status.textContent = `${name} is in the ${panelRects(state)[selected].name.toLowerCase()}.`;
    redraw();
  } catch {
    status.textContent = `Could not load the ${name} demo photo.`;
  }
}

document.getElementById('photos').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    try {
      const img = await loadImage(URL.createObjectURL(file));
      const i = addPhoto(img, file.name.replace(/\.[^.]+$/, ''));
      activePhoto = i;
      [...thumbs.children].forEach((b, j) => b.classList.toggle('on', j === i));
      state.panels[selected].photo = img;
      redraw();
    } catch { /* unreadable file: skip it */ }
  }
  status.textContent = photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''} loaded — click a panel, then a photo, to fill it.` : 'No photos loaded yet.';
});
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard', 'Boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier', 'Pier'));

function seg(group, id, apply) {
  const el = document.getElementById(id);
  el.addEventListener('click', () => {
    const row = el.parentElement;
    [...row.querySelectorAll('.seg')].forEach((b) => b.classList.toggle('on', b === el));
    apply();
    redraw();
  });
}
seg('layout', 'layout-poster', () => { state.layout = 'poster'; selected = 0; });
seg('layout', 'layout-duo', () => { state.layout = 'duo'; selected = 0; });
seg('layout', 'layout-hero', () => { state.layout = 'hero'; selected = 0; });
seg('grade', 'grade-sunset', () => { state.grade = 'sunset'; });
seg('grade', 'grade-neon', () => { state.grade = 'neon'; });
seg('grade', 'grade-noir', () => { state.grade = 'noir'; });
seg('size', 'size-square', () => { state.size = 'square'; });
seg('size', 'size-portrait', () => { state.size = 'portrait'; });
seg('size', 'size-wide', () => { state.size = 'wide'; });

caption.addEventListener('input', () => { state.caption = caption.value; redraw(); });
subcaption.addEventListener('input', () => { state.subcaption = subcaption.value; redraw(); });
document.getElementById('ink').addEventListener('change', (e) => { state.ink = e.target.value; redraw(); });
zoom.addEventListener('input', () => { state.panels[selected].zoom = Number(zoom.value); redraw(); });
panx.addEventListener('input', () => { state.panels[selected].ox = Number(panx.value); redraw(); });
pany.addEventListener('input', () => { state.panels[selected].oy = Number(pany.value); redraw(); });
demoArt.addEventListener('change', () => {
  const panel = state.panels[selected];
  panel.art = demoArt.value;
  if (!panel.photo) redraw();
});
document.getElementById('use-demo').addEventListener('click', () => {
  const panel = state.panels[selected];
  panel.photo = null;
  panel.art = demoArt.value;
  panel.zoom = 1; panel.ox = 0; panel.oy = 0;
  status.textContent = `Demo art is in the ${panelRects(state)[selected].name.toLowerCase()}.`;
  redraw();
});

canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const px = (e.clientX - r.left) * (canvas.width / r.width);
  const py = (e.clientY - r.top) * (canvas.height / r.height);
  const hit = panelAt(state, px, py);
  if (hit >= 0) {
    selected = hit;
    if (activePhoto >= 0 && photos[activePhoto]) {
      state.panels[selected].photo = photos[activePhoto].img;
      state.panels[selected].zoom = 1;
      state.panels[selected].ox = 0;
      state.panels[selected].oy = 0;
    }
    redraw();
  }
});

document.getElementById('export').addEventListener('click', () => {
  const { w, h } = SIZES[state.size];
  const off = document.createElement('canvas');
  drawCover(off, state, -1);
  off.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${w}x${h}.png`;
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, async (sample, text, sub) => {
    const img = await loadImage(`samples/${sample}.jpg`);
    addPhoto(img, sample);
    state.panels[0].photo = img;
    state.caption = text;
    state.subcaption = sub ?? state.subcaption;
    caption.value = text;
    subcaption.value = state.subcaption;
    if (query.get('size')) state.size = query.get('size');
    if (query.get('layout')) state.layout = query.get('layout');
    if (query.get('grade')) state.grade = query.get('grade');
    if (query.get('ink')) state.ink = query.get('ink');
    if (query.get('oy')) state.panels[0].oy = Number(query.get('oy'));
    redraw();
  });
} else {
  redraw();
}
