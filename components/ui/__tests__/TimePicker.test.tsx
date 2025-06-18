import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimePicker } from '../TimePicker';

describe('TimePicker', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: new Date(2024, 0, 1, 9, 30), // 9:30 AM
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<TimePicker {...defaultProps} />);

    expect(getByTestId('time-picker')).toBeTruthy();
    expect(getByTestId('time-picker-hours')).toBeTruthy();
    expect(getByTestId('time-picker-minutes')).toBeTruthy();
  });

  it('renders in 12h mode by default', () => {
    const { getByTestId } = render(<TimePicker {...defaultProps} />);

    expect(getByTestId('time-picker-period')).toBeTruthy();
  });

  it('renders in 24h mode when specified', () => {
    const { queryByTestId } = render(<TimePicker {...defaultProps} mode="24h" />);

    expect(queryByTestId('time-picker-period')).toBeNull();
  });

  it('calls onChange when hour is selected', () => {
    const { getByTestId } = render(<TimePicker {...defaultProps} />);

    const hourItem = getByTestId('time-picker-hours-item-0');
    fireEvent.press(hourItem);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when minute is selected', () => {
    const { getByTestId } = render(<TimePicker {...defaultProps} />);

    const minuteItem = getByTestId('time-picker-minutes-item-0');
    fireEvent.press(minuteItem);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when period is selected in 12h mode', () => {
    const { getByTestId } = render(<TimePicker {...defaultProps} />);

    const periodItem = getByTestId('time-picker-period-item-1');
    fireEvent.press(periodItem);

    expect(mockOnChange).toHaveBeenCalled();
  });
});
