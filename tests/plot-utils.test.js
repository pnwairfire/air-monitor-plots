// tests/plot-utils.test.js

import { test } from 'uvu';
import * as assert from 'uvu/assert';

import {
  pm25ToAQC,
  pm25ToColor,
  pm25ToYMax,
  pm25_AQILines
} from '../src/index.js';

//
// Test data
//

const testPM25 = [0, null, 9, 10, 30, 40, null, 50, 60, 180, 300];
const expectedAQC = [
  1,   // 0
  null,
  1,   // 9
  2,   // 10
  2,   // 30
  3,   // 40
  null,
  3,   // 50
  4,   // 60
  5,   // 180
  6    // 300
];

const expectedColors = [
  'rgb(0,255,0)',
  'rgb(187,187,187)',
  'rgb(0,255,0)',
  'rgb(255,255,0)',
  'rgb(255,255,0)',
  'rgb(255,126,0)',
  'rgb(187,187,187)',
  'rgb(255,126,0)',
  'rgb(255,0,0)',
  'rgb(143,63,151)',
  'rgb(126,0,35)'
];

const expectedYMax = [
  50,  // 0
  50,  // null
  50,  // 9
  50,  // 10
  50,  // 30
  50,  // 40
  50,  // null
  50,  // 50
  100, // 60
  200, // 180
  500  // 300
];

// Edge cases for bad input
const invalidInputs = [NaN, '42', true, {}, [], undefined];
const invalidYMaxDefaults = [50, 50, 50, 50, 50, 50];
const invalidAQCDefaults = [null, null, null, null, null, null];
const invalidColorDefaults = [
  'rgb(187,187,187)',
  'rgb(187,187,187)',
  'rgb(187,187,187)',
  'rgb(187,187,187)',
  'rgb(187,187,187)',
  'rgb(187,187,187)'
];

//
// Tests
//

test('pm25ToAQC() correctly classifies PM2.5 values', () => {
  const results = testPM25.map(pm25ToAQC);
  assert.equal(results, expectedAQC);
});

test('pm25ToAQC() returns null for invalid input', () => {
  const results = invalidInputs.map(pm25ToAQC);
  assert.equal(results, invalidAQCDefaults);
});

test('pm25ToColor() returns expected RGB strings', () => {
  const results = testPM25.map(pm25ToColor);
  assert.equal(results, expectedColors);
});

test('pm25ToColor() returns fallback for invalid input', () => {
  const results = invalidInputs.map(pm25ToColor);
  assert.equal(results, invalidColorDefaults);
});

test('pm25ToYMax() returns expected scale values', () => {
  const results = testPM25.map(pm25ToYMax);
  assert.equal(results, expectedYMax);
});


test('pm25ToYMax() defaults to 50 for invalid input', () => {
  const results = invalidInputs.map(pm25ToYMax);
  assert.equal(results, invalidYMaxDefaults);
});

test('pm25_AQILines() returns correct Highcharts config lines', () => {
  const lines = pm25_AQILines(3);
  assert.is(Array.isArray(lines), true);
  assert.is(lines.length, 5);
  assert.equal(Object.keys(lines[0]).sort(), ['color', 'value', 'width']);
  assert.type(lines[0].value, 'number');
  assert.is(lines[0].width, 3);
});

test.run();
