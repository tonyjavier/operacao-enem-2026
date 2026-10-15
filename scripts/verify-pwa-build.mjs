import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
assert.equal(manifest.lang, 'pt-BR');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
assert.ok(existsSync('dist/sw.js'), 'Service worker must be included in the build');
assert.ok(existsSync('dist/apple-touch-icon.png'), 'iOS icon must be included in the build');
assert.match(readFileSync('public/_redirects', 'utf8'), /^\/\* \/index\.html 200\s*$/m);

const serviceWorker = readFileSync('dist/sw.js', 'utf8');
assert.doesNotMatch(serviceWorker, /supabase\.co|\/(?:auth|rest|storage)\/v1\//i);
console.log('PWA build smoke check passed.');
