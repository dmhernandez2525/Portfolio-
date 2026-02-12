import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTimeOfDay, isDaytime, isNighttime } from '../time-system';

describe('time-system', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockHour(hour: number) {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(hour);
  }

  describe('getTimeOfDay', () => {
    it('returns morning for hours 4-9', () => {
      for (const hour of [4, 5, 6, 7, 8, 9]) {
        mockHour(hour);
        expect(getTimeOfDay()).toBe('morning');
        vi.restoreAllMocks();
      }
    });

    it('returns day for hours 10-17', () => {
      for (const hour of [10, 11, 12, 13, 14, 15, 16, 17]) {
        mockHour(hour);
        expect(getTimeOfDay()).toBe('day');
        vi.restoreAllMocks();
      }
    });

    it('returns night for hours 18-3', () => {
      for (const hour of [18, 19, 20, 21, 22, 23, 0, 1, 2, 3]) {
        mockHour(hour);
        expect(getTimeOfDay()).toBe('night');
        vi.restoreAllMocks();
      }
    });

    it('covers all 24 hours without gaps', () => {
      const results = new Set<string>();
      for (let h = 0; h < 24; h++) {
        mockHour(h);
        results.add(getTimeOfDay());
        vi.restoreAllMocks();
      }
      expect(results).toEqual(new Set(['morning', 'day', 'night']));
    });
  });

  describe('isDaytime', () => {
    it('returns true during morning', () => {
      mockHour(7);
      expect(isDaytime()).toBe(true);
    });

    it('returns true during day', () => {
      mockHour(14);
      expect(isDaytime()).toBe(true);
    });

    it('returns false at night', () => {
      mockHour(22);
      expect(isDaytime()).toBe(false);
    });
  });

  describe('isNighttime', () => {
    it('returns true at night', () => {
      mockHour(22);
      expect(isNighttime()).toBe(true);
    });

    it('returns false during morning', () => {
      mockHour(7);
      expect(isNighttime()).toBe(false);
    });

    it('returns false during day', () => {
      mockHour(14);
      expect(isNighttime()).toBe(false);
    });
  });
});
