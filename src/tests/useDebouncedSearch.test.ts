import { renderHook, act } from '@testing-library/react-native';
import { useDebouncedSearch } from '@tasks/hooks/useDebouncedSearch';

/**
 * Test 3 of 3 required: debounced search. Uses Jest fake timers so the test
 * doesn't actually wait 300 real milliseconds (and, more importantly, so
 * timing is deterministic instead of depending on how fast the CI machine
 * happens to run test code that day).
 *
 * Note: @testing-library/react-native v14 made renderHook/rerender/unmount/
 * act all return Promises (async act internally, for Suspense/use()
 * compatibility) - every call below is awaited accordingly.
 */
describe('useDebouncedSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately on mount', async () => {
    const { result } = await renderHook(() => useDebouncedSearch('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does NOT update before the delay has elapsed', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedSearch(value, 300),
      { initialProps: { value: '' } },
    );

    await rerender({ value: 'mob' });

    await act(() => {
      jest.advanceTimersByTime(299);
    });

    // Still the old value - the 300ms window hasn't closed yet.
    expect(result.current).toBe('');
  });

  it('updates to the latest value once exactly 300ms have elapsed', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedSearch(value, 300),
      { initialProps: { value: '' } },
    );

    await rerender({ value: 'mobile' });

    await act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('mobile');
  });

  it('collapses a fast burst of keystrokes into a single update (the whole point of debouncing)', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedSearch(value, 300),
      { initialProps: { value: '' } },
    );

    // Simulates typing "m", "mo", "mob" with 100ms between keystrokes -
    // each keystroke arrives before the previous 300ms timer would fire,
    // so it should be cancelled and restarted, never contributing an
    // intermediate debounced value.
    await rerender({ value: 'm' });
    await act(() => {
      jest.advanceTimersByTime(100);
    });
    await rerender({ value: 'mo' });
    await act(() => {
      jest.advanceTimersByTime(100);
    });
    await rerender({ value: 'mob' });
    await act(() => {
      jest.advanceTimersByTime(100);
    });

    // Only 300ms total has passed and the value kept changing throughout,
    // so nothing should have committed yet.
    expect(result.current).toBe('');

    // Now let the final 300ms window (from the "mob" render) elapse.
    await act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('mob');
  });

  it('clears its pending timeout on unmount (no state update after unmount)', async () => {
    const { unmount } = await renderHook(() => useDebouncedSearch('x', 300));
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

    await unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
