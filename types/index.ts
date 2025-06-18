// Common types used throughout the app

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface Theme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  error: string;
}

export interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

// API Response types
export interface APIResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

// Device info
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  isTablet: boolean;
  hasNotch: boolean;
  screenWidth: number;
  screenHeight: number;
}
