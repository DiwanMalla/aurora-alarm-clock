// Simple beep sound data URI (Base64 encoded WAV)
export const TIMER_BEEP_SOUND =
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEbBSuTzO/SfS0ELYPa/Jd4IAr+Yj8=';

// Alternative: Create a simple programmatic beep
export const playBeepSound = () => {
  // For now, we'll just use Alert as a placeholder
  // In a real implementation, you'd use expo-av or react-native-sound
  // eslint-disable-next-line no-undef
  console.log('🔔 Timer beep!');
};
