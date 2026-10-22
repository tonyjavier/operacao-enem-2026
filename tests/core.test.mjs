import assert from 'node:assert/strict';
import test from 'node:test';
import { clampStudyDate, END_DATE, isValidIsoDate, START_DATE } from '../src/lib/dates.ts';
import { approvedExternalUrl } from '../src/lib/external-url.ts';
import { parseResumePositionSeconds } from '../src/lib/lesson-progress.ts';

test('valida datas ISO sem normalizar datas impossíveis', () => {
  assert.equal(isValidIsoDate('2026-10-13'), true);
  assert.equal(isValidIsoDate('2026-02-31'), false);
  assert.equal(isValidIsoDate('13/10/2026'), false);
  assert.equal(isValidIsoDate('2026-10-xx'), false);
});

test('limita datas inválidas e fora do cronograma a uma data segura', () => {
  assert.deepEqual(clampStudyDate('2026-10-12'), { date: START_DATE, adjusted: true });
  assert.deepEqual(clampStudyDate('2026-11-16'), { date: END_DATE, adjusted: true });
  const invalid = clampStudyDate('2026-02-31');
  assert.equal(invalid.adjusted, true);
  assert.ok(invalid.date >= START_DATE && invalid.date <= END_DATE);
});

test('valida pontos de retomada opcionais e dentro da duração conhecida', () => {
  assert.equal(parseResumePositionSeconds('', 3600), null);
  assert.equal(parseResumePositionSeconds('0', 3600), 0);
  assert.equal(parseResumePositionSeconds('3599', 3600), 3599);
  assert.equal(parseResumePositionSeconds('999999', null), 999999);
  assert.throws(() => parseResumePositionSeconds('-1', 3600), /inteiro e não negativo/);
  assert.throws(() => parseResumePositionSeconds('2.5', 3600), /inteiro e não negativo/);
  assert.throws(() => parseResumePositionSeconds('3601', 3600), /superar a duração/);
});

test('permite o PDF no domínio oficial do app e rejeita hosts semelhantes', () => {
  const pdfUrl = 'https://operacao-enem-2026.netlify.app/materiais/arquivo.pdf';
  assert.equal(approvedExternalUrl(pdfUrl), pdfUrl);
  assert.equal(approvedExternalUrl('http://operacao-enem-2026.netlify.app/materiais/arquivo.pdf'), null);
  assert.equal(approvedExternalUrl('https://operacao-enem-2026.netlify.app.evil.test/arquivo.pdf'), null);
});

test('permite links HTTPS do mesmo app, mas não links de outras origens', () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: 'https://main--operacao-enem-2026.netlify.app' } };
  try {
    assert.equal(approvedExternalUrl('https://main--operacao-enem-2026.netlify.app/materiais/arquivo.pdf'), 'https://main--operacao-enem-2026.netlify.app/materiais/arquivo.pdf');
    assert.equal(approvedExternalUrl('https://example.com/arquivo.pdf'), null);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
