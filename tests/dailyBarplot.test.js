// dailyBarplot.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';

import {
  dailyBarplotConfig,
  small_dailyBarplotConfig
} from '../src/dailyBarplot.js';

// ─── Shared Mock Data ─────────────────────────────────────────────────────────

const baseData = {
  daily_datetime: [
    DateTime.utc(2024, 1, 1),
    DateTime.utc(2024, 1, 2),
    DateTime.utc(2024, 1, 3)
  ],
  daily_mean: [5, 12, 35],
  locationName: 'Test Site',
  timezone: 'America/Los_Angeles'
};

// ─── Main Plot Tests ──────────────────────────────────────────────────────────

test('dailyBarplotConfig uses correct title and timezone', () => {
  const config = dailyBarplotConfig(baseData);
  assert.is(config.title.text, 'Test Site');
  assert.ok(config.xAxis.categories.every(cat => typeof cat === 'string'));
});

test('dailyBarplotConfig supports custom title override', () => {
  const config = dailyBarplotConfig({ ...baseData, title: 'Custom Title' });
  assert.is(config.title.text, 'Custom Title');
});

test('dailyBarplotConfig converts DateTime to local formatted string', () => {
  const config = dailyBarplotConfig(baseData);
  assert.ok(config.xAxis.categories.includes('Jan 01'));
});

test('dailyBarplotConfig maps daily_mean to series data with colors', () => {
  const config = dailyBarplotConfig(baseData);
  const dataPoints = config.series[0].data;
  assert.is(dataPoints.length, 3);
  for (const point of dataPoints) {
    assert.ok(typeof point.y === 'number');
    assert.ok(typeof point.color === 'string');
  }
});

// ─── Small Plot Tests ─────────────────────────────────────────────────────────

test('small_dailyBarplotConfig hides xAxis', () => {
  const config = small_dailyBarplotConfig(baseData);
  assert.is(config.xAxis.visible, false);
});

test('small_dailyBarplotConfig has compact title styling', () => {
  const config = small_dailyBarplotConfig(baseData);
  assert.ok(config.title.style.fontSize);
});

test('small_dailyBarplotConfig maps daily_mean to series data with colors', () => {
  const config = small_dailyBarplotConfig(baseData);
  const dataPoints = config.series[0].data;
  assert.is(dataPoints.length, 3);
  for (const point of dataPoints) {
    assert.ok(typeof point.y === 'number');
    assert.ok(typeof point.color === 'string');
  }
});

// ─── Validation Tests ─────────────────────────────────────────────────────────

test('dailyBarplotConfig throws if daily_datetime is not Luxon DateTime[]', () => {
  const badData = { ...baseData, daily_datetime: ['2024-01-01'] };
  assert.throws(() => dailyBarplotConfig(badData), /DateTime/);
});

test.run();
