import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { validatePlotArrays } from '../src/plot-utils.js';

function makeUTCDate(hoursOffset = 0) {
  return new Date(Date.UTC(2023, 6, 1, hoursOffset)); // July 1, 2023, + hours
}

// //
// // Valid input
// //
// test('validatePlotArrays() accepts valid input without throwing', () => {
//   const datetime = [makeUTCDate(0), makeUTCDate(1), makeUTCDate(2)];
//   const pm25 = [5, 10, 15];
//   const nowcast = [4, 9, 14];
//   assert.not.throws(() => validatePlotArrays(datetime, pm25, nowcast));
// });

//
// Mismatched lengths
//
test('throws if arrays are not same length', () => {
  const dt = [makeUTCDate(0), makeUTCDate(1)];
  const pm = [5, 10, 15];
  const nc = [4, 9, 14];
  assert.throws(() => validatePlotArrays(dt, pm, nc));
});

//
// Invalid Date objects
//
test('throws on non-Date or invalid Date', () => {
  const dt = [makeUTCDate(0), new Date('invalid')];
  const pm = [5, 10];
  const nc = [4, 9];
  assert.throws(() => validatePlotArrays(dt, pm, nc));
});

//
// Non-UTC Date
//
test('throws on non-UTC Date (with timezone offset)', () => {
  const localDate = new Date(2023, 6, 1, 12); // local time
  const dt = [makeUTCDate(0), localDate];
  const pm = [5, 10];
  const nc = [4, 9];
  assert.throws(() => validatePlotArrays(dt, pm, nc));
});

//
// Invalid pm25 or nowcast entries
//
test('throws on invalid pm25 values', () => {
  const dt = [makeUTCDate(0), makeUTCDate(1)];
  const pm = [5, 'bad'];
  const nc = [4, 9];
  assert.throws(() => validatePlotArrays(dt, pm, nc));
});

test('throws on invalid nowcast values', () => {
  const dt = [makeUTCDate(0), makeUTCDate(1)];
  const pm = [5, 10];
  const nc = [4, NaN];
  assert.throws(() => validatePlotArrays(dt, pm, nc));
});

// //
// // Non-increasing datetime triggers console warning
// //
// test('logs warning if datetime is not strictly increasing', () => {
//   const dt = [makeUTCDate(2), makeUTCDate(1), makeUTCDate(3)];
//   const pm = [5, 10, 15];
//   const nc = [4, 9, 14];

//   let warned = false;
//   const originalWarn = console.warn;
//   console.warn = (msg) => {
//     if (msg.includes("datetime array is not strictly increasing")) warned = true;
//   };

//   validatePlotArrays(dt, pm, nc);
//   console.warn = originalWarn;
//   assert.ok(warned);
// });

test.run();
