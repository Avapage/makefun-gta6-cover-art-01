// Screenshot run for the Vice Cover entry: serves app/ on localhost, opens each
// scene from shots.json in headless Chrome, waits for window.__shotReady, records
// any console error or page error, and writes a JPEG into screenshots/.
// Run from the repository root: node shots-run.mjs  (serve.ts must be started first,
// or pass --serve to start it here). Not part of the submitted app: delete before
// submitting, or leave it — it lives outside app/ and main.ts never copies it.
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Puppeteer lives in the shared terminal tooling, not in this repo.
const require = createRequire(join(homedir(), 'workspace/ava-terminal/tools/package.json'));
const puppeteer = require('puppeteer');

const shots = JSON.parse(readFileSync(new URL('./shots.json', import.meta.url), 'utf8'));
const base = 'http://localhost:8080/index.html';

let server = null;
if (process.argv.includes('--serve')) {
  server = spawn(process.execPath, ['serve.ts', '--port', '8080'], { stdio: 'inherit' });
  await new Promise((r) => setTimeout(r, 1200));
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-proxy-server', '--force-device-scale-factor=1'],
});
const errors = [];
try {
  for (const shot of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: shot.w, height: shot.h, deviceScaleFactor: 1 });
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`${shot.name}: console ${msg.text()}`); });
    page.on('pageerror', (err) => errors.push(`${shot.name}: pageerror ${err.message}`));
    page.on('requestfailed', (req) => errors.push(`${shot.name}: request failed ${req.url()}`));
    await page.goto(base + shot.query, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 300));
    const out = new URL(`./screenshots/${shot.name}`, import.meta.url);
    await page.screenshot({ path: out.pathname, type: 'jpeg', quality: 85 });
    const bytes = statSync(out).size;
    console.log(`${shot.name}: ${shot.w}x${shot.h} ${bytes} bytes${bytes > 262144 ? '  *** OVER 256 KiB ***' : ''}`);
    await page.close();
  }
} finally {
  await browser.close();
  if (server) server.kill();
}
if (errors.length) {
  console.log('ERRORS:');
  for (const e of errors) console.log(' -', e);
  process.exitCode = 1;
} else {
  console.log('No console errors, no failed requests.');
}
