// diurnalPlot.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';

import {
  diurnalPlotConfig,
  small_diurnalPlotConfig
} from '../src/diurnalPlot.js';

// ─── Shared Mock Data ─────────────────────────────────────────────────────────

const datetime = Array.from({ length: 48 }, (_, i) =>
  DateTime.utc(2024, 1, 1, 0).plus({ hours: i })
);

const nowcast = Array.from({ length: 48 }, (_, i) => 5 + Math.sin(i / 2) * 10);
const hour_average = Array.from({ length: 24 }, (_, i) => 7 + Math.cos(i / 3) * 5);

const baseData = {
  datetime,
  nowcast,
  hour_average,
  locationName: 'Test Location',
  timezone: 'America/Los_Angeles',
  latitude: 37.7749,
  longitude: -122.4194
};

// ─── Main Plot Tests ──────────────────────────────────────────────────────────

test('diurnalPlotConfig sets title and includes three series', () => {
  const config = diurnalPlotConfig(baseData);
  assert.is(config.title.text, 'Test Location');
  assert.is(config.series.length, 3);
});

test('diurnalPlotConfig supports custom title override', () => {
  const config = diurnalPlotConfig({ ...baseData, title: 'Custom Title' });
  assert.is(config.title.text, 'Custom Title');
});

test('diurnalPlotConfig xAxis includes plotBands for sunrise/sunset', () => {
  const config = diurnalPlotConfig(baseData);
  assert.ok(config.xAxis.plotBands.length === 2);
  assert.ok(config.xAxis.plotBands[0].from < config.xAxis.plotBands[0].to);
});

test('diurnalPlotConfig yAxis includes AQI plotLines', () => {
  const config = diurnalPlotConfig(baseData);
  assert.ok(Array.isArray(config.yAxis.plotLines));
  assert.ok(config.yAxis.plotLines.length > 0);
});

test('diurnalPlotConfig uses correct series names', () => {
  const names = diurnalPlotConfig(baseData).series.map(s => s.name);
  assert.ok(names.includes('Today'));
  assert.ok(names.includes('Yesterday'));
  assert.ok(names.includes('7 Day Mean'));
});

// ─── Small Plot Tests ─────────────────────────────────────────────────────────

test('small_diurnalPlotConfig disables legend and axis labels', () => {
  const config = small_diurnalPlotConfig(baseData);
  assert.is(config.legend.enabled, false);
  assert.is(config.xAxis.labels.enabled, false);
});

test('small_diurnalPlotConfig includes three line series', () => {
  const config = small_diurnalPlotConfig(baseData);
  assert.is(config.series.length, 3);
  assert.ok(config.series.every(s => s.type === 'line'));
});

test('small_diurnalPlotConfig title style is compact', () => {
  const config = small_diurnalPlotConfig(baseData);
  assert.ok(config.title.style.fontSize);
});

// ─── Validation Tests ─────────────────────────────────────────────────────────

test('diurnalPlotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, datetime: ['2024-01-01T00:00:00Z'] };
  assert.throws(() => diurnalPlotConfig(badData), /Luxon DateTime/);
});

test('small_diurnalPlotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, datetime: [new Date()] };
  assert.throws(() => small_diurnalPlotConfig(badData), /Luxon DateTime/);
});

test.run();

