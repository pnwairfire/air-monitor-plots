import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { DateTime } from 'luxon';
import {
  requireLuxonDateTime,
  requireLuxonDateTimeArray
} from '../src/helpers.js';

// ─── Tests for requireLuxonDateTime ───────────────────────────────────────────

test('requireLuxonDateTime allows a valid Luxon DateTime', () => {
  const dt = DateTime.utc();
  assert.not.throws(() => requireLuxonDateTime(dt));
});

test('requireLuxonDateTime throws on native Date object', () => {
  const nativeDate = new Date();
  assert.throws(() => requireLuxonDateTime(nativeDate), /Luxon DateTime/);
});

test('requireLuxonDateTime throws on string', () => {
  assert.throws(() => requireLuxonDateTime('2025-07-04T12:00:00Z'), /Luxon DateTime/);
});

test('requireLuxonDateTime throws on null', () => {
  assert.throws(() => requireLuxonDateTime(null), /Luxon DateTime/);
});

// ─── Tests for requireLuxonDateTimeArray ──────────────────────────────────────

test('requireLuxonDateTimeArray allows valid array of DateTime', () => {
  const dts = [DateTime.utc(), DateTime.now()];
  assert.not.throws(() => requireLuxonDateTimeArray(dts));
});

test('requireLuxonDateTimeArray throws if any element is not a DateTime', () => {
  const mixed = [DateTime.utc(), new Date()];
  assert.throws(() => requireLuxonDateTimeArray(mixed), /not a Luxon DateTime/);
});

test('requireLuxonDateTimeArray throws if input is not an array', () => {
  assert.throws(() => requireLuxonDateTimeArray(DateTime.utc()), /array/);
});

test('requireLuxonDateTimeArray throws if null is passed', () => {
  assert.throws(() => requireLuxonDateTimeArray(null), /array/);
});

test('requireLuxonDateTimeArray throws if array contains null', () => {
  const arr = [DateTime.utc(), null];
  assert.throws(() => requireLuxonDateTimeArray(arr), /not a Luxon DateTime/);
});

test.run();
