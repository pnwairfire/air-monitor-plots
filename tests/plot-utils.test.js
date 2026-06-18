
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';
import {
  pm25ToAQC,
  pm25ToColor,
  pm25ToYMax,
  pm25_AQILines,
  validatePlotArrays,
  validateDailyArrays,
  validateDiurnalInputs,
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

// ─── validatePlotArrays ordering ──────────────────────────────────────────────

test('validatePlotArrays reports non-DateTime before length mismatch', () => {
  // datetime is both non-DateTime AND a different length than the value arrays.
  // The datetime structural error should win so plots surface it consistently.
  const datetime = [new Date()];
  const pm25 = [10, 20];
  const nowcast = [12, 18];
  assert.throws(() => validatePlotArrays(datetime, pm25, nowcast), /Luxon DateTime/);
});

// ─── validateDailyArrays ──────────────────────────────────────────────────────

const dailyDts = [
  DateTime.utc(2024, 1, 1),
  DateTime.utc(2024, 1, 2),
  DateTime.utc(2024, 1, 3)
];

test('validateDailyArrays accepts a single matching value array', () => {
  assert.not.throws(() => validateDailyArrays(dailyDts, { daily_mean: [1, 2, 3] }));
});

test('validateDailyArrays accepts multiple matching value arrays', () => {
  assert.not.throws(() =>
    validateDailyArrays(dailyDts, {
      daily_min: [1, 2, 3],
      daily_mean: [2, 3, 4],
      daily_max: [3, 4, 5]
    })
  );
});

test('validateDailyArrays allows null values', () => {
  assert.not.throws(() => validateDailyArrays(dailyDts, { daily_mean: [1, null, 3] }));
});

test('validateDailyArrays throws on non-DateTime datetime', () => {
  assert.throws(
    () => validateDailyArrays(['2024-01-01'], { daily_mean: [1] }),
    /Luxon DateTime/
  );
});

test('validateDailyArrays throws on length mismatch and names the field', () => {
  assert.throws(
    () => validateDailyArrays(dailyDts, { daily_mean: [1, 2] }),
    /daily_mean/
  );
});

test('validateDailyArrays throws on invalid value and names the field', () => {
  assert.throws(
    () => validateDailyArrays(dailyDts, { daily_max: [1, 'bad', 3] }),
    /daily_max/
  );
});

// ─── validateDiurnalInputs ────────────────────────────────────────────────────

const diurnalDts = Array.from({ length: 48 }, (_, i) =>
  DateTime.utc(2024, 1, 1, 0).plus({ hours: i })
);
const diurnalBase = {
  datetime: diurnalDts,
  nowcast: Array.from({ length: 48 }, (_, i) => 5 + i),
  hour_average: Array.from({ length: 24 }, (_, i) => 7 + i),
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles'
};

test('validateDiurnalInputs accepts valid input', () => {
  assert.not.throws(() => validateDiurnalInputs(diurnalBase));
});

test('validateDiurnalInputs throws on non-DateTime datetime', () => {
  assert.throws(
    () => validateDiurnalInputs({ ...diurnalBase, datetime: ['2024-01-01'] }),
    /Luxon DateTime/
  );
});

test('validateDiurnalInputs throws on nowcast length mismatch', () => {
  assert.throws(
    () => validateDiurnalInputs({ ...diurnalBase, nowcast: [1, 2, 3] }),
    /nowcast/
  );
});

test('validateDiurnalInputs throws on empty hour_average', () => {
  assert.throws(
    () => validateDiurnalInputs({ ...diurnalBase, hour_average: [] }),
    /hour_average/
  );
});

test('validateDiurnalInputs throws on non-finite latitude', () => {
  assert.throws(
    () => validateDiurnalInputs({ ...diurnalBase, latitude: undefined }),
    /latitude/
  );
});

test('validateDiurnalInputs throws on non-finite longitude', () => {
  assert.throws(
    () => validateDiurnalInputs({ ...diurnalBase, longitude: NaN }),
    /longitude/
  );
});

test('validateDiurnalInputs throws when datetime is too short to slice yesterday/today', () => {
  const shortDts = Array.from({ length: 12 }, (_, i) =>
    DateTime.utc(2024, 1, 1, 0).plus({ hours: i })
  );
  assert.throws(
    () =>
      validateDiurnalInputs({
        ...diurnalBase,
        datetime: shortDts,
        nowcast: Array.from({ length: 12 }, (_, i) => i)
      }),
    /too short|yesterday/i
  );
});

// ─── pm25_addAQIStackedBar ────────────────────────────────────────────────────

test('pm25_addAQIStackedBar fails gracefully with bad chart', () => {
  assert.not.throws(() => pm25_addAQIStackedBar(null));
  assert.not.throws(() => pm25_addAQIStackedBar({}));
});

test.run();
