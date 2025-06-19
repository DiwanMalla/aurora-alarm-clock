import { formatTimeString } from '../utils';

describe('Time Format Utilities', () => {
  it('should format time string in 12h format', () => {
    const result = formatTimeString('14:30', '12h');
    expect(result).toBe('02:30 PM');
  });

  it('should format time string in 24h format', () => {
    const result = formatTimeString('14:30', '24h');
    expect(result).toBe('14:30');
  });

  it('should format midnight correctly in 12h format', () => {
    const result = formatTimeString('00:00', '12h');
    expect(result).toBe('12:00 AM');
  });

  it('should format noon correctly in 12h format', () => {
    const result = formatTimeString('12:00', '12h');
    expect(result).toBe('12:00 PM');
  });

  it('should format time correctly in 24h format', () => {
    const result = formatTimeString('00:00', '24h');
    expect(result).toBe('00:00');
  });
});
