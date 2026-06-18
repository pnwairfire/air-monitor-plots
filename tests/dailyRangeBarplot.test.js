// dailyRangeBarplot.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';

import {
  dailyRangeBarplotConfig,
  small_dailyRangeBarplotConfig
} from '../src/dailyRangeBarplot.js';

// ─── Shared Mock Data ─────────────────────────────────────────────────────────

const daily_datetime = [
  DateTime.utc(2024, 1, 1),
  DateTime.utc(2024, 1, 2),
  DateTime.utc(2024, 1, 3)
];

const baseData = {
  daily_datetime,
  daily_min: [5, 6, 8],
  daily_mean: [10, 15, 20],
  daily_max: [18, 24, 30],
  locationName: 'Test Station',
  timezone: 'America/Los_Angeles'
};

// ─── Main Plot Tests ──────────────────────────────────────────────────────────

test('dailyRangeBarplotConfig sets title and categories', () => {
  const config = dailyRangeBarplotConfig(baseData);
  assert.is(config.title.text, 'Test Station');
  assert.ok(Array.isArray(config.xAxis.categories));
  assert.ok(config.xAxis.categories[0].includes('Dec')); // 2024-01-01 00:00:00 UTC = 2023-12-31 17:00:00 PST
  assert.ok(config.xAxis.categories[1].includes('Jan')); // 2024-01-02 00:00:00 UTC = 2024-01-01 17:00:00 PST
});

test('dailyRangeBarplotConfig supports custom title override', () => {
  const config = dailyRangeBarplotConfig({ ...baseData, title: 'Custom Title' });
  assert.is(config.title.text, 'Custom Title');
});

test('dailyRangeBarplotConfig defines columnrange and scatter series', () => {
  const config = dailyRangeBarplotConfig(baseData);
  const [range, mean] = config.series;
  assert.is(range.type, 'columnrange');
  assert.is(mean.type, 'scatter');
  assert.is(range.data.length, 3);
  assert.is(mean.data.length, 3);
});

test('dailyRangeBarplotConfig uses correct yAxis and plotLines', () => {
  const config = dailyRangeBarplotConfig(baseData);
  assert.is(config.yAxis.min, 0);
  assert.ok(config.yAxis.plotLines.length > 0);
});

const spikeData = {
  daily_datetime,
  daily_min: [5, 6, 8],
  daily_mean: [10, 11, 12],
  daily_max: [18, 24, 250],
  locationName: 'Spike Station',
  timezone: 'America/Los_Angeles'
};

test('dailyRangeBarplotConfig yAxis.max covers daily_max spikes', () => {
  const config = dailyRangeBarplotConfig(spikeData);
  assert.ok(
    config.yAxis.max >= Math.max(...spikeData.daily_max),
    `yAxis.max (${config.yAxis.max}) must cover daily_max (${Math.max(...spikeData.daily_max)})`
  );
});

test('small_dailyRangeBarplotConfig yAxis.max covers daily_max spikes', () => {
  const config = small_dailyRangeBarplotConfig(spikeData);
  assert.ok(
    config.yAxis.max >= Math.max(...spikeData.daily_max),
    `yAxis.max (${config.yAxis.max}) must cover daily_max (${Math.max(...spikeData.daily_max)})`
  );
});

// ─── Small Plot Tests ─────────────────────────────────────────────────────────

test('small_dailyRangeBarplotConfig hides xAxis', () => {
  const config = small_dailyRangeBarplotConfig(baseData);
  assert.is(config.xAxis.visible, false);
});

test('small_dailyRangeBarplotConfig disables legend and styles title', () => {
  const config = small_dailyRangeBarplotConfig(baseData);
  assert.is(config.legend.enabled, false);
  assert.ok(config.title.style.fontSize);
});

test('small_dailyRangeBarplotConfig defines compact series', () => {
  const config = small_dailyRangeBarplotConfig(baseData);
  const [range, mean] = config.series;
  assert.is(range.type, 'columnrange');
  assert.is(mean.type, 'scatter');
  assert.is(range.data.length, 3);
  assert.is(mean.data.length, 3);
});

// ─── Validation Tests ─────────────────────────────────────────────────────────

test('dailyRangeBarplotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, daily_datetime: ['2024-01-01'] };
  assert.throws(() => dailyRangeBarplotConfig(badData), /Luxon DateTime/);
});

test('small_dailyRangeBarplotConfig throws on non-DateTime input', () => {
  const badData = { ...baseData, daily_datetime: [new Date()] };
  assert.throws(() => small_dailyRangeBarplotConfig(badData), /Luxon DateTime/);
});

test('dailyRangeBarplotConfig throws on daily_max length mismatch', () => {
  const badData = { ...baseData, daily_max: [18, 24] };
  assert.throws(() => dailyRangeBarplotConfig(badData), /daily_max/);
});

test('dailyRangeBarplotConfig throws on invalid daily_min value', () => {
  const badData = { ...baseData, daily_min: [5, 'bad', 8] };
  assert.throws(() => dailyRangeBarplotConfig(badData), /daily_min/);
});

test.run();
