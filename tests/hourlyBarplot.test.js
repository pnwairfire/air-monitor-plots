// hourlyBarplot.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';

import {
  hourlyBarplotConfig,
  small_hourlyBarplotConfig
} from '../src/hourlyBarplot.js';

// ─── Shared Mock Data ─────────────────────────────────────────────────────────

const baseData = {
  datetime: [
    DateTime.utc(2024, 1, 1, 0),
    DateTime.utc(2024, 1, 1, 1),
    DateTime.utc(2024, 1, 1, 2)
  ],
  pm25: [8, 12, 18],
  nowcast: [10, 15, 20],
  locationName: 'Test Station',
  timezone: 'America/Los_Angeles'
};

// ─── Main Plot Tests ──────────────────────────────────────────────────────────

test('hourlyBarplotConfig sets correct title and timezone', () => {
  const config = hourlyBarplotConfig(baseData);
  assert.is(config.title.text, 'Test Station');
  assert.is(config.time.timezone, 'America/Los_Angeles');
});

test('hourlyBarplotConfig supports custom title override', () => {
  const config = hourlyBarplotConfig({ ...baseData, title: 'Custom Hourly' });
  assert.is(config.title.text, 'Custom Hourly');
});

test('hourlyBarplotConfig sets xAxis type to datetime', () => {
  const config = hourlyBarplotConfig(baseData);
  assert.is(config.xAxis.type, 'datetime');
});

test('hourlyBarplotConfig sets correct pointStart and interval', () => {
  const config = hourlyBarplotConfig(baseData);
  const expectedStart = baseData.datetime[0].toMillis();
  assert.is(config.series[0].pointStart, expectedStart);
  assert.is(config.series[0].pointInterval, 3600 * 1000);
});

test('hourlyBarplotConfig creates colored series data', () => {
  const config = hourlyBarplotConfig(baseData);
  const data = config.series[0].data;
  assert.is(data.length, 3);
  for (const point of data) {
    assert.ok(typeof point.y === 'number');
    assert.ok(typeof point.color === 'string');
  }
});

// ─── Small Plot Tests ─────────────────────────────────────────────────────────

test('small_hourlyBarplotConfig hides xAxis', () => {
  const config = small_hourlyBarplotConfig(baseData);
  assert.is(config.xAxis.visible, false);
});

test('small_hourlyBarplotConfig sets correct title style', () => {
  const config = small_hourlyBarplotConfig(baseData);
  assert.ok(config.title.style.fontSize);
});

test('small_hourlyBarplotConfig sets correct pointStart and interval', () => {
  const config = small_hourlyBarplotConfig(baseData);
  const expectedStart = baseData.datetime[0].toMillis();
  assert.is(config.series[0].pointStart, expectedStart);
  assert.is(config.series[0].pointInterval, 3600 * 1000);
});

// ─── Validation Tests ─────────────────────────────────────────────────────────

test('hourlyBarplotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, datetime: ['2024-01-01T00:00:00Z'] };
  assert.throws(() => hourlyBarplotConfig(badData), /Luxon DateTime/);
});

test('small_hourlyBarplotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, datetime: [new Date()] };
  assert.throws(() => small_hourlyBarplotConfig(badData), /Luxon DateTime/);
});

test.run();
