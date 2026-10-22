import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
const appVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
const html = readFileSync('dist/index.html', 'utf8');
assert.equal(manifest.lang, 'pt-BR');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
assert.ok(existsSync('dist/sw.js'), 'Service worker must be included in the build');
assert.ok(existsSync('dist/apple-touch-icon.png'), 'iOS icon must be included in the build');
assert.ok(existsSync('dist/enem-banner.jpg'), 'The home banner image must be included in the build');
assert.match(readFileSync('public/_redirects', 'utf8'), /^\/\* \/index\.html 200\s*$/m);

const serviceWorker = readFileSync('dist/sw.js', 'utf8');
assert.match(html, new RegExp(`<meta name="app-version" content="${appVersion}"`));
assert.match(serviceWorker, /skipWaiting\(\)/, 'New service workers must activate without waiting for old tabs');
assert.match(serviceWorker, /clientsClaim\(\)/, 'The new service worker must take control of open app tabs');
assert.match(serviceWorker, /enem-banner\.jpg/, 'The home banner image must be precached for offline PWA use');
assert.doesNotMatch(serviceWorker, /supabase\.co|\/(?:auth|rest|storage)\/v1\//i);
console.log('PWA build smoke check passed.');
