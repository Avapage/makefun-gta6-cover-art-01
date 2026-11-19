// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone at the
// export size, ?shot=editor shows the page with a sample photo loaded in the hero
// panel. `photo` picks the sample (samples/<photo>.jpg), `caption` and `sub` the
// lettering, `size` the export size, `layout` and `grade` the look, `oy` a
// vertical pan of the hero photo so a face is not cropped out of the frame.
// window.__shotReady is set once painted.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const size = query.get('size');
  if (size === 'portrait' || size === 'wide') document.body.dataset.shotSize = size;
  await load(
    query.get('photo') ?? 'pier',
    query.get('caption') ?? 'Sunset Heist',
    query.get('sub') ?? 'Vice City Nights',
  );
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
