// src/helpers.js
import { DateTime } from 'luxon';

/**
 * Throws an error if the input is not a Luxon DateTime object.
 * @param {*} dt - The value to validate.
 * @param {string} name - Name of the variable for clearer error messages.
 */
export function requireLuxonDateTime(dt, name = 'datetime') {
  if (!DateTime.isDateTime(dt)) {
    throw new Error(`Expected '${name}' to be a Luxon DateTime object`);
  }
}

/**
 * Throws an error if any element in the array is not a Luxon DateTime object.
 * @param {Array} arr - Array to validate.
 * @param {string} name - Name of the array for clearer error messages.
 */
export function requireLuxonDateTimeArray(arr, name = 'datetime') {
  if (!Array.isArray(arr)) {
    throw new Error(`Expected '${name}' to be an array`);
  }
  arr.forEach((dt, i) => {
    if (!DateTime.isDateTime(dt)) {
      throw new Error(`Element at index ${i} in '${name}' is not a Luxon DateTime object`);
    }
  });
}
