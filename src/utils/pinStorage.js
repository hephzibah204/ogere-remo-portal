/**
 * pinStorage.js
 * Persists the citizen's Safe Arrival PIN and Covert Duress PIN in localStorage.
 * Provides getter / setter helpers with sensible defaults.
 */

const SAFE_PIN_KEY = 'ogere_safe_pin';
const DURESS_PIN_KEY = 'ogere_duress_pin';

const DEFAULT_SAFE_PIN = '';      // No default safe pin — user must set one
const DEFAULT_DURESS_PIN = '9999'; // Fallback for new users

/**
 * @returns {string} The saved safe-arrival PIN, or '' if none set.
 */
export function getSafePin() {
  try {
    return localStorage.getItem(SAFE_PIN_KEY) || DEFAULT_SAFE_PIN;
  } catch {
    return DEFAULT_SAFE_PIN;
  }
}

/**
 * @returns {string} The saved duress PIN, or '9999' if none set.
 */
export function getDuressPin() {
  try {
    return localStorage.getItem(DURESS_PIN_KEY) || DEFAULT_DURESS_PIN;
  } catch {
    return DEFAULT_DURESS_PIN;
  }
}

/**
 * Persist the safe-arrival PIN.
 * @param {string} pin - 4-digit numeric string
 */
export function setSafePin(pin) {
  try {
    localStorage.setItem(SAFE_PIN_KEY, pin);
  } catch {
    // Storage unavailable — silently fail (demo)
  }
}

/**
 * Persist the duress PIN.
 * @param {string} pin - 4-digit numeric string
 */
export function setDuressPin(pin) {
  try {
    localStorage.setItem(DURESS_PIN_KEY, pin);
  } catch {
    // Storage unavailable — silently fail (demo)
  }
}
