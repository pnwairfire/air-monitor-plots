import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';

import {
  timeseriesPlotConfig,
  small_timeseriesPlotConfig,
} from '../src/timeseriesPlot.js';

// Shared mock input
const baseData = {
  datetime: [DateTime.utc(2024, 1, 1, 0), DateTime.utc(2024, 1, 1, 1)],
  pm25: [10, 20],
  nowcast: [15, 18],
  locationName: 'Test Site',
  timezone: 'America/Los_Angeles',
};

// ─── Main Plot Tests ──────────────────────────────────────────────────────────

test('timeseriesPlotConfig sets time.timezone correctly', () => {
  const config = timeseriesPlotConfig(baseData);
  assert.ok(config.time);
  assert.is(config.time.timezone, 'America/Los_Angeles');
});

test('timeseriesPlotConfig sets xAxis.type to datetime', () => {
  const config = timeseriesPlotConfig(baseData);
  assert.is(config.xAxis.type, 'datetime');
});

test('timeseriesPlotConfig sets pointStart using toMillis()', () => {
  const config = timeseriesPlotConfig(baseData);
  const expected = baseData.datetime[0].toMillis();
  assert.is(config.series[0].pointStart, expected);
  assert.is(config.series[1].pointStart, expected);
});

test('timeseriesPlotConfig throws on invalid datetime', () => {
  const badData = { ...baseData, datetime: [new Date()] };
  assert.throws(() => timeseriesPlotConfig(badData), /Luxon DateTime/);
});

// ─── Small Plot Tests ─────────────────────────────────────────────────────────

test('small_timeseriesPlotConfig hides xAxis', () => {
  const config = small_timeseriesPlotConfig(baseData);
  assert.ok(config.xAxis);
  assert.is(config.xAxis.visible, false);
});

test('small_timeseriesPlotConfig sets correct time.timezone', () => {
  const config = small_timeseriesPlotConfig(baseData);
  assert.is(config.time.timezone, 'America/Los_Angeles');
});

test('small_timeseriesPlotConfig uses correct pointStart', () => {
  const config = small_timeseriesPlotConfig(baseData);
  const expected = baseData.datetime[0].toMillis();
  assert.is(config.series[0].pointStart, expected);
  assert.is(config.series[1].pointStart, expected);
});

test('small_timeseriesPlotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, datetime: ['2024-01-01T00:00:00Z'] };
  assert.throws(() => small_timeseriesPlotConfig(badData), /Luxon DateTime/);
});

test.run();
