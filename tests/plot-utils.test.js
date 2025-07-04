
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';
import {
  pm25ToAQC,
  pm25ToColor,
  pm25ToYMax,
  pm25_AQILines,
  validatePlotArrays,
  pm25_addAQIStackedBar
} from '../src/plot-utils.js';

// ─── pm25ToAQC ────────────────────────────────────────────────────────────────

test('pm25ToAQC returns correct category levels', () => {
  assert.is(pm25ToAQC(0), 1);
  assert.is(pm25ToAQC(10), 2);
  assert.is(pm25ToAQC(40), 3);
  assert.is(pm25ToAQC(100), 4);
  assert.is(pm25ToAQC(200), 5);
  assert.is(pm25ToAQC(300), 6);
});

test('pm25ToAQC returns null for invalid input', () => {
  assert.is(pm25ToAQC(null), null);
  assert.is(pm25ToAQC('foo'), null);
});

// ─── pm25ToColor ──────────────────────────────────────────────────────────────

test('pm25ToColor returns correct RGB string', () => {
  assert.is(pm25ToColor(0), 'rgb(0,255,0)');
  assert.is(pm25ToColor(40), 'rgb(255,126,0)');
  assert.is(pm25ToColor(300), 'rgb(126,0,35)');
});

test('pm25ToColor returns fallback for invalid input', () => {
  assert.is(pm25ToColor(null), 'rgb(187,187,187)');
});

// ─── pm25ToYMax ───────────────────────────────────────────────────────────────

test('pm25ToYMax returns correct scaling breakpoint', () => {
  assert.is(pm25ToYMax(20), 50);
  assert.is(pm25ToYMax(120), 200);
  assert.is(pm25ToYMax(450), 600);
  assert.is(pm25ToYMax(800), 1000);
  assert.is(pm25ToYMax(1600), 1680); // 1.05 * 1600
});

test('pm25ToYMax returns 50 for invalid input', () => {
  assert.is(pm25ToYMax(null), 50);
  assert.is(pm25ToYMax('bad'), 50);
});

// ─── pm25_AQILines ────────────────────────────────────────────────────────────

test('pm25_AQILines returns expected plotLine objects', () => {
  const lines = pm25_AQILines();
  assert.ok(Array.isArray(lines));
  assert.is(lines.length, 5);
  lines.forEach(line => {
    assert.ok(typeof line.value === 'number');
    assert.ok(line.color.startsWith('rgb('));
    assert.is(line.width, 2);
  });
});

test('pm25_AQILines supports custom width', () => {
  const lines = pm25_AQILines(4);
  assert.ok(lines.every(line => line.width === 4));
});

// ─── validatePlotArrays ───────────────────────────────────────────────────────

test('validatePlotArrays accepts matching valid input', () => {
  const datetime = [DateTime.utc(2024, 1, 1), DateTime.utc(2024, 1, 2)];
  const pm25 = [10, 20];
  const nowcast = [12, 18];
  assert.not.throws(() => validatePlotArrays(datetime, pm25, nowcast));
});

test('validatePlotArrays throws on length mismatch', () => {
  const datetime = [DateTime.utc()];
  const pm25 = [10, 20];
  const nowcast = [15];
  assert.throws(() => validatePlotArrays(datetime, pm25, nowcast), /same length/);
});

test('validatePlotArrays throws on non-DateTime input', () => {
  const datetime = [new Date()];
  const pm25 = [10];
  const nowcast = [12];
  assert.throws(() => validatePlotArrays(datetime, pm25, nowcast), /Luxon DateTime/);
});

test('validatePlotArrays throws on invalid pm25 value', () => {
  const datetime = [DateTime.utc()];
  const pm25 = ['bad'];
  const nowcast = [10];
  assert.throws(() => validatePlotArrays(datetime, pm25, nowcast), /Invalid pm25/);
});

test('validatePlotArrays warns if datetime not increasing', () => {
  const datetime = [DateTime.utc(2024, 1, 2), DateTime.utc(2024, 1, 1)];
  const pm25 = [10, 12];
  const nowcast = [11, 12];
  assert.not.throws(() => validatePlotArrays(datetime, pm25, nowcast));
});

// ─── pm25_addAQIStackedBar ────────────────────────────────────────────────────

test('pm25_addAQIStackedBar fails gracefully with bad chart', () => {
  assert.not.throws(() => pm25_addAQIStackedBar(null));
  assert.not.throws(() => pm25_addAQIStackedBar({}));
});

test.run();
