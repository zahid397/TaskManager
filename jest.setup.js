/**
 * Global Jest setup. Kept intentionally small: the required tests
 * (filter/sort, star-merge, debounce) are pure-logic and don't touch any
 * native module, so most of this only exists to support the optional bonus
 * cache round-trip test (src/tests/cache.test.ts).
 */

// Official mock shipped by the library itself - swaps the real native
// module for an in-memory Map so tests never touch a real device/simulator.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
