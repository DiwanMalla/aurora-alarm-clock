import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenDimensions {
  window: ScaledSize;
  screen: ScaledSize;
}

export const useDeviceOrientation = () => {
  const [screenData, setScreenData] = useState<ScreenDimensions>(() => ({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  }));

  useEffect(() => {
    const onChange = (result: { window: ScaledSize; screen: ScaledSize }) => {
      setScreenData(result);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const isLandscape = screenData.window.width > screenData.window.height;
  const isTablet = Math.min(screenData.window.width, screenData.window.height) >= 768;

  return {
    ...screenData,
    isLandscape,
    isTablet,
    isPortrait: !isLandscape,
  };
};
